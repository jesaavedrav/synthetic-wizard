import { useState } from 'react';

export default function ExpandableJsonCell({ value }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!value || (typeof value !== 'object')) {
    return <span className="text-gray-700">{value}</span>;
  }

  return (
    <div className="relative max-w-xs">
      <button
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 focus:outline-none shadow-sm border border-indigo-100
          ${expanded ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        onClick={() => setExpanded((e) => !e)}
        type="button"
      >
        {expanded ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Hide
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Show
          </>
        )}
      </button>
      {expanded && (
        <div className="absolute left-0 top-7 z-20 min-w-[250px] max-w-lg max-h-72 overflow-auto bg-white border border-indigo-100 shadow-2xl rounded-xl p-4 animate-fade-in">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
