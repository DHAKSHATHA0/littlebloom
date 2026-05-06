// frontend/src/components/Loading.js
import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      <p className="mt-4 text-gray-600 text-lg font-medium">{message}</p>
    </div>
  );
}
