require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// File upload and S3
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const upload = multer({ storage: multer.memoryStorage() });

const { NodeHttpHandler } = require('@smithy/node-http-handler');
const https = require('https');

// Use a custom https agent to bypass SSL certificate verification when needed
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'rizyyn';
const PRESIGN_EXPIRY = parseInt(process.env.PRESIGN_EXPIRY || '3600', 10);
const AUTH_ENABLED = (process.env.AUTH_ENABLED || 'true').toLowerCase() !== 'false';
const AUTH_USERNAME = process.env.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'admin123';
const AUTH_SESSION_TTL = parseInt(process.env.AUTH_SESSION_TTL || '86400', 10);
const missingS3Credentials = !S3_ACCESS_KEY || !S3_SECRET_KEY;
const sessions = new Map();
const gamsitRooms = new Map();
const GAMSIT_CHOICES = ['rock', 'paper', 'scissors'];

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.nevaobjects.id',
  credentials: missingS3Credentials
    ? undefined
    : {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({ httpsAgent }),
});

console.log('S3 config:', {
  endpoint: process.env.S3_ENDPOINT,
  bucket: S3_BUCKET,
  region: process.env.S3_REGION,
  missingCredentials: missingS3Credentials,
});

async function streamToString(stream) {
  if (!stream) return null;
  if (typeof stream === 'string') return stream;
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on && stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on && stream.on('error', reject);
    stream.on && stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    // Fallback if stream is a Uint8Array or Buffer
    try {
      if (Buffer.isBuffer(stream)) return resolve(stream.toString('utf8'));
    } catch (e) {}
  });
}

function encodeKeyForUrl(key) {
  return key.split('/').map(encodeURIComponent).join('/');
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (key) acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=${AUTH_SESSION_TTL}; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}

function createSession(username) {
  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, { sessionId, username, role: 'editor', expiresAt: Date.now() + AUTH_SESSION_TTL * 1000 });
  return sessionId;
}

function getSession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function requireEditor(req, res, next) {
  if (!AUTH_ENABLED) return next();
  const session = getSession(req);
  if (!session || session.role !== 'editor') {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.authUser = session;
  next();
}

async function getPresignedUrl(key) {
  if (!key) return null;
  try {
    const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: PRESIGN_EXPIRY });
    return url;
  } catch (e) {
    console.warn('Warning: Could not generate presigned url for', key, e.message);
    return null;
  }
}

// Routes
app.get('/api/auth/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ authenticated: false, role: 'viewer' });
  return res.json({ authenticated: true, role: session.role, username: session.username });
});

app.post('/api/auth/login', express.json(), (req, res) => {
  const { username, password } = req.body || {};
  if (!AUTH_ENABLED) {
    return res.json({ success: true, authenticated: true, role: 'editor' });
  }
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    const sessionId = createSession(username);
    setSessionCookie(res, sessionId);
    return res.json({ success: true, authenticated: true, role: 'editor' });
  }
  return res.status(401).json({ error: 'Invalid username or password.' });
});

