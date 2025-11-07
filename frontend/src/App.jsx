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
      console.log('API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/api/summarize`, {
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
          <div className="flex items-center justify-between h-20 py-2">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="sum0 logo" className="h-16 w-auto" />
            </div>
            <div className="text-gray-500 text-sm font-light">
              Quick summaries for busy people
            </div>
          </div>
        </div>
      </nav>

      <div className="relative flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-orange-900/20 p-12 max-w-3xl w-full shadow-2xl">
          <h2 className="text-3xl font-bold text-center p-4 mb-2 text-white">
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
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Drop a LinkedIn post URL and get a quick summary</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
