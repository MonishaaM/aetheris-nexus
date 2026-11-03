import React, { useState, useEffect, useMemo, useRef } from 'react';
import CanvasBackground from './CanvasBackground';
import QuantumCoreVisualizer from './QuantumCoreVisualizer';
import AetherisOracle from './AetherisOracle';
import { 
  Sparkles, ShieldCheck, Feather, MessageSquare, 
  Orbit, Trash2, Send, Search, X, Clock,
  Filter, Volume2, VolumeX, Eye, Edit3, Check, 
  ThumbsUp, Flame, Coffee, Lightbulb,
  Share2, Maximize2, Minimize2, BookmarkCheck, Zap,
  Activity, Image as ImageIcon, RefreshCw
} from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [showMatrixPanel, setShowMatrixPanel] = useState(false);

  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('aetheris_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aetheris_token') || '');
  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  const [focusMode, setFocusMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Creation State & AI Cover Generation
  const [creatingPost, setCreatingPost] = useState(false);
  const [editorMode, setEditorMode] = useState('write');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    category: 'Daily Life', 
    customCategory: '',
    content: '',
    cover_image: ''
  });
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [postTags, setPostTags] = useState(['Life', 'Reflection']);
  
  // Comments & Search
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGenerateCover = async () => {
    if (!newPost.title.trim()) {
      alert('Please enter a Title first so the AI can formulate an appropriate visual theme.');
      return;
    }
    setGeneratingImage(true);
    playChime('spark');
    try {
      const finalCategory = newPost.category === 'CUSTOM' ? newPost.customCategory : newPost.category;
      const res = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          category: finalCategory,
          content: newPost.content
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewPost(prev => ({ ...prev, cover_image: data.imageUrl }));
        playChime('verify');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to synthesize AI cover image.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const applyPreset = (presetType) => {
    playChime('spark');
    if (presetType === 'fact') {
      setNewPost({
        title: 'Mind-Blowing Fact: Did You Know?',
        category: 'Cool Facts',
        customCategory: '',
        content: `### The Cool Fact\nDid you know that honey found in ancient Egyptian tombs over 3,000 years old is still completely edible?\n\n### Why It Works\nBecause of its extremely low moisture content and naturally high acidity, bacteria and microorganisms cannot survive.\n\n> Nature often comes up with the most elegant preservation systems long before technology ever does.`,
        cover_image: 'https://image.pollinations.ai/prompt/ancient%20egyptian%20golden%20honeycomb%20crystal%20jar%20mystical%20amber%20glow%208k%20wallpaper?width=1200&height=500&nologo=true&seed=101'
      });
      setPostTags(['Facts', 'Science', 'Curiosity']);
    } else if (presetType === 'life') {
      setNewPost({
        title: 'A Little Moment from Today',
        category: 'Daily Life',
        customCategory: '',
        content: `### Today's Highlight\nTook a walk without headphones this evening and caught the sunset through the trees.\n\n### What I Realized\nIt is crazy how fast our days go when we are glued to screens. Taking 10 minutes to just breathe and reset genuinely turns the whole mood around.\n\n> Slowing down doesn't mean falling behind.`,
        cover_image: 'https://image.pollinations.ai/prompt/cozy%20sunset%20through%20pine%20trees%20golden%20hour%20dreamy%20aesthetic%20warm%20ambient%208k?width=1200&height=500&nologo=true&seed=202'
      });
      setPostTags(['DailyLog', 'Mindfulness', 'Cozy']);
    } else if (presetType === 'hack') {
      setNewPost({
        title: 'Simple Life Hack That Saves Me Hours',
        category: 'Life Hacks',
        customCategory: '',
        content: `### The Hack\nThe **2-Minute Rule**: If a task takes less than 120 seconds to do (replying to that quick message, clearing your desk, filing a receipt), do it right away instead of putting it on a to-do list.\n\n### The Impact\nYour mental inbox stays clean, and small chores never snowball into overwhelming weekend tasks.`,
        cover_image: 'https://image.pollinations.ai/prompt/minimalist%20zen%20desk%20morning%20sunlight%20espresso%20laptop%20clean%20aesthetic%208k?width=1200&height=500&nologo=true&seed=303'
      });
      setPostTags(['Productivity', 'LifeHacks', 'Tips']);
    } else if (presetType === 'tech') {
      setNewPost({
        title: 'Building and Securing Fast Web Apps',
        category: 'Technology',
        customCategory: '',
        content: `### The Core Principle\nSecurity and performance are not features you add at the end; they are architectural decisions made on day one.\n\n### Clean Implementation Tip\nAlways enforce input parameterization and keep your client bundles lightweight by avoiding bloated UI kits.`,
        cover_image: 'https://image.pollinations.ai/prompt/cybernetic%20neural%20matrix%20code%20stream%20neon%20cyan%20violet%20glassmorphism%208k?width=1200&height=500&nologo=true&seed=404'
      });
      setPostTags(['WebDev', 'Cybersecurity', 'React']);
    }
  };

  const playChime = (toneType = 'chime') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let freq = 432;
      if (toneType === 'react') freq = 540;
      if (toneType === 'verify') freq = 648;
      if (toneType === 'spark') freq = 768;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } catch (e) {}
  };

  const handleVerifyIntegrity = async (rawContent, declaredHash) => {
    setVerifying(true);
    playChime('verify');
    try {
      const msgBuffer = new TextEncoder().encode(rawContent);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setTimeout(() => {
        setVerifying(false);
        if (computedHash.toLowerCase() === declaredHash.toLowerCase()) {
          setVerificationResult('verified');
        } else {
          setVerificationResult('mismatch');
        }
      }, 350);
    } catch (err) {
      setVerifying(false);
      setVerificationResult('mismatch');
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPostDetails = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setActivePost(data);
      setShowMatrixPanel(false);
      setVerificationResult(null);
      setFocusMode(false);
      playChime('chime');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('aetheris_user', JSON.stringify(data.user));
        localStorage.setItem('aetheris_token', data.token);
        setShowAuth(false);
        playChime('verify');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Authentication network disturbance.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('aetheris_user');
    localStorage.removeItem('aetheris_token');
  };

  const addTag = (e) => {
    e.preventDefault();
    const trimmed = currentTagInput.trim().replace(/^#/, '');
    if (trimmed && !postTags.includes(trimmed)) {
      setPostTags([...postTags, trimmed]);
      setCurrentTagInput('');
      playChime('spark');
    }
  };

  const removeTag = (tagToRemove) => {
    setPostTags(postTags.filter(t => t !== tagToRemove));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) return setShowAuth(true);

    const finalCategory = newPost.category === 'CUSTOM' 
      ? (newPost.customCategory.trim() || 'General Thoughts')
      : newPost.category;

    const tagHeader = postTags.length > 0 ? `[TAGS:${postTags.join(',')}]\n\n` : '';
    const compositeContent = tagHeader + newPost.content;

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title,
          category: finalCategory,
          content: compositeContent,
          cover_image: newPost.cover_image
        })
      });
      if (res.ok) {
        setCreatingPost(false);
        setNewPost({ title: '', category: 'Daily Life', customCategory: '', content: '', cover_image: '' });
        setPostTags([]);
        playChime('verify');
        fetchPosts();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      alert('Failed to publish post.');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActivePost(null);
        fetchPosts();
      }
    } catch (err) {
      alert('Error deleting post.');
    }
  };

  const handleReact = async (id, type) => {
    playChime('react');
    try {
      const res = await fetch(`/api/posts/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (activePost && activePost.id === id) {
        setActivePost(prev => ({ ...prev, ...data }));
      }
      setPosts(posts.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (err) {}
  };

  const handleAddComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!commentText.trim()) return;
    playChime('react');
    try {
      const res = await fetch(`/api/posts/${activePost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: user ? user.username : (commentAuthor || 'Reader'),
          content: commentText
        })
      });
      const data = await res.json();
      setActivePost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data]
      }));
      setCommentText('');
      setCommentAuthor('');
      fetchPosts();
    } catch (err) {}
  };

  const copyShareLink = () => {
    playChime('spark');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const parsePostMeta = (rawContent = '') => {
    const tagMatch = rawContent.match(/^\[TAGS:([^\]]+)\]\n\n/);
    if (tagMatch) {
      const tags = tagMatch[1].split(',').filter(Boolean);
      const cleanContent = rawContent.replace(tagMatch[0], '');
      return { tags, cleanContent };
    }
    return { tags: [], cleanContent: rawContent };
  };

  const renderMarkdown = (text = '') => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-cinzel text-amber-200 font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-cinzel text-amber-300 font-bold mt-5 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-cinzel text-amber-400 font-bold mt-6 mb-3">{line.slice(2)}</h1>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-amber-400/60 bg-amber-400/5 px-4 py-2 italic text-amber-100 my-3 rounded-r">
            {line.slice(2)}
          </blockquote>
        );
      }
      if (line.includes('`')) {
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <p key={idx} className="mb-2 leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-950/70 border border-purple-400/40 text-amber-300 font-mono text-xs">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-3" />;
      return <p key={idx} className="mb-2 leading-relaxed">{line}</p>;
    });
  };

  const availableCategories = useMemo(() => {
    const defaults = ['ALL', 'Daily Life', 'Cool Facts', 'Life Hacks', 'Technology', 'Cybersecurity', 'Creative'];
    const set = new Set([...defaults, ...posts.map(p => p.category).filter(Boolean)]);
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const { tags, cleanContent } = parsePostMeta(post.content);
      const q = searchQuery.toLowerCase();
      
      const matchesSearch = 
        !q || 
        post.title.toLowerCase().includes(q) || 
        cleanContent.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q) ||
        tags.some(t => t.toLowerCase().includes(q));

      const matchesCategory = 
        selectedCategory === 'ALL' || 
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesTag = 
        !selectedTag || 
        tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase());

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  const estimateReadTime = (text = '') => {
    const words = text.trim().split(/\s+/).length;
    return `${Math.ceil(words / 180)} min read`;
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      <CanvasBackground />

      {showMatrixPanel && (
        <QuantumCoreVisualizer
          posts={posts}
          onSelectPost={loadPostDetails}
          onClose={() => setShowMatrixPanel(false)}
        />
      )}

      {activePost && (
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 z-50 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      )}

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-purple-600/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 aurora-glow" />

      {!focusMode && (
        <header className="border-b border-amber-500/20 bg-black/70 backdrop-blur-2xl sticky top-0 z-40 transition-all">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div 
              onClick={() => { setActivePost(null); setCreatingPost(false); setShowMatrixPanel(false); }}
              className="cursor-pointer flex items-center gap-4 group"
            >
              <div className="relative w-14 h-14 rounded-2xl border-2 border-amber-400/40 flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-purple-900/30 to-black group-hover:scale-105 group-hover:border-amber-300 transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                <Orbit className="w-7 h-7 text-amber-300 animate-spin" style={{ animationDuration: '18s' }} />
                <div className="absolute inset-1 rounded-xl border border-purple-400/30 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping" />
              </div>
              
              <div>
                <span className="text-3xl font-cinzel font-black tracking-widest glitter-text drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                  AETHERIS
                </span>
                <p className="text-[11px] tracking-[0.2em] uppercase text-amber-300/80 font-mono flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Stardust Knowledge Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => { setShowMatrixPanel(true); playChime('verify'); }}
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider border border-purple-400/40 text-purple-300 rounded-xl hover:bg-purple-950/40 hover:border-purple-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(192,132,252,0.15)] group"
              >
                <Activity className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
                Knowledge Matrix
              </button>

              <button
                onClick={() => {
                  const nextState = !soundEnabled;
                  setSoundEnabled(nextState);
                  if (nextState) playChime('spark');
                }}
                className="p-2.5 border border-amber-400/30 text-amber-300 rounded-xl hover:bg-amber-400/10 transition-colors"
                title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button
                onClick={() => { setCreatingPost(true); setActivePost(null); }}
                className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider border border-amber-400/40 text-amber-300 rounded-xl hover:bg-amber-400/15 hover:border-amber-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] group"
              >
                <Feather className="w-4 h-4 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
                Write Story
              </button>

              {user ? (
                <div className="flex items-center gap-3 border-l border-amber-500/20 pl-4">
                  <span className="text-xs font-mono text-purple-300 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30">
                    ✦ {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-semibold rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        {creatingPost ? (
          <div className="max-w-3xl mx-auto bg-[#090514]/95 p-8 md:p-10 rounded-2xl stardust-border backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-cinzel text-amber-300 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" /> Share Something Great
              </h2>

              <div className="flex items-center gap-1 p-1 bg-black/60 border border-amber-400/20 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEditorMode('write')}
                  className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                    editorMode === 'write' 
                      ? 'bg-amber-400 text-black font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                    editorMode === 'preview' 
                      ? 'bg-amber-400 text-black font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {/* Quick-Fill Vibe Starters */}
            <div className="my-5 p-3.5 bg-black/60 border border-amber-400/20 rounded-xl space-y-2">
              <span className="text-[11px] font-mono text-amber-300/80 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Need inspiration? Pick a 1-tap template:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('fact')}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" /> Cool Fact
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('life')}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-purple-400/10 border border-purple-400/30 text-purple-300 hover:bg-purple-400/20 flex items-center gap-1"
                >
                  <Coffee className="w-3 h-3" /> Daily Life Moment
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hack')}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Life Hack
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('tech')}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/20 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Tech &amp; Security
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5">
              <div>
                <label className="text-xs font-mono text-amber-300/80 block mb-1.5 uppercase tracking-wider">Title</label>
                <input
                  required
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. The Most Fascinating Thing I Learned This Week..."
                  className="w-full bg-black/70 border border-amber-400/20 rounded-lg p-3 text-slate-100 focus:border-amber-400 outline-none text-sm transition-all"
                />
              </div>

              {/* AI Cover Generator Trigger */}
              <div className="p-4 bg-black/50 border border-amber-400/25 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-amber-300/90 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" /> AI Cinematic Cover Banner
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateCover}
                    disabled={generatingImage}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  >
                    {generatingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {generatingImage ? 'Synthesizing Visual...' : (newPost.cover_image ? 'Regenerate Cover' : 'Generate AI Cover Banner')}
                  </button>
                </div>

                {newPost.cover_image && (
                  <div className="relative rounded-lg overflow-hidden border border-amber-400/30 group">
                    <img 
                      src={newPost.cover_image} 
                      alt="AI Cover Preview" 
                      className="w-full h-36 object-cover transition-transform group-hover:scale-105 duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[10px] font-mono text-amber-300">✦ Neural Visual Attached</span>
                      <button
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, cover_image: '' }))}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-amber-300/80 block mb-1.5 uppercase tracking-wider">Category Domain</label>
                  <select
                    value={newPost.category}
                    onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full bg-black/70 border border-amber-400/20 rounded-lg p-3 text-slate-100 focus:border-amber-400 outline-none text-sm"
                  >
                    <option value="Daily Life">☀️ Daily Life &amp; Routine</option>
                    <option value="Cool Facts">💡 Cool Facts &amp; Trivia</option>
                    <option value="Life Hacks">⚡ Life Hacks &amp; Tips</option>
                    <option value="Technology">💻 Tech &amp; Web Systems</option>
                    <option value="Cybersecurity">🛡️ Cybersecurity &amp; CTF</option>
                    <option value="Creative">🎨 Creative &amp; Thoughts</option>
                    <option value="CUSTOM">+ Custom Category...</option>
                  </select>
                </div>

                {newPost.category === 'CUSTOM' && (
                  <div>
                    <label className="text-xs font-mono text-purple-300 block mb-1.5 uppercase tracking-wider">Custom Category</label>
                    <input
                      required
                      value={newPost.customCategory}
                      onChange={e => setNewPost({ ...newPost, customCategory: e.target.value })}
                      placeholder="e.g. Travel, Books, Science..."
                      className="w-full bg-black/70 border border-purple-400/40 rounded-lg p-3 text-slate-100 focus:border-purple-400 outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-mono text-amber-300/80 block mb-1.5 uppercase tracking-wider">
                  Tags ({postTags.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={currentTagInput}
                    onChange={e => setCurrentTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(e); } }}
                    placeholder="Type a tag and press Enter..."
                    className="flex-1 bg-black/70 border border-amber-400/20 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase rounded-lg hover:bg-amber-400/10"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {postTags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-950/60 border border-purple-400/40 text-purple-200 flex items-center gap-1.5"
                    >
                      #{tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-amber-300/80 block mb-1.5 uppercase tracking-wider">Story Content</label>
                {editorMode === 'write' ? (
                  <textarea
                    required
                    rows={8}
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Inscribe findings, everyday reflections, or random facts..."
                    className="w-full bg-black/70 border border-amber-400/20 rounded-lg p-3 text-slate-100 focus:border-amber-400 outline-none text-sm font-sans leading-relaxed"
                  />
                ) : (
                  <div className="min-h-[200px] bg-black/60 border border-amber-400/30 rounded-lg p-5 text-slate-200 text-sm overflow-y-auto">
                    {newPost.content ? (
                      renderMarkdown(newPost.content)
                    ) : (
                      <p className="text-slate-500 italic text-xs">Nothing to preview yet. Write some words first.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold uppercase tracking-wider text-xs rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                >
                  Publish Story
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingPost(false)}
                  className="px-6 py-3 border border-white/20 text-slate-300 text-xs uppercase tracking-wider rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : activePost ? (
          <div className={`mx-auto space-y-8 animate-fadeIn ${focusMode ? 'max-w-2xl py-8' : 'max-w-4xl'}`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setActivePost(null); setFocusMode(false); }}
                className="text-xs font-mono text-amber-300/80 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
              >
                &larr; Back to Feed
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyShareLink}
                  className="text-xs font-mono px-3 py-1 rounded-lg border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 flex items-center gap-1.5 transition-all"
                  title="Copy link"
                >
                  {copiedLink ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied!' : 'Share'}
                </button>

                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`text-xs font-mono px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                    focusMode 
                      ? 'bg-amber-400 text-black font-semibold border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                      : 'border-white/20 text-slate-300 hover:border-amber-400/50'
                  }`}
                  title={focusMode ? 'Exit Cozy Focus' : 'Enter Cozy Focus'}
                >
                  {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  {focusMode ? 'Exit Zen' : 'Zen Focus'}
                </button>
              </div>
            </div>

            {/* Cinematic Hero Cover Banner (If Available) */}
            {activePost.cover_image && !focusMode && (
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] max-h-72">
                <img 
                  src={activePost.cover_image} 
                  alt={activePost.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-black/30" />
              </div>
            )}

            {(() => {
              const { tags, cleanContent } = parsePostMeta(activePost.content);
              return (
                <article className="bg-[#090514]/90 backdrop-blur-xl p-8 md:p-12 rounded-2xl stardust-border space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 uppercase tracking-wider">
                          {activePost.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          {estimateReadTime(cleanContent)}
                        </span>
                      </div>

                      <h1 className={`font-cinzel text-slate-100 font-bold leading-tight ${focusMode ? 'text-3xl md:text-4xl text-amber-200' : 'text-3xl md:text-5xl'}`}>
                        {activePost.title}
                      </h1>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {tags.map(t => (
                            <span 
                              key={t}
                              onClick={() => { setSelectedTag(t); setActivePost(null); }}
                              className="cursor-pointer text-xs font-mono px-2.5 py-0.5 rounded bg-purple-950/40 border border-purple-400/30 text-purple-300 hover:border-purple-300 transition-colors"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {user && user.id === activePost.author_id && (
                      <button
                        onClick={() => handleDeletePost(activePost.id)}
                        className="p-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!focusMode && (
                    <div className="p-3.5 bg-black/80 rounded-xl border border-purple-500/25 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
                      <div className="flex items-center gap-2 text-purple-300 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>AUTHENTICATED DIGITAL SEAL:</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-amber-200/90 font-mono text-[11px] truncate max-w-[180px] md:max-w-xs">
                          {activePost.crypto_hash}
                        </span>
                        <button
                          onClick={() => handleVerifyIntegrity(activePost.content, activePost.crypto_hash)}
                          disabled={verifying}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                            verificationResult === 'verified'
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                              : verificationResult === 'mismatch'
                              ? 'bg-rose-950/80 border-rose-400 text-rose-300'
                              : 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                          }`}
                        >
                          {verifying ? (
                            <>
                              <Orbit className="w-3.5 h-3.5 animate-spin" /> Verifying...
                            </>
                          ) : verificationResult === 'verified' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Untouched &amp; Verified
                            </>
                          ) : verificationResult === 'mismatch' ? (
                            <>⚠️ Alteration Detected</>
                          ) : (
                            <>Verify Content</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={`text-slate-200 leading-relaxed border-l-2 border-amber-500/40 pl-6 py-2 font-sans ${focusMode ? 'text-lg md:text-xl leading-loose' : 'text-base md:text-lg'}`}>
                    {renderMarkdown(cleanContent)}
                  </div>

                  <AetherisOracle 
                    postTitle={activePost.title} 
                    postContent={cleanContent} 
                    onInsertComment={(challenge) => {
                      setCommentText(`Dialectic Thought: ${challenge}`);
                      const commentBox = document.getElementById('comment-box-input');
                      if (commentBox) commentBox.focus();
                    }}
                  />

                  <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleReact(activePost.id, 'luminous')}
                        className="px-4 py-2 rounded-full border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/25 text-xs font-mono text-amber-300 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Insightful {activePost.luminous_count}
                      </button>
                      <button
                        onClick={() => handleReact(activePost.id, 'gravity')}
                        className="px-4 py-2 rounded-full border border-purple-400/40 bg-purple-400/10 hover:bg-purple-400/25 text-xs font-mono text-purple-300 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful {activePost.gravity_count}
                      </button>
                      <button
                        onClick={() => handleReact(activePost.id, 'nova')}
                        className="px-4 py-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/25 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                      >
                        <Flame className="w-3.5 h-3.5" /> Breakthrough {activePost.nova_count}
                      </button>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Author: <span className="text-amber-300 font-medium">{activePost.author_name}</span>
                    </div>
                  </div>
                </article>
              );
            })()}

            <div className="bg-[#090514]/80 backdrop-blur-xl p-8 rounded-2xl stardust-border space-y-6">
              <h3 className="text-xl font-cinzel text-amber-300 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" /> Community Discussion ({activePost.comments ? activePost.comments.length : 0})
              </h3>

              <div className="space-y-4">
                {activePost.comments && activePost.comments.length > 0 ? (
                  activePost.comments.map((c) => (
                    <div key={c.id} className="p-4 bg-black/60 border border-white/5 rounded-xl flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-950/70 border border-purple-400/40 flex items-center justify-center text-amber-300 font-cinzel shrink-0">
                        {c.glyph_symbol || '✦'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono text-amber-300 font-medium">{c.author_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono text-slate-500 italic">No comments yet. Share your thoughts below!</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-white/10">
                {!user && (
                  <input
                    value={commentAuthor}
                    onChange={e => setCommentAuthor(e.target.value)}
                    placeholder="Your name or handle..."
                    className="w-full bg-black/70 border border-amber-400/20 rounded-lg p-2.5 text-slate-100 text-xs focus:border-amber-400 outline-none"
                  />
                )}
                <div className="flex gap-2">
                  <input
                    id="comment-box-input"
                    required
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Write a supportive or thoughtful comment..."
                    className="flex-1 bg-black/70 border border-amber-400/20 rounded-lg p-3 text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 text-xs font-mono uppercase"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
              <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500">
                Explore Knowledge
              </h2>
              <p className="text-sm text-amber-300/80 font-mono">
                From daily life notes and cool facts to engineering and cybersecurity breakthroughs.
              </p>
            </div>

            <div className="bg-[#090514]/80 backdrop-blur-xl p-5 rounded-2xl stardust-border space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title, cool facts, daily life, tags (#hacks)..."
                    className="w-full bg-black/70 border border-amber-400/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:border-amber-400 outline-none font-mono"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedTag && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/70 border border-purple-400/40 rounded-xl text-xs font-mono text-purple-200">
                    <span>Filtering Tag: #{selectedTag}</span>
                    <button onClick={() => setSelectedTag('')} className="hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
                <span className="text-amber-300/60 flex items-center gap-1 pl-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all uppercase tracking-wider text-[11px] ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'border border-amber-400/20 text-slate-300 hover:border-amber-400/50 bg-black/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-[#090514]/40 rounded-2xl stardust-border space-y-3">
                <Orbit className="w-8 h-8 text-amber-400/60 mx-auto animate-spin" style={{ animationDuration: '25s' }} />
                <p className="text-sm font-mono text-slate-400">No matching articles found.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedTag(''); }}
                  className="text-xs font-mono text-amber-300 underline"
                >
                  Clear all search filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const { tags, cleanContent } = parsePostMeta(post.content);
                  return (
                    <div
                      key={post.id}
                      onClick={() => loadPostDetails(post.id)}
                      className="bg-[#090514]/80 backdrop-blur-md rounded-2xl stardust-border cursor-pointer transition-all hover:-translate-y-1.5 group flex flex-col justify-between shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                      {/* Card Cover Banner Thumbnail */}
                      {post.cover_image && (
                        <div className="w-full h-36 overflow-hidden relative border-b border-amber-400/15">
                          <img 
                            src={post.cover_image} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-transparent to-transparent" />
                        </div>
                      )}

                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10">
                            {post.category}
                          </span>
                          <span className="text-xs font-mono text-slate-500">#{post.id.toString().padStart(4, '0')}</span>
                        </div>

                        <h3 className="text-xl font-cinzel font-bold text-slate-100 group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>

                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tags.slice(0, 3).map(t => (
                              <span 
                                key={t} 
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/50 border border-purple-400/30 text-purple-300"
                              >
                                #{t}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-[10px] font-mono text-slate-500">+{tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-sans">
                          {cleanContent}
                        </p>
                      </div>

                      <div className="p-6 pt-0 mt-auto">
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-purple-300 flex items-center gap-1">
                            ✦ {post.author_name}
                          </span>
                          <div className="flex items-center gap-3 text-slate-400">
                            <span>{post.comment_count} 💬</span>
                            <span className="text-amber-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090514] p-8 md:p-10 rounded-2xl stardust-border max-w-md w-full relative shadow-2xl">
            <h3 className="text-2xl font-cinzel text-amber-300 mb-2">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs font-mono text-slate-400 mb-6">Sign in to publish posts and join discussions.</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-amber-300/80 block mb-1">USERNAME</label>
                <input
                  required
                  value={authForm.username}
                  onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full bg-black border border-amber-400/20 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 font-mono"
                />
              </div>
              {isRegister && (
                <div>
                  <label className="text-[10px] font-mono text-amber-300/80 block mb-1">EMAIL</label>
                  <input
                    required
                    type="email"
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-black border border-amber-400/20 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-mono text-amber-300/80 block mb-1">PASSWORD</label>
                <input
                  required
                  type="password"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-black border border-amber-400/20 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:brightness-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                >
                  {isRegister ? 'Register' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="px-4 py-2.5 border border-white/20 text-slate-400 rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="mt-5 text-[11px] font-mono text-amber-300/70 hover:text-amber-200 block text-center w-full"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      )}

      {!focusMode && (
        <footer className="border-t border-amber-500/15 py-6 text-center text-xs font-mono text-slate-500 bg-black/40">
          Aetheris Blog Nexus &bull; Verified Digital Publishing &bull; React &amp; SQLite
        </footer>
      )}
    </div>
  );
}