app.post('/api/auth/logout', (req, res) => {
  clearSessionCookie(res);
  const session = getSession(req);
  if (session) sessions.delete(session.sessionId);
  return res.json({ success: true });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to RizYun API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// List top-level folders (albums)
app.get('/api/albums', async (req, res, next) => {
  try {
    if (missingS3Credentials) {
      return res.status(500).json({
        error: 'S3 credentials are not configured. Set S3_ACCESS_KEY and S3_SECRET_KEY in .env.',
      });
    }

    const params = { Bucket: S3_BUCKET, Delimiter: '/' };
    const data = await s3Client.send(new ListObjectsV2Command(params));

    const prefixes = (data.CommonPrefixes || []).map(p => p.Prefix.replace(/\/$/, ''));

    // For each prefix, get a sample object and count
    const albums = await Promise.all(prefixes.map(async (prefix) => {
      try {
        const listParams = { Bucket: S3_BUCKET, Prefix: prefix + '/', MaxKeys: 1000 };
        const objs = await s3Client.send(new ListObjectsV2Command(listParams));
        const contents = objs.Contents || [];
        const thumbnailItem = contents.find(c => c.Key.endsWith('/thumbnail'));
        const photos = contents.filter(c => !c.Key.endsWith('.keep') && !c.Key.endsWith('/thumbnail'));
        const count = photos.length;
        const sampleKey = thumbnailItem ? thumbnailItem.Key : photos[0] ? photos[0].Key : null;
        const sampleUrl = sampleKey ? await getPresignedUrl(sampleKey) : null;
        return { name: prefix, prefix: prefix + '/', count, sampleUrl };
      } catch (albumErr) {
        console.warn(`Warning listing album ${prefix}:`, albumErr.message);
        return { name: prefix, prefix: prefix + '/', count: 0, sampleUrl: null };
      }
    }));

    res.json({ albums });
  } catch (err) {
    console.error('Error listing albums:', err);
    next(err);
  }
});

// Create a new album (create a placeholder object to create the prefix)
app.post('/api/albums', express.json(), requireEditor, async (req, res, next) => {
  try {
    const { name } = req.body;
    console.log('Create album request body:', req.body);
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Missing album name' });
    const clean = name.trim();
    if (!clean) return res.status(400).json({ error: 'Invalid album name' });
    if (/\//.test(clean)) return res.status(400).json({ error: 'Album name cannot contain "/"' });

    const key = `${clean}/.keep`;
    console.log('Create album S3 params:', { Bucket: S3_BUCKET, Key: key, endpoint: process.env.S3_ENDPOINT, region: process.env.S3_REGION });
    const params = { Bucket: S3_BUCKET, Key: key, Body: Buffer.from('album placeholder'), ContentType: 'application/octet-stream' };
    await s3Client.send(new PutObjectCommand(params));

    res.status(201).json({ success: true, album: clean });
  } catch (err) {
    console.error('Error creating album:', err.name, err.message, err.Code, err.RequestId, err.$metadata?.httpStatusCode);
    try {
      const rawBody = err.$response ? await streamToString(err.$response.body) : null;
      console.error('Error creating album details:', {
        name: err.name,
        message: err.message,
        code: err.Code,
        requestId: err.RequestId,
        statusCode: err.$metadata?.httpStatusCode,
        rawBody,
      });
    } catch (dumpErr) {
      console.error('Error while dumping create album response body:', dumpErr);
    }
    next(err);
  }
});

// Upload or update album thumbnail
app.post('/api/albums/:name/thumbnail', upload.single('thumbnail'), requireEditor, async (req, res, next) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    if (!req.file) return res.status(400).json({ error: 'No thumbnail file uploaded' });

    const clean = name.replace(/\/+$/, '');
    const key = `${clean}/thumbnail`;
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    await s3Client.send(new PutObjectCommand(params));
    const baseUrl = process.env.S3_BASE_URL || process.env.S3_ENDPOINT || 'https://s3.nevaobjects.id';
    const url = `${baseUrl}/${S3_BUCKET}/${key}`;
    res.status(201).json({ success: true, key, url });
  } catch (err) {
    console.error('Error uploading thumbnail:', err);
    next(err);
  }
});

// Upload one or more photos inside an album
app.post('/api/albums/:name/photos', upload.array('file'), requireEditor, async (req, res, next) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No photo file uploaded' });

    const clean = name.replace(/\/+$|^\/+|\.\.+/g, '');
    const results = await Promise.all(files.map(async (file) => {
      const timestamp = Date.now();
      const key = `${clean}/${timestamp}-${file.originalname}`;
      const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await s3Client.send(new PutObjectCommand(params));
      const baseUrl = process.env.S3_BASE_URL || process.env.S3_ENDPOINT || 'https://s3.nevaobjects.id';
      const url = `${baseUrl}/${S3_BUCKET}/${key}`;
      return { success: true, key, url };
    }));

    res.status(201).json({ files: results });
  } catch (err) {
    console.error('Error uploading photo:', err);
    next(err);
  }
});

