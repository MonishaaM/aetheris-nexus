import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

const app = express();
const JWT_SECRET = 'aetheris_celestial_secret_key_8849';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(cors());
app.use(express.json());

let db;
async function initDb() {
  db = await open({
    filename: './aetheris.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      stardust_rank TEXT DEFAULT 'Starseeker'
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      author_id INTEGER,
      author_name TEXT,
      crypto_hash TEXT,
      luminous_count INTEGER DEFAULT 0,
      gravity_count INTEGER DEFAULT 0,
      nova_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      glyph_symbol TEXT DEFAULT '✦',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `);

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN cover_image TEXT;`);
  } catch (e) {
    // Column already exists
  }

  const initialUser = await db.get(`SELECT id FROM users WHERE username = ?`, ['OrionPrime']);
  if (!initialUser) {
    const hash = await bcrypt.hash('celestial123', 10);
    const result = await db.run(
      `INSERT INTO users (username, email, password, stardust_rank) VALUES (?, ?, ?, ?)`,
      ['OrionPrime', 'orion@aetheris.org', hash, 'Arch-Chronicle']
    );

    const postContent = `Knowledge is not a static ledger; it is a radiant constellation. When ideas collide at relativistic speeds, they produce intellectual resonance capable of re-architecting systems. Through cryptographic immutability, we preserve the purity of human discovery.`;
    const postHash = crypto.createHash('sha256').update(postContent).digest('hex');

    const seedPost = await db.run(
      `INSERT INTO posts (title, category, content, cover_image, author_id, author_name, crypto_hash, luminous_count, gravity_count, nova_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 42, 18, 9)`,
      [
        'Architecting Verifiable Syntactic Universes', 
        'Cosmic Systems', 
        postContent, 
        'https://image.pollinations.ai/prompt/cybernetic%20cosmic%20constellation%20portal%20neon%20amber%20violet%20stardust%208k%20wallpaper?width=1200&height=500&nologo=true&seed=42', 
        result.lastID, 
        'OrionPrime', 
        postHash
      ]
    );

    await db.run(
      `INSERT INTO comments (post_id, author_name, content, glyph_symbol) VALUES (?, ?, ?, ?)`,
      [seedPost.lastID, 'NovaSeeker', 'The concept of cryptographic veracity anchor points changes peer reviews permanently.', '✧']
    );
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Celestial Token Required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token Void or Degraded' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing celestial credentials' });
    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hash]
    );
    const token = jwt.sign({ id: result.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastID, username, stardust_rank: 'Starseeker' } });
  } catch (err) {
    res.status(400).json({ error: 'Cosmic alignment conflict: Username or Email exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) return res.status(400).json({ error: 'Star traveler not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(403).json({ error: 'Cryptographic passkey mismatch' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, stardust_rank: user.stardust_rank } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT p.*, (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count 
      FROM posts p ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Nexus Node Not Found' });
    const comments = await db.all(`SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`, [req.params.id]);
    res.json({ ...post, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, category, content, cover_image } = req.body;
    const cryptoHash = crypto.createHash('sha256').update(content).digest('hex');
    const result = await db.run(
      `INSERT INTO posts (title, category, content, cover_image, author_id, author_name, crypto_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category || 'Philosophy', content, cover_image || '', req.user.id, req.user.username, cryptoHash]
    );
    res.status(201).json({ id: result.lastID, title, crypto_hash: cryptoHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Record inexistent' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Signatory clearance revoked' });
    await db.run(`DELETE FROM posts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/react', async (req, res) => {
  try {
    const { type } = req.body;
    const valid = ['luminous', 'gravity', 'nova'];
    if (!valid.includes(type)) return res.status(400).json({ error: 'Invalid cosmic reaction' });
    await db.run(`UPDATE posts SET ${type}_count = ${type}_count + 1 WHERE id = ?`, [req.params.id]);
    const updated = await db.get(`SELECT luminous_count, gravity_count, nova_count FROM posts WHERE id = ?`, [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { author_name, content, glyph_symbol } = req.body;
    const glyphs = ['✦', '✧', '★', '✪', '❂', '✵'];
    const assignedGlyph = glyph_symbol || glyphs[Math.floor(Math.random() * glyphs.length)];
    const result = await db.run(
      `INSERT INTO comments (post_id, author_name, content, glyph_symbol) VALUES (?, ?, ?, ?)`,
      [req.params.id, author_name || 'Cosmic Traveler', content, assignedGlyph]
    );
    res.status(201).json({ id: result.lastID, author_name, content, glyph_symbol: assignedGlyph });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Visual Banner Generator Endpoint
app.post('/api/ai/generate-cover', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Title or content required to generate cover' });
    }

    let visualPrompt = '';
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Create a concise, highly visual, cinematic text-to-image prompt (under 40 words) that illustrates a blog post titled "${title}" in category "${category}". Focus on cinematic lighting, artistic mood, 8k resolution, wide panoramic wallpaper. Avoid text, words, or watermarks. Output only the prompt.`,
        });
        visualPrompt = response.text.trim().replace(/["\n]/g, ' ');
      } catch (e) {
        visualPrompt = `${title}, ${category}, cinematic lighting, atmospheric, 8k wallpaper`;
      }
    } else {
      visualPrompt = `${title}, ${category}, dark obsidian aesthetic, stardust glow, dramatic lighting, 8k resolution wallpaper`;
    }

    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1200&height=500&nologo=true&seed=${seed}`;
    res.json({ imageUrl, prompt: visualPrompt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate visual: ' + err.message });
  }
});

// Aetheris AI Oracle Neural Endpoint
app.post('/api/ai/synthesize', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required for synthesis' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        summary: [
          `Deconstructs the core premise of "${title || 'the article'}" with precision.`,
          "Validates that structured design principles dramatically outperform unconstrained approaches.",
          "Establishes a verifiable standard for peer evaluation and reproducibility."
        ],
        dialectic_counter: "Does standardizing this paradigm risk filtering out unconventional breakthroughs that flourish outside structured frameworks?",
        code_audit: content.includes('`') 
          ? "Input sanitization and memory boundaries must be strictly isolated to prevent side-channel leaks."
          : null,
        tags: ["synthesis", "logic", "foundations"]
      });
    }

    const prompt = `
You are the "Aetheris Celestial Oracle," an analytical, sharp AI knowledge engine.
Analyze this blog post titled "${title}".
Return a strictly valid JSON object with:
1. "summary": Array of exactly 3 concise, punchy bullet points capturing the core essence.
2. "dialectic_counter": A 1-2 sentence intellectual counter-perspective, devil's advocate question, or edge-case limitation to stimulate debate in comments.
3. "code_audit": If the text contains code snippets, rules, or system commands, give 1 brief security or performance tip. If no code/technical setup, return null.
4. "tags": Array of 3-4 recommended lowercase tags (without #).

Article Content:
${content}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch (err) {
    console.error('AI Oracle Error:', err);
    res.status(500).json({ error: 'Celestial Oracle unavailable: ' + err.message });
  }
});

initDb().then(() => {
  app.listen(5000, () => console.log('🌌 Aetheris Core active on port 5000'));
});
