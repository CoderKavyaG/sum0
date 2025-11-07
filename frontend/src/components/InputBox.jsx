import React from 'react';

function InputBox({ url, setUrl, onSubmit, disabled }) {
  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Paste your LinkedIn post URL here"
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl 
                     text-white placeholder-gray-600
                     focus:outline-none focus:border-orange-500/50 focus:ring-1 
                     focus:ring-orange-500/50 transition-all 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl 
                     hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 
                     focus:ring-orange-500/50 transition-all shadow-lg shadow-orange-500/20
                     disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-gray-600 disabled:cursor-not-allowed 
                     disabled:opacity-50 disabled:shadow-none"
        >
          {disabled ? 'Working on it...' : 'Summarize'}
        </button>
      </div>
    </form>
  );
}

export default InputBox;
