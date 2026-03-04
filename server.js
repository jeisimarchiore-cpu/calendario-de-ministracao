import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const PORT = Number(process.env.PORT || 8787);

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY. Create a .env file (copy from .env.example) and set GEMINI_API_KEY.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/models', async (_req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: { message: 'Servidor sem GEMINI_API_KEY configurada no .env' } });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const r = await fetch(url);
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      res.status(r.status).json(data);
      return;
    }

    const models = Array.isArray(data?.models) ? data.models : [];
    const generateContent = models.filter((m) => {
      const methods = m?.supportedGenerationMethods;
      if (Array.isArray(methods)) return methods.includes('generateContent');
      return String(methods || '').includes('generateContent');
    });

    res.json({ models, generateContent });
  } catch (err) {
    res.status(500).json({ error: { message: err?.message || 'Erro ao listar modelos' } });
  }
});

app.post('/api/generateContent', async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: { message: 'Servidor sem GEMINI_API_KEY configurada no .env' } });
    return;
  }

  const model = String(req.body?.model || '').trim();
  const payload = req.body?.payload;

  if (!model) {
    res.status(400).json({ error: { message: 'Campo "model" é obrigatório' } });
    return;
  }

  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ error: { message: 'Campo "payload" é obrigatório (objeto)' } });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err?.message || 'Erro ao chamar Gemini' } });
  }
});

app.use(express.static(__dirname));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Pregador local server running on http://localhost:${PORT}`);
});
