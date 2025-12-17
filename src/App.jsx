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

  // --- STYLING CONSTANTS ---
  const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  
  const inputStyle = { 
    padding: '12px', 
    borderRadius: '4px', 
    border: '1px solid #ddd', 
    fontSize: '14px', 
    width: '100%', 
    boxSizing: 'border-box',
    fontFamily: systemFont
  };

  const buttonStyle = { 
    backgroundColor: '#24292f', 
    color: 'white', 
    border: 'none', 
    padding: '12px 20px', 
    borderRadius: '4px', 
    fontWeight: '600', 
    cursor: 'pointer',
    fontFamily: systemFont
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '40px', fontFamily: systemFont, color: '#1f2328' }}>
      <div style={{ maxWidth: '1400px', margin: 'auto' }}>
        
        <header style={{ borderBottom: '1px solid #d0d7de', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0' }}>Code Snippet Library</h1>
          <p style={{ color: '#636c76', marginTop: '8px' }}>Internal development knowledge base.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: CREATE FORM */}
          <aside style={{ position: 'sticky', top: '40px' }}>
            <section style={{ border: '1px solid #d0d7de', padding: '24px', borderRadius: '6px' }}>
              <h3 style={{ marginTop: '0', fontSize: '16px', marginBottom: '16px' }}>New Snippet</h3>
              <form onSubmit={handleSubmit}>
                <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ ...inputStyle, marginBottom: '12px' }} />
                <input placeholder="Language" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required style={{ ...inputStyle, marginBottom: '12px' }} />
                <textarea placeholder="Source code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required style={{ ...inputStyle, height: '150px', marginBottom: '16px', fontFamily: 'monospace' }} />
                <button type="submit" style={{ ...buttonStyle, width: '100%' }}>Save Snippet</button>
              </form>
            </section>
          </aside>

          {/* RIGHT COLUMN: SEARCH AND LIST */}
          <main>
            <input 
              type="text" 
              placeholder="Filter by title or language..." 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ ...inputStyle, padding: '16px', marginBottom: '24px', fontSize: '16px' }} 
            />

            {loading ? <p>Loading data...</p> : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                gap: '20px' 
              }}>
                {filteredSnippets.map(s => (
                  <div key={s._id} style={{ border: '1px solid #d0d7de', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{s.title} <span style={{ fontWeight: '400', color: '#636c76' }}>({s.language})</span></span>
                      <button onClick={() => deleteSnippet(s._id)} style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                    
                    <div style={{ flexGrow: 1 }}>
                      <SyntaxHighlighter 
                        language={s.language.toLowerCase()} 
                        style={oneLight} 
                        customStyle={{ margin: 0, padding: '16px', fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        {s.code}
                      </SyntaxHighlighter>
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid #d0d7de', textAlign: 'right' }}>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(s.code); alert("Copied to clipboard"); }} 
                        style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', backgroundColor: '#f6f8fa', color: '#1f2328', border: '1px solid #d0d7de' }}
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

export default App;