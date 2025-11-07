import React, { useState } from 'react';

function SummaryDisplay({ summary, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (error) {
    return (
      <div className="mt-6 p-5 bg-red-950/20 border border-red-900/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 bg-red-900/30 rounded-full flex items-center justify-center mr-3">
            <span className="text-red-400 text-lg">!</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-1">
              Oops, something went wrong
            </h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="mt-6 p-6 bg-black/50 border border-orange-900/20 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Here's what it says
          </h3>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            <svg 
              className={`w-6 h-6 ${copied ? 'text-green-400' : 'text-orange-400'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 011 1v2h4a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h4V3z" />
              <path d="M9 3H7a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1h-2V3z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-200 text-base leading-relaxed">
          {summary}
        </p>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-sm text-gray-500">
            Quick summary - might miss some details
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default SummaryDisplay;
