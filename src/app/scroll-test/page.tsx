import React from 'react';

export default function ScrollTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Scroll Test Page</h1>
        
        {/* Generate lots of content to test scrolling */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Section {i + 1}</h2>
            <p className="text-gray-600">
              This is a test section to create enough content for scrolling. 
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
              veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
              commodo consequat.
            </p>
            <p className="text-gray-600 mt-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
