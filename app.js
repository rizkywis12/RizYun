require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload and S3
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const upload = multer({ storage: multer.memoryStorage() });

const { NodeHttpHandler } = require('@smithy/node-http-handler');
const https = require('https');

// Use a custom https agent if needed (default system CA used)
const httpsAgent = new https.Agent({ keepAlive: true });

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'https://rizyyn.s3.nevaobjects.id',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({ httpsAgent }),
});

const S3_BUCKET = process.env.S3_BUCKET || 'rizyyn';
const PRESIGN_EXPIRY = parseInt(process.env.PRESIGN_EXPIRY || '3600', 10);

console.log('S3 config:', {
  endpoint: process.env.S3_ENDPOINT,
  bucket: S3_BUCKET,
  region: process.env.S3_REGION,
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

async function getPresignedUrl(key) {
  if (!key) return null;
  try {
    const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: PRESIGN_EXPIRY });
    return url;
  } catch (e) {
    console.error('Error generating presigned url for', key, e);
    return null;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to RizYun API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// List top-level folders (albums)
app.get('/api/albums', async (req, res, next) => {
  try {
    const params = { Bucket: S3_BUCKET, Delimiter: '/' };
    const data = await s3Client.send(new ListObjectsV2Command(params));

    const prefixes = (data.CommonPrefixes || []).map(p => p.Prefix.replace(/\/$/, ''));

    // For each prefix, get a sample object and count
    const albums = await Promise.all(prefixes.map(async (prefix) => {
      const listParams = { Bucket: S3_BUCKET, Prefix: prefix + '/', MaxKeys: 1000 };
      const objs = await s3Client.send(new ListObjectsV2Command(listParams));
      const contents = objs.Contents || [];
      const count = contents.length;
      const firstKey = contents[0] && contents[0].Key;
      const sampleUrl = firstKey ? await getPresignedUrl(firstKey) : null;
      return { name: prefix, prefix: prefix + '/', count, sampleUrl };
    }));

    res.json({ albums });
  } catch (err) {
    console.error('Error listing albums:', err);
    next(err);
  }
});

// Create a new album (create a placeholder object to create the prefix)
app.post('/api/albums', express.json(), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Missing album name' });
    const clean = name.trim();
    if (!clean) return res.status(400).json({ error: 'Invalid album name' });
    if (/\//.test(clean)) return res.status(400).json({ error: 'Album name cannot contain "/"' });

    const key = `${clean}/.keep`;
    const params = { Bucket: S3_BUCKET, Key: key, Body: '' };
    await s3Client.send(new PutObjectCommand(params));

    res.status(201).json({ success: true, album: clean });
  } catch (err) {
    console.error('Error creating album:', err);
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

// Upload file to S3
app.post('/api/s3/upload', upload.single('file'), async (req, res, next) => {
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

    const url = `${process.env.S3_BASE_URL || process.env.S3_ENDPOINT || 'https://rizyyn.s3.nevaobjects.id'}/${key}`;
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
app.post('/api/s3/remove', express.json(), async (req, res, next) => {
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
