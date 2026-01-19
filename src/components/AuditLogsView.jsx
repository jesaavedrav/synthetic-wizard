import { useEffect, useState, useRef } from 'react';

const EVENT_TYPES = [
  '', 'train_started', 'train_failed', 'train_completed', 'generate', 'generate_anomaly', 'model_deleted', 'dataset_uploaded'
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState('');
  const [query, setQuery] = useState('');
  const [truncateLoading, setTruncateLoading] = useState(false);
  const [truncateError, setTruncateError] = useState(null);
  const [truncateSuccess, setTruncateSuccess] = useState(null);
  const [tableToTruncate, setTableToTruncate] = useState('TRAINING_TASKS');
  const confirmRef = useRef();

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [skip, limit, eventType, query]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        skip,
        limit,
      });
      if (eventType) params.append('event_type', eventType);
      if (query) params.append('q', query);
      const res = await fetch(`/api/audit-log?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => setSkip(Math.max(0, skip - limit));
  const handleNext = () => setSkip(skip + limit);
  const handleFilter = (e) => {
    e.preventDefault();
    setSkip(0);
    fetchLogs();
  };

  const handleTruncate = async (e) => {
    e.preventDefault();
    setTruncateError(null);
    setTruncateSuccess(null);
    if (!window.confirm(`Are you sure you want to delete ALL data from ${tableToTruncate}? This cannot be undone.`)) return;
    setTruncateLoading(true);
    try {
      const res = await fetch(`/api/admin/truncate-table?table=${tableToTruncate}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to truncate table');
      setTruncateSuccess(`Table ${tableToTruncate} truncated successfully.`);
      fetchLogs();
    } catch (err) {
      setTruncateError(err.message);
    } finally {
      setTruncateLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">Audit Logs</h2>
      <form onSubmit={handleFilter} className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Event Type</label>
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900"
          >
            <option value="">All</option>
            {EVENT_TYPES.filter(e => e).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search logs..."
            className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-900"
          />
        </div>
        <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold text-sm">Filter</button>
      </form>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Success</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No logs found.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-indigo-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.id}</td>
                <td className="px-4 py-3 text-sm text-indigo-700 font-semibold">{log.event_type}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{log.message}</td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">
                  <ExpandableJsonCell value={log.data} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.success ? <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-semibold text-xs">Yes</span> : <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 font-semibold text-xs">No</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{formatDate(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-500">Showing {skip + 1} - {Math.min(skip + limit, total)} of {total}</span>
        <div className="space-x-2">
          <button onClick={handlePrev} disabled={skip === 0} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold disabled:opacity-50">Previous</button>
          <button onClick={handleNext} disabled={skip + limit >= total} className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

function ExpandableJsonCell({ value }) {
  const [expanded, setExpanded] = useState(false);
  if (!value) return <span className="text-gray-300">-</span>;
  return (
    <div className="relative max-w-xs">
      <button
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 focus:outline-none border border-indigo-100 ${expanded ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        onClick={() => setExpanded((e) => !e)}
        type="button"
      >
        {expanded ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Hide
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Show
          </>
        )}
      </button>
      {expanded && (
        <div className="absolute left-0 top-7 z-20 min-w-[200px] max-w-lg max-h-72 overflow-auto bg-white border border-indigo-100 shadow-2xl rounded-xl p-4 animate-fade-in">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
