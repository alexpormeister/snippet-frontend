import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Falling Code Animation Component ---
const FallingCode = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const characters = "01<>/{}[]();:+=*-!&|%".split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      // Create trailing effect with slight transparency
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animation color: Subtle grey to match background
      ctx.fillStyle = '#d0d7de'; 
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '50vw', // Only covers the right side
        height: '100vh',
        zIndex: -1,   // Stays behind the content
        opacity: 0.4, // Blends into the white background
        pointerEvents: 'none' // Ensures you can still click buttons underneath
      }}
    />
  );
};

function App() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', language: '', code: '' });

  const API_URL = import.meta.env.VITE_API_BASE_URL + '/snippets';

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
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '40px', fontFamily: systemFont, color: '#1f2328' }}>
      {/* Animation sits in the background */}
      <FallingCode />

      <div style={{ maxWidth: '1400px', margin: 'auto', position: 'relative' }}>
        
        <header style={{ borderBottom: '1px solid #d0d7de', paddingBottom: '20px', marginBottom: '40px', background: 'rgba(255,255,255,0.8)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0' }}>Code Snippet Library</h1>
          <p style={{ color: '#636c76', marginTop: '8px' }}>Internal development knowledge base.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px', alignItems: 'start' }}>
          
          <aside style={{ position: 'sticky', top: '40px' }}>
            <div style={{ border: '1px solid #d0d7de', padding: '24px', borderRadius: '6px', background: 'white' }}>
              <h3 style={{ marginTop: '0', fontSize: '16px', marginBottom: '16px' }}>New Snippet</h3>
              <form onSubmit={handleSubmit}>
                <input 
                  placeholder="Title" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  required 
                  style={inputStyle} 
                />
                <input 
                  placeholder="Language" 
                  value={formData.language} 
                  onChange={e => setFormData({ ...formData, language: e.target.value })} 
                  required 
                  style={{ ...inputStyle, marginTop: '12px' }} 
                />
                <textarea 
                  placeholder="Source code" 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                  required 
                  style={{ ...inputStyle, height: '150px', marginTop: '12px', fontFamily: 'monospace' }} 
                />
                <button type="submit" style={buttonStyle}>Save Snippet</button>
              </form>
            </div>
          </aside>

          <main>
            <input 
              type="text" 
              placeholder="Search by title or language..." 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ ...inputStyle, padding: '16px', marginBottom: '24px', fontSize: '16px', background: 'white' }} 
            />

            {loading ? (
              <p>Loading collection...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                {filteredSnippets.map(s => (
                  <div key={s._id} style={{ border: '1px solid #d0d7de', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.title} ({s.language})</span>
                      <button onClick={() => deleteSnippet(s._id)} style={{ color: '#cf222e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                    <SyntaxHighlighter language={s.language.toLowerCase()} style={oneLight} customStyle={{ margin: 0, padding: '16px', fontSize: '13px' }}>
                      {s.code}
                    </SyntaxHighlighter>
                    <div style={{ padding: '10px', borderTop: '1px solid #d0d7de', textAlign: 'right' }}>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(s.code); alert("Copied"); }}
                        style={{ ...buttonStyle, backgroundColor: '#f6f8fa', color: '#1f2328', border: '1px solid #d0d7de', padding: '5px 10px', fontSize: '12px' }}
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

const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d0d7de', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', backgroundColor: '#24292f', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' };

export default App;