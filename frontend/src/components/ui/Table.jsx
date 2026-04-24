import React from 'react';

const Table = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto w-full bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 max-h-[70vh]">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant/30 text-[10px] uppercase tracking-widest text-secondary font-black shadow-sm z-10">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-6 py-4 ${i === headers.length - 1 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 text-on-surface font-medium">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
