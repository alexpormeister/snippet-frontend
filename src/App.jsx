import { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', language: '', code: '' });

  const API_URL = import.meta.env.VITE_API_BASE_URL + '/snippets';

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const res = await axios.get(API_URL);
        setSnippets(res.data);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchSnippets();
  }, [API_URL]);

  const fetchSnippets = async () => {
    try {
      const res = await axios.get(API_URL);
      setSnippets(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // CREATE (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setFormData({ title: '', language: '', code: '' });
      fetchSnippets(); // Refresh list
    } catch { alert("Error adding snippet"); }
  };

  // DELETE
  const deleteSnippet = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchSnippets(); // Refresh list
    } catch { alert("Error deleting"); }
  };

  const filteredSnippets = snippets.filter(s => 
    s.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>🚀 Developer Knowledge Base</h1>

      {/* ADD FORM (POST REQUIREMENT) */}
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Snippet</h3>
        <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{display:'block', marginBottom:'5px'}} />
        <input placeholder="Language" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required style={{display:'block', marginBottom:'5px'}} />
        <textarea placeholder="Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required style={{display:'block', marginBottom:'5px', width: '100%'}} />
        <button type="submit" style={{background: '#28a745', color: 'white', border: 'none', padding: '10px'}}>Save Snippet</button>
      </form>

      {/* SEARCH (FILTER REQUIREMENT) */}
      <input type="text" placeholder="Filter by language..." onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />

      {loading ? <p>Loading...</p> : (
        <div>
          {filteredSnippets.map(s => (
            <div key={s._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>{s.title} ({s.language})</h3>
                <button onClick={() => deleteSnippet(s._id)} style={{color: 'red'}}>Delete</button>
              </div>
              <SyntaxHighlighter language={s.language.toLowerCase()} style={dracula}>{s.code}</SyntaxHighlighter>
              <button onClick={() => navigator.clipboard.writeText(s.code)}>Copy Code</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App;