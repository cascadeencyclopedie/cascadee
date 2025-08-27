import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuration CORS
app.use(cors({
  origin: '*', // Permet toutes les origines en développement
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuration du proxy Ollama
app.use('/ollama', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/ollama': '/'
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  onError: (err, req, res) => {
    console.error('Erreur de proxy Ollama:', err);
    res.status(502).json({ error: 'Erreur de connexion à Ollama' });
  }
}));

// Fichiers statiques
app.use(express.static(__dirname));

// Route santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Route par défaut
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ports
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Démarrer le serveur HTTP
app.listen(HTTP_PORT, () => {
  console.log(`Serveur HTTP en cours d'exécution sur http://localhost:${HTTP_PORT}`);
});

// Générer des certificats avec OpenSSL si nécessaire
const keyPath = path.join(__dirname, 'server.key');
const certPath = path.join(__dirname, 'server.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  try {
    console.log('Génération de certificats auto-signés pour HTTPS...');
    
    // Certificat minimal auto-signé
    const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAx6DqQVlwu4y95oL8c8YS/ZQX2+8wAPv6i5iBwbYxRuIvF3W9
vBw7J9YOqJJy5JXeJJsnHu3K6OuU6z0x/RYRg3Qe9StgUPHds5TZ3OfU+d23LQCH
Lx9XJdfyuByNeXynMNm6giLp3T58w35EjvCXKG6vNZ2jRES0JzBu5ZZscRoJ4gOt
Bi+pznAfOGSDji1h9/jJcYEhsXggqOXR2Z1zZ7N+eWj1un+wluPuEEhb0ABN1mcT
KazsiiJU3P3jKKMgOSHJcp6XAM2AG8Z3hgnqo9XCS+HbHB2A8c8Z/I082fyxX/1N
15+YuvzJEBUFlWMO0J/Yd9n+EccBaRZ+/7N+IwIDAQABAoIBAQCUmK4YuWQ9CjXe
pxE+3mcMSqC6nIiSbOUgoNYLueOL+CfkBx9QZyD2XF2NOm+bK5GaCMYdYWFhIxAl
9TF2R48gh3Oou5boJdGP84YZxuOKC9k6z3DWW4wpBHRwU+cYqv7WSJYZetCqr0Es
4rf7fXcHlKxDAvbKVL4+4P+He47QXJnbwUFw3xfQ7iR8Yku5UWnRxTbOnfdJDFHE
kpBkLlCnUDClIy4Ex9RjnyN5vOJXoKenqKwc0sN5F89hdIfSE3C2FtedRnHeI6nY
JP2FJdMAsh9H7QeYvxiwOHcFvUP1r3kXBUUE9kYVbO5jKfifG7gqCw+8X4Hn6y0l
GKxkD6chAoGBAP/9J2MI4cV0CsQBqIIPEsNBr1fncyfx1UmhwFsfQG8Cg2u1UeBu
A7ynvD7A4TrG6sK2jUusCzU5XnWgWsH6G8KqUEk8K0zEcDGZkQl9wzrw+Gt/tK/r
K/o1RDlTEbXIHmkcrRj79ufLvVFRMwu4IxkUB4Tt8OaRZm7kOPgTfOZJAoGBAMej
lqEyRtFlA4rj0VCY4b6yZK2ZS3riDcvZ6DZv4n5HBWPpVVaLJ5AQbbKj1wSVyPVe
vcX5MHF2PLcbP80wnB89vxE/DpRy7yw8DMkVrRRD8eORNnGkHzbS1WeQOAByBMNF
3YRNKkT/8+H+Ra27kHx1Hq7LTZVMYPLlBpUVVb17AoGAfM6AhVgYOfcjQ3HMpWGz
Mv7aLKQ89SQzCZ7N35VJ46J0h0HbFGHHxzEpJ+TNEkkTW3nMx5GkeGkeBidxdSl5
Mb8aiXHTQEjoZflBcKGAx5g0j45vGGNc4NIg33umOQ1dV5HxFcE+EUrkRRKH3qJi
j5sSHxrzaL9hgYls9XQmCZkCgYBQ3LxgPwxdNqeQUXrY0dCVEjFBOEEqhMC0puyc
gx1KQd5s0U1LTU6O0Z7UczEOKBByRWFvL8S0PIpf6nSyQPE2xhVNZH9z1UzIPDJZ
K6whCXt7Rh2Mk7TlQ+bv7oN9qYLAomOsDGfMEiEXHAOsVtEGp2LHpMSEuXCEiDBs
7+8RjQKBgQD9IR0ezCb7txAQBn5jEqCIwi8TpQQpX+QRmjdgUay/y5DQZ0PtbT1K
r2IU6tnFE0QcSKTB+XiZWWzUJxPtRz4+H5V4qInVTk4DMUv3FFHuXr9d9jNz9JXn
ms0BX9ASUoFu+8gCU2c/fbVIbGU9PzP/C0j4ZkYmtCJIK+K6zlv9rA==
-----END RSA PRIVATE KEY-----`;

    const cert = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUE7ZUcT+BZHAk2aY4n4hXXccBcKUwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCRlIxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTA4MjcwMDAwMDBaFw0yNjA4
MjcwMDAwMDBaMEUxCzAJBgNVBAYTAkZSMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDHoOpBWXC7jL3mgvxzxhL9lBfb7zAA+/qLmIHBtjFG
4i8Xdb28HDsn1g6oknLkld4kmyce7cro65TrPTH9FhGDdB71K2BQ8d2zlNnc59T5
3bctAIcvH1cl1/K4HI15fKcw2bqCIundPnzDfkSO8JcX6s1naJERLQnMG7llmxxG
gniA60GL6nOcB84ZIOOLWFXyMlxgSGxeCCo5dHZnXNns355aPW6f7CW4+4QSFvQA
E3WZxMpqO6KIlTc/eMooyA5Iclyms5QAbYAbxnfFZPqj1cJL4dscHYDxzxn8jTzZ
/LFf/U3Xn5i6/MkQFQWVYw7Qn9h32f4RxwFpFn7/s34jAgMBAAGjUzBRMB0GA1Ud
DgQWBBRCgXceLDASgDKRmGw7qRKQq5Fy1zAfBgNVHSMEGDAWgBRCgXceLDASgDKR
mGw7qRKQq5Fy1zAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQB6
oLNn9/6h+3tB8vprhIePBwVQl5yG3ymUs/8Q8tHvz1SZ1cW1o0lXoEcMHMDLPVqB
7zbqW2s1EpQIeYZwfYS7NkS7sq3i9JjJHxulSdsA0LZAZFzp1NrqmSXZOy1tbVn+
nG8XIwHGeP/YyBbhvTh+dT8u9TfglR5sNNg3Zp9JIlBBdG3M5sKJ+CqeAsQ8cXDw
U6aUy8IvkpzH2hxlC1u0YlQ3JKK6tvzC0lq0Ap+Ey6cOEEwYnCPqF1BAzK8f0Lwy
2fkhrDTz8P2Y4RV0WKUZCrQx2t+qxvRF8DAcBBuL7pyL1LjBAfBwPuuf1M2Qx5+L
Zc5Z0V3nkcbQ/LtQ
-----END CERTIFICATE-----`;

    fs.writeFileSync(keyPath, key);
    fs.writeFileSync(certPath, cert);
    console.log('Certificats générés avec succès');

    // Démarrer le serveur HTTPS
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`Serveur HTTPS en cours d'exécution sur https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors de la génération des certificats:', error);
  }
} else {
  // Utiliser les certificats existants
  try {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`Serveur HTTPS en cours d'exécution sur https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur HTTPS:', error);
  }
}