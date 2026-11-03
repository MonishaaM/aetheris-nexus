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
  } catch (e) {}

  const postCount = await db.get(`SELECT COUNT(*) as count FROM posts`);
  if (postCount.count < 4) {
    let user = await db.get(`SELECT id FROM users WHERE username = ?`, ['OrionPrime']);
    if (!user) {
      const hash = await bcrypt.hash('celestial123', 10);
      const res = await db.run(
        `INSERT INTO users (username, email, password, stardust_rank) VALUES (?, ?, ?, ?)`,
        ['OrionPrime', 'orion@aetheris.org', hash, 'Arch-Chronicle']
      );
      user = { id: res.lastID };
    }

    const initialNodes = [
      {
        title: 'Architecting Verifiable Syntactic Universes',
        category: 'Cosmic Systems',
        content: `[TAGS:Architecture,Cosmos,Logic]\n\nKnowledge is not a static ledger; it is a radiant constellation. When ideas collide at relativistic speeds, they produce intellectual resonance capable of re-architecting systems. Through cryptographic immutability, we preserve the purity of human discovery.`,
        cover: 'https://image.pollinations.ai/prompt/cybernetic%20cosmic%20constellation%20portal%20neon%20amber%20violet%20stardust%208k%20wallpaper?width=1200&height=500&nologo=true&seed=42',
        luminous: 42, gravity: 18, nova: 9
      },
      {
        title: 'Bioluminescent Waves: When the Ocean Mimics the Night Sky',
        category: 'Cool Facts',
        content: `[TAGS:Nature,OceanScience,Optics]\n\n# The Living Light of the Midnight Surf\n\nStanding on a quiet shoreline after midnight, an incoming wave crashes with an electric neon-cyan glow.\n\n### What Causes the Cold Neon Fire?\nThe phenomenon is driven by microscopic single-celled marine plankton called **dinoflagellates**. When disturbed by crashing waves, mechanical shear triggers cold enzymatic light.\n\n> Nearly 100% of the energy is converted directly to light with zero thermal loss.`,
        cover: 'https://image.pollinations.ai/prompt/bioluminescent%20neon%20cyan%20ocean%20waves%20midnight%20shoreline%20stardust%20glow%208k%20wallpaper?width=1200&height=500&nologo=true&seed=909',
        luminous: 58, gravity: 24, nova: 19
      },
      {
        title: 'The 5:30 AM Shift: Why the World Hits Different Before the Noise Starts',
        category: 'Daily Life',
        content: `[TAGS:DailyLife,Mindfulness,MorningVibes]\n\n# The Unclaimed Hours\n\nThere is a brief, almost sacred window of time right around 5:30 in the morning that feels completely detached from the rest of the 24-hour cycle.\n\n### The Architecture of the Blue Hour\nPhotographers talk about the Golden Hour, but the Blue Hour is where the real mental reset happens.\n\n> We spend most of our lives managing momentum. The early morning is one of the rare times you get to choose its direction.`,
        cover: 'https://image.pollinations.ai/prompt/cozy%20quiet%20early%20morning%20coffee%20mug%20window%20dawn%20blue%20hour%20sunlight%20cinematic%208k?width=1200&height=500&nologo=true&seed=5309',
        luminous: 37, gravity: 31, nova: 14
      },
      {
        title: 'Ghost Rivers Beneath the Asphalt: The Lost Waterways Running Under Cities',
        category: 'Cool Facts',
        content: `[TAGS:UrbanExploration,Hydrology,Geography]\n\n# The Buried Currents\n\nAlmost every historic metropolis on Earth was built along freshwater tributaries. But as populations exploded, surface rivers were enclosed into subterranean brick barrel vaults.\n\n> You can pave over a river with stone and asphalt, but water preserves an uncompromising institutional memory.`,
        cover: 'https://image.pollinations.ai/prompt/subterranean%20brick%20aqueduct%20river%20tunnel%20running%20beneath%20a%20modern%20city%20reflections%208k%20wallpaper?width=1200&height=500&nologo=true&seed=7712',
        luminous: 65, gravity: 42, nova: 28
      }
    ];

    for (const node of initialNodes) {
      const exists = await db.get(`SELECT id FROM posts WHERE title = ?`, [node.title]);
      if (!exists) {
        const hash = crypto.createHash('sha256').update(node.content).digest('hex');
        await db.run(
          `INSERT INTO posts (title, category, content, cover_image, author_id, author_name, crypto_hash, luminous_count, gravity_count, nova_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [node.title, node.category, node.content, node.cover, user.id, 'OrionPrime', hash, node.luminous, node.gravity, node.nova]
        );
      }
    }
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

app.post('/api/ai/generate-cover', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    let visualPrompt = `${title}, ${category}, cinematic lighting, 8k wallpaper`;
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1200&height=500&nologo=true&seed=${seed}`;
    res.json({ imageUrl, prompt: visualPrompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/synthesize', async (req, res) => {
  try {
    const { title, content } = req.body;
    res.json({
      summary: [
        `Distills the primary premise of "${title || 'the article'}" into actionable insights.`,
        "Validates that structured design principles dramatically outperform unconstrained approaches.",
        "Establishes a verifiable standard for peer evaluation and reproducibility."
      ],
      dialectic_counter: "Does standardizing this paradigm risk filtering out unconventional breakthroughs that flourish outside structured frameworks?",
      code_audit: content && content.includes('`') ? "Input sanitization and memory boundaries must be strictly isolated to prevent leaks." : null,
      tags: ["synthesis", "logic", "foundations"]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb().then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('🌌 Aetheris Core active'));
});
