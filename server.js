import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Active CORS pour GitHub Pages
app.use(cors({
  origin: ['https://cascadeencyclopedie.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Proxy vers Ollama local
app.use('/ollama', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/ollama': '/'
  },
  onError: (err, req, res) => {
    console.error('Erreur de proxy Ollama:', err);
    res.status(502).json({
      error: 'Erreur de connexion à Ollama. Vérifiez qu\'Ollama est bien en cours d\'exécution.'
    });
  }
}));

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
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Serveur HTTP standard
app.listen(PORT, () => {
  console.log(`Serveur HTTP en cours d\'exécution sur http://localhost:${PORT}`);
});

// Générer des certificats auto-signés si nécessaire (pour le développement)
try {
  const keyPath = path.join(__dirname, 'server.key');
  const certPath = path.join(__dirname, 'server.crt');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('Génération de certificats auto-signés pour HTTPS...');
    const { execSync } = require('child_process');
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`);
  }

  // Serveur HTTPS avec certificats
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`Serveur HTTPS en cours d'exécution sur https://localhost:${HTTPS_PORT}`);
  });
} catch (err) {
  console.warn('Impossible de démarrer le serveur HTTPS:', err);
}