// Generic album upload endpoint (thumbnail or photo)
app.post('/api/albums/:name/upload', upload.any(), requireEditor, async (req, res, next) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No file uploaded' });

    const file = files[0];
    const clean = name.replace(/\/+$|^\/+|\.\.+/g, '');
    const isThumbnail = file.fieldname === 'thumbnail' || req.body.type === 'thumbnail';
    const key = isThumbnail ? `${clean}/thumbnail` : `${clean}/${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3Client.send(new PutObjectCommand(params));

    const baseUrl = process.env.S3_BASE_URL || process.env.S3_ENDPOINT || 'https://s3.nevaobjects.id';
    const url = `${baseUrl}/${S3_BUCKET}/${key}`;
    res.status(201).json({ success: true, key, url, type: isThumbnail ? 'thumbnail' : 'photo' });
  } catch (err) {
    console.error('Error uploading album file:', err);
    next(err);
  }
});

// Delete an object from an album
app.delete('/api/albums/:name/files', express.json(), requireEditor, async (req, res, next) => {
  try {
    const name = req.params.name;
    const { key } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    if (!key || typeof key !== 'string') return res.status(400).json({ error: 'Missing key to delete' });

    const cleanName = name.replace(/\/+$|^\/+/g, '');
    const cleanKey = key.replace(/^\/+/g, '').replace(/\/+$/g, '');
    if (!cleanKey.startsWith(`${cleanName}/`)) return res.status(400).json({ error: 'Invalid key for album' });

    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: cleanKey }));
    res.json({ success: true, key: cleanKey });
  } catch (err) {
    console.error('Error deleting album object:', err);
    next(err);
  }
});

// List objects inside an album (folder)
app.get('/api/albums/:name', async (req, res, next) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    const prefix = name.replace(/\/$/, '') + '/';
    const params = { Bucket: S3_BUCKET, Prefix: prefix, MaxKeys: 1000 };
    const data = await s3Client.send(new ListObjectsV2Command(params));
    const contents = await Promise.all((data.Contents || []).map(async (obj) => {
      const presigned = await getPresignedUrl(obj.Key);
      return { key: obj.Key, size: obj.Size, lastModified: obj.LastModified, url: presigned };
    }));
    res.json({ album: name, items: contents });
  } catch (err) {
    console.error('Error listing album contents:', err);
    next(err);
  }
});

app.get('/api/albums/:name/download', async (req, res, next) => {
  try {
    const name = req.params.name;
    const key = req.query.key;
    if (!name) return res.status(400).json({ error: 'Missing album name' });
    if (!key) return res.status(400).json({ error: 'Missing object key' });
    const cleanName = name.replace(/\/+$/g, '');
    const cleanKey = key.replace(/^\/+|\/+$/g, '');
    if (!cleanKey.startsWith(`${cleanName}/`)) return res.status(400).json({ error: 'Invalid object key for album' });
    const url = await getPresignedUrl(cleanKey);
    if (!url) return res.status(500).json({ error: 'Unable to generate download URL' });
    res.redirect(url);
  } catch (err) {
    console.error('Error generating download URL:', err);
    next(err);
  }
});

// Upload file to S3
function generateRoomId() {
  return crypto.randomBytes(3).toString('hex');
}

function generatePlayerId() {
  return crypto.randomBytes(16).toString('hex');
}

function getPlayerKey(room, playerId) {
  if (!room || !playerId) return null;
  if (room.players.p1?.playerId === playerId) return 'p1';
  if (room.players.p2?.playerId === playerId) return 'p2';
  return null;
}

function getRoomState(room, playerId, baseUrl) {
  const playerKey = getPlayerKey(room, playerId);
  const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';
  const player = playerKey ? room.players[playerKey] : null;
  const opponent = room.players[opponentKey] || null;
  const result = room.result || null;
  let displayResult = null;
  if (result) {
    if (result.winner === 'draw') displayResult = 'draw';
    else if (result.winner === playerKey) displayResult = 'win';
    else displayResult = 'lose';
  }

  return {
    roomId: room.roomId,
    status: room.status,
    role: playerKey,
    playerId: player?.playerId || null,
    playerCount: [room.players.p1, room.players.p2].filter(Boolean).length,
    yourChoice: player?.choice || null,
    opponentConnected: !!opponent,
    opponentChoice: room.status === 'finished' ? opponent?.choice || null : null,
    result: displayResult,
    winner: result?.winner || null,
    choices: result?.choices || null,
    roomUrl: `${baseUrl}/gamsit.html?room=${room.roomId}`,
  };
}

function determineWinner(choice1, choice2) {
  if (choice1 === choice2) return 'draw';
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return 'p1';
  }
  return 'p2';
}

app.post('/api/gamsit/create-room', async (req, res) => {
  const roomId = generateRoomId();
  const playerId = generatePlayerId();
  const room = {
    roomId,
    createdAt: Date.now(),
    players: {
      p1: { playerId, choice: null },
      p2: null,
    },
    status: 'waiting',
    result: null,
  };
  gamsitRooms.set(roomId, room);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    roomId,
    roomUrl: `${baseUrl}/gamsit.html?room=${roomId}`,
    playerId,
    role: 'p1',
    status: room.status,
  });
});

app.post('/api/gamsit/room/:roomId/join', async (req, res) => {
  const roomId = req.params.roomId;
  const { playerId } = req.body || {};
  const room = gamsitRooms.get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  if (room.players.p1?.playerId === playerId) {
    return res.json(getRoomState(room, playerId, `${req.protocol}://${req.get('host')}`));
  }
  if (room.players.p2?.playerId === playerId) {
    return res.json(getRoomState(room, playerId, `${req.protocol}://${req.get('host')}`));
  }

  if (!room.players.p2) {
    const newPlayerId = playerId || generatePlayerId();
    room.players.p2 = { playerId: newPlayerId, choice: null };
    room.status = 'ready';
    return res.json(getRoomState(room, newPlayerId, `${req.protocol}://${req.get('host')}`));
  }

  return res.status(409).json({ error: 'Room is already full' });
});

