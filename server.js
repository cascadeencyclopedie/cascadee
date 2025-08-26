import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from root directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// Basic health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
