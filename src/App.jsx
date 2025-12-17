import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', language: '', code: '' });

  const API_URL = import.meta.env.VITE_API_BASE_URL + '/snippets';

  // FIX: Wrapping fetch in useCallback and using the error variable fixes ESLint warnings
  const fetchSnippets = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setSnippets(res.data);
      setLoading(false);
    } catch (err) { 
      console.error("Fetch error:", err); 
      setLoading(false); 
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const res = await axios.get(API_URL);
        setSnippets(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [API_URL]);

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
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSnippets();
    } catch (err) { 
      console.error("Delete error:", err);
      alert("Error deleting"); 
    }
  };

  const filteredSnippets = snippets.filter(s => 
    s.language.toLowerCase().includes(search.toLowerCase()) ||
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // --- STYLES (Keeping the clean design) ---
  const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const buttonSuccessStyle = { backgroundColor: '#2da44e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
  const cardStyle = { background: '#fff', padding: '25px', marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #eee' };
  const deleteButtonStyle = { background: 'none', border: 'none', color: '#d73a49', cursor: 'pointer', fontWeight: '600' };
  const copyButtonStyle = { background: '#fff', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif', color: '#333' }}>
      <div style={{ maxWidth: '900px', margin: 'auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0' }}>🚀 CodeVault</h1>
          <p style={{ color: '#666' }}>Your personal developer knowledge base</p>
        </header>

        <section style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Create New Snippet</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={inputStyle} />
              <input placeholder="Language" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required style={inputStyle} />
            </div>
            <textarea placeholder="Paste code here..." value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required style={{ ...inputStyle, height: '100px', marginBottom: '20px' }} />
            <button type="submit" style={buttonSuccessStyle}>Save Snippet</button>
          </form>
        </section>

        <input type="text" placeholder="🔍 Search..." onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, padding: '15px', marginBottom: '30px' }} />

        {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
          <div>
            {filteredSnippets.map(s => (
              <div key={s._id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3>{s.title} <span style={{fontSize: '0.8rem', color: '#888'}}>({s.language})</span></h3>
                  <button onClick={() => deleteSnippet(s._id)} style={deleteButtonStyle}>Delete</button>
                </div>
                <SyntaxHighlighter language={s.language.toLowerCase()} style={oneLight}>{s.code}</SyntaxHighlighter>
                <button onClick={() => { navigator.clipboard.writeText(s.code); alert("Copied!"); }} style={copyButtonStyle}>📋 Copy Code</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;