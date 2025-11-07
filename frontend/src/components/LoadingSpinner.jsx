import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      <p className="mt-4 text-gray-300 font-medium">Reading the post...</p>
      <p className="mt-2 text-sm text-gray-500">Hang tight, this takes a moment</p>
    </div>
  );
}

export default LoadingSpinner;
