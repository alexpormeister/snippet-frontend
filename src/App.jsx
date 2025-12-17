import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
    const chars = "01<>{}[]()/\\+=-*#!?".split("");

    const draw = () => {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#30363d';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

function App() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', language: '', code: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL = import.meta.env.VITE_API_BASE_URL + '/snippets';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSnippets = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setSnippets(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setFormData({ title: '', language: '', code: '' });
      fetchSnippets();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error adding snippet");
    }
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSnippets();
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Delete failed: ${err.response?.status || err.message}`);
    }
  };

  const filteredSnippets = snippets.filter(s =>
    s.language.toLowerCase().includes(search.toLowerCase()) ||
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

  return (
    <div style={{ backgroundColor: '#0d1117', minHeight: '100vh', padding: isMobile ? '20px' : '40px', fontFamily: systemFont, color: '#c9d1d9' }}>
      <BackgroundAnimation />
      
      <div style={{ maxWidth: '1400px', margin: 'auto', position: 'relative' }}>
        <header style={{ borderBottom: '1px solid #30363d', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', margin: '0', color: '#f0f6fc' }}>Code Snippet Library</h1>
          <p style={{ color: '#8b949e', marginTop: '8px', fontSize: isMobile ? '14px' : '16px' }}>Internal development knowledge base.</p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', 
          gap: isMobile ? '20px' : '40px', 
          alignItems: 'start' 
        }}>
          <aside style={{ position: isMobile ? 'static' : 'sticky', top: '40px' }}>
            <div style={{ border: '1px solid #30363d', padding: '24px', borderRadius: '6px', backgroundColor: '#161b22' }}>
              <h3 style={{ marginTop: '0', fontSize: '16px', marginBottom: '16px', color: '#f0f6fc' }}>New Snippet</h3>
              <form onSubmit={handleSubmit}>
                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} />
                <input placeholder="Language" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} required style={{ ...inputStyle, marginTop: '12px' }} />
                <textarea placeholder="Source code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required style={{ ...inputStyle, height: '150px', marginTop: '12px', fontFamily: 'monospace' }} />
                <button type="submit" style={buttonStyle}>Save Snippet</button>
              </form>
            </div>
          </aside>

          <main>
            <input 
              type="text" 
              placeholder="Search by title or language..." 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ ...inputStyle, padding: '16px', marginBottom: '24px', fontSize: '16px', backgroundColor: '#0d1117' }} 
            />

            {loading ? (
              <p style={{ color: '#8b949e' }}>Loading collection...</p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(450px, 1fr))', 
                gap: '20px' 
              }}>
                {filteredSnippets.map(s => (
                  <div key={s._id} style={{ border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#161b22' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: '#21262d', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#f0f6fc' }}>{s.title} ({s.language})</span>
                      <button onClick={() => deleteSnippet(s._id)} style={{ color: '#f85149', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete</button>
                    </div>
                    <SyntaxHighlighter language={s.language.toLowerCase()} style={oneDark} customStyle={{ margin: 0, padding: '16px', fontSize: isMobile ? '12px' : '13px', background: 'transparent' }}>
                      {s.code}
                    </SyntaxHighlighter>
                    <div style={{ padding: '10px', borderTop: '1px solid #30363d', textAlign: 'right' }}>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(s.code); alert("Copied"); }}
                        style={copyButtonStyle}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { 
  width: '100%', 
  padding: '10px', 
  borderRadius: '4px', 
  border: '1px solid #30363d', 
  boxSizing: 'border-box', 
  backgroundColor: '#0d1117', 
  color: '#c9d1d9',
  outline: 'none'
};

const buttonStyle = { 
  width: '100%', 
  backgroundColor: '#238636',
  color: 'white', 
  border: 'none', 
  padding: '12px', 
  borderRadius: '4px', 
  fontWeight: '600', 
  cursor: 'pointer', 
  marginTop: '16px' 
};

const copyButtonStyle = { 
  backgroundColor: '#21262d', 
  color: '#c9d1d9', 
  border: '1px solid #30363d', 
  padding: '5px 10px', 
  fontSize: '12px', 
  borderRadius: '4px', 
  cursor: 'pointer' 
};

export default App;