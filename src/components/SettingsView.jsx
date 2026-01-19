import { useState, useRef } from 'react';

export default function SettingsView() {
  const [truncateLoading, setTruncateLoading] = useState(false);
  const [truncateError, setTruncateError] = useState(null);
  const [truncateSuccess, setTruncateSuccess] = useState(null);
  const [tableToTruncate, setTableToTruncate] = useState('TRAINING_TASKS');
  const confirmRef = useRef();

  // PostgreSQL truncate state
  const [truncatePostgresLoading, setTruncatePostgresLoading] = useState(false);
  const [truncatePostgresError, setTruncatePostgresError] = useState(null);
  const [truncatePostgresSuccess, setTruncatePostgresSuccess] = useState(null);
  const [postgresTableToTruncate, setPostgresTableToTruncate] = useState('training_tasks');

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
    } catch (err) {
      setTruncateError(err.message);
    } finally {
      setTruncateLoading(false);
    }
  };

  const handleTruncatePostgres = async (e) => {
    e.preventDefault();
    setTruncatePostgresError(null);
    setTruncatePostgresSuccess(null);
    if (!window.confirm(`Are you sure you want to delete ALL data from ${postgresTableToTruncate}? This cannot be undone.`)) return;
    setTruncatePostgresLoading(true);
    try {
      const res = await fetch(`/api/admin/truncate-postgres-table?table_name=${postgresTableToTruncate}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to truncate PostgreSQL table');
      setTruncatePostgresSuccess(`Table ${postgresTableToTruncate} truncated successfully.`);
    } catch (err) {
      setTruncatePostgresError(err.message);
    } finally {
      setTruncatePostgresLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">Settings</h2>
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-inner">
        <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1116.95 7.05z" /></svg>
          Danger Zone
        </h3>
        <form onSubmit={handleTruncate} className="flex flex-wrap gap-4 items-end mt-2">
          <div>
            <label className="block text-xs font-semibold text-red-600 mb-1">Table to Truncate</label>
            <select
              value={tableToTruncate}
              onChange={e => setTableToTruncate(e.target.value)}
              className="p-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-red-700 font-bold"
            >
              <option value="TRAINING_TASKS">TRAINING_TASKS</option>
              <option value="AUDIT_LOG">AUDIT_LOG</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={truncateLoading}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {truncateLoading ? 'Truncating...' : `Truncate ${tableToTruncate}`}
          </button>
          {truncateError && <span className="text-red-700 font-semibold ml-4">{truncateError}</span>}
          {truncateSuccess && <span className="text-green-700 font-semibold ml-4">{truncateSuccess}</span>}
        </form>
        <p className="text-xs text-red-500 mt-3">This action is irreversible and will delete all data from the selected table in Snowflake. Use with extreme caution.</p>
      </div>

      {/* PostgreSQL Danger Zone */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl shadow-inner mt-8">
        <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          PostgreSQL Danger Zone
        </h3>
        <form onSubmit={handleTruncatePostgres} className="flex flex-wrap gap-4 items-end mt-2">
          <div>
            <label className="block text-xs font-semibold text-orange-600 mb-1">PostgreSQL Table to Truncate</label>
            <select
              value={postgresTableToTruncate}
              onChange={e => setPostgresTableToTruncate(e.target.value)}
              className="p-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-orange-700 font-bold"
            >
              <option value="training_tasks">training_tasks</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={truncatePostgresLoading}
            className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold shadow hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {truncatePostgresLoading ? 'Truncating...' : `Truncate ${postgresTableToTruncate}`}
          </button>
          {truncatePostgresError && <span className="text-orange-700 font-semibold ml-4">{truncatePostgresError}</span>}
          {truncatePostgresSuccess && <span className="text-green-700 font-semibold ml-4">{truncatePostgresSuccess}</span>}
        </form>
        <p className="text-xs text-orange-500 mt-3">This action is irreversible and will delete all data from the selected table in PostgreSQL. Use with extreme caution.</p>
      </div>
    </div>
  );
}
