import { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL + '/snippets';

  // 1. DATA LOADING (GET Request)
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const response = await axios.get(API_URL);
        setSnippets(response.data);
        setLoading(false);
      } catch (err) {
        console.error("The API error is:", err);
        setError("Failed to load snippets. Make sure your Backend is running!");
        setLoading(false);
      }
    };
    fetchSnippets();
  }, );

  if (loading) return <div className="loading">Loading snippets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Developer Knowledge Base</h1>
      
      <div className="snippet-list">
        {snippets.map(snippet => (
          <div key={snippet._id} style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '15px', borderRadius: '8px' }}>
            <h2>{snippet.title}</h2>
            <p><strong>Language:</strong> {snippet.language}</p>
            
            {/* 2. SYNTAX HIGHLIGHTING */}
            <SyntaxHighlighter language={snippet.language.toLowerCase()} style={dracula}>
              {snippet.code}
            </SyntaxHighlighter>

            {/* 3. COPY TO CLIPBOARD */}
            <button onClick={() => navigator.clipboard.writeText(snippet.code)}>
              Copy Code
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;