import React, { useState } from 'react';
import InputBox from './components/InputBox';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryDisplay from './components/SummaryDisplay';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!url.trim()) {
      setError('Please enter a LinkedIn URL');
      return;
    }

    setError('');
    setSummary('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      console.log('API URL:', cleanUrl);
      const response = await fetch(`${cleanUrl}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to summarize');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950/10 via-black to-black"></div>

      <nav className="relative bg-black/50 backdrop-blur-sm border-b border-orange-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-auto py-3 md:h-20 md:py-2">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo.svg" alt="sum0 logo" className="h-12 md:h-16 w-auto flex-shrink-0" />
            </div>
            
            <div className="hidden md:block text-gray-500 text-sm font-light flex-1 text-center">
              Quick summaries for busy people
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="https://github.com/CoderKavyaG/sum0"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                title="GitHub Repository"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://x.com/goelsahhab"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                title="Follow on X"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.868 6.75h-3.308l7.73-8.835L2.42 2.25h6.772l4.96 6.565L17.78 2.25h.464zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative flex items-center justify-center min-h-[calc(100vh-5rem)] p-3 md:p-4">
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-orange-900/20 p-6 md:p-12 max-w-3xl w-full shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center px-2 md:p-4 mb-2 md:mb-6 text-white">
            Get the gist, skip the scroll
          </h2>
          
          <InputBox 
            url={url}
            setUrl={setUrl}
            onSubmit={handleSummarize}
            disabled={loading}
          />
          
          {loading && <LoadingSpinner />}
          
          {(summary || error) && (
            <SummaryDisplay 
              summary={summary}
              error={error}
            />
          )}
          
          <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600">
            <p>Drop a LinkedIn post URL and get a quick summary</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