app.get('/api/gamsit/room/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  const playerId = req.query.playerId;
  const room = gamsitRooms.get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!playerId) return res.status(400).json({ error: 'Missing playerId' });
  const roomState = getRoomState(room, playerId, `${req.protocol}://${req.get('host')}`);
  if (!roomState.role) return res.status(403).json({ error: 'Player not found in room' });
  res.json(roomState);
});

app.post('/api/gamsit/room/:roomId/choice', async (req, res) => {
  const roomId = req.params.roomId;
  const { playerId, choice } = req.body || {};
  const room = gamsitRooms.get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!playerId) return res.status(400).json({ error: 'Missing playerId' });
  if (!choice || !GAMSIT_CHOICES.includes(choice)) return res.status(400).json({ error: 'Invalid choice' });

  const playerKey = getPlayerKey(room, playerId);
  if (!playerKey) return res.status(403).json({ error: 'Player not found in room' });
  if (!room.players.p2) return res.status(400).json({ error: 'Waiting for a second player to join' });
  if (room.status === 'finished') return res.status(400).json({ error: 'Game already finished' });

  room.players[playerKey].choice = choice;
  const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';
  const opponent = room.players[opponentKey];

  if (opponent?.choice) {
    const winner = determineWinner(room.players.p1.choice, room.players.p2.choice);
    room.status = 'finished';
    room.result = {
      winner,
      choices: {
        p1: room.players.p1.choice,
        p2: room.players.p2.choice,
      },
    };
  }

  res.json(getRoomState(room, playerId, `${req.protocol}://${req.get('host')}`));
});

// Upload file to S3
app.post('/api/s3/upload', upload.single('file'), requireEditor, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const timestamp = Date.now();
    const key = `${timestamp}-${file.originalname}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const baseUrl = process.env.S3_BASE_URL || process.env.S3_ENDPOINT || 'https://s3.nevaobjects.id';
    const url = `${baseUrl}/${S3_BUCKET}/${key}`;
    res.json({ success: true, key, url });
  } catch (err) {
    console.error('S3 upload error:', err && err.stack ? err.stack : err);
    try {
      const rawBody = err.$response ? await streamToString(err.$response.body) : null;
      console.error('S3 upload error details:', {
        name: err.name,
        message: err.message,
        statusCode: err.$response && err.$response.statusCode,
        rawBody,
      });
    } catch (e) {
      console.error('Error while dumping response body', e);
    }
    next(err);
  }
});

// Remove file from S3
app.post('/api/s3/remove', express.json(), requireEditor, async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing key to delete' });

    const params = { Bucket: S3_BUCKET, Key: key };
    await s3Client.send(new DeleteObjectCommand(params));
    res.json({ success: true, key });
  } catch (err) {
    console.error('S3 remove error:', err && err.stack ? err.stack : err);
    try {
      const rawBody = err.$response ? await streamToString(err.$response.body) : null;
      console.error('S3 remove error details:', {
        name: err.name,
        message: err.message,
        statusCode: err.$response && err.$response.statusCode,
        rawBody,
      });
    } catch (e) {
      console.error('Error while dumping response body', e);
    }
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
