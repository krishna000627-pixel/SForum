import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Terminal, 
  Download, 
  Server, 
  Clock, 
  Cpu, 
  FileCode, 
  Layers, 
  Table, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  checkBackendSqlHealth, 
  fetchSqlTables, 
  runRawSqlQuery, 
  runDiagnosticsSuite, 
  exportSqlDatabaseDump,
  SqlHealthReport, 
  SqlQueryResult, 
  DiagnosticsSuiteResult 
} from '../utils/sqlClient';

export const SqlDiagnosticsTab: React.FC = () => {
  const [health, setHealth] = useState<SqlHealthReport | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Diagnostics Suite
  const [diagnostics, setDiagnostics] = useState<DiagnosticsSuiteResult | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // SQL Terminal
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT name, sql FROM sqlite_master WHERE type=\'table\';');
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [queryRunning, setQueryRunning] = useState(false);
  const [exportedDump, setExportedDump] = useState<string | null>(null);
  const [copiedDump, setCopiedDump] = useState(false);

  // Tables list
  const [tablesList, setTablesList] = useState<{ name: string; sql: string }[]>([]);

  const loadHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await checkBackendSqlHealth();
      setHealth(data);
      const tables = await fetchSqlTables();
      setTablesList(tables);
    } catch (err: any) {
      setHealthError(err.message || 'Failed to connect to backend SQL engine');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleRunDiagnostics = async () => {
    setRunningTests(true);
    setTestError(null);
    try {
      const res = await runDiagnosticsSuite();
      setDiagnostics(res);
      await loadHealth(); // refresh counts
    } catch (err: any) {
      setTestError(err.message || 'Failed to run diagnostics');
    } finally {
      setRunningTests(false);
    }
  };

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim()) return;
    setQueryRunning(true);
    try {
      const result = await runRawSqlQuery(q);
      setQueryResult(result);
    } catch (err: any) {
      setQueryResult({
        success: false,
        query: q,
        durationMs: 0,
        error: err.message,
      });
    } finally {
      setQueryRunning(false);
    }
  };

  const handleExportDump = async () => {
    try {
      const dump = await exportSqlDatabaseDump();
      const str = JSON.stringify(dump, null, 2);
      setExportedDump(str);
      const blob = new Blob([str], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sunrays_sqlite_dump_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white">
                SQL Database & System Diagnostics Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                REAL SQL ENGINE LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent relational SQLite 3 backend with full CRUD, real ACID transactions, and live test execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadHealth}
            disabled={healthLoading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={runningTests}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningTests ? 'animate-spin' : ''}`} />
            <span>{runningTests ? 'Running Diagnostic Tests...' : 'Run Full Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Database Engine</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm font-bold text-white">
            {health?.database || (healthError ? 'Engine Error' : 'Connecting...')}
          </p>
          <span className="text-[11px] text-emerald-400 font-mono block">
            {health?.driver || 'WebAssembly WASM / Node'}
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Engine Latency</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-emerald-400 font-mono">
            {health ? `${health.latencyMs} ms` : '...'}
          </p>
          <span className="text-[11px] text-slate-400 block">Instant local execution</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Database File On Disk</span>
            <HardDriveIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono truncate">
            database.sqlite3
          </p>
          <span className="text-[11px] text-amber-300 font-mono block">
            {health?.fileSizeBytes ? `${(health.fileSizeBytes / 1024).toFixed(2)} KB` : 'Active'}
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Relational Tables</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {health ? `${health.tablesCount} Tables` : '...'}
          </p>
          <span className="text-[11px] text-purple-300 font-mono block">
            {health?.tables ? (Object.values(health.tables) as number[]).reduce((a: number, b: number) => a + Number(b || 0), 0) : 0} Total Records
          </span>
        </div>
      </div>

      {/* Health Error Warning */}
      {healthError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Database Connection Notice</p>
            <p className="mt-0.5">{healthError}</p>
          </div>
        </div>
      )}

      {/* Relational Table Breakdown Grid */}
      {health?.tables && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active SQL Relational Tables & Row Counts
              </h3>
            </div>
            <button
              type="button"
              onClick={handleExportDump}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Full SQL Dump</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {Object.entries(health.tables).map(([tableName, count]) => (
              <button
                key={tableName}
                type="button"
                onClick={() => {
                  const q = `SELECT * FROM ${tableName} LIMIT 25;`;
                  setSqlQuery(q);
                  handleExecuteQuery(q);
                }}
                className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <span className="text-[11px] font-mono text-blue-400 group-hover:text-blue-300 block truncate">
                  {tableName}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-white font-mono">{count}</span>
                  <span className="text-[10px] text-slate-500">rows</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics Test Suite Runner Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Full Feature Diagnostics & Integrity Test Suite</h3>
              <p className="text-xs text-slate-400">
                Executes live end-to-end ACID transactions, real SQL queries, chat indexing, and disk persistence
              </p>
            </div>
          </div>

          {diagnostics && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  diagnostics.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {diagnostics.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>
                  {diagnostics.passedCount} / {diagnostics.totalTests} Tests Passed ({diagnostics.totalDurationMs} ms)
                </span>
              </span>
            </div>
          )}
        </div>

        {testError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
            {testError}
          </div>
        )}

        {diagnostics ? (
          <div className="space-y-2 pt-1">
            {diagnostics.results.map((test, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {test.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : test.status === 'WARN' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{test.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{test.durationMs} ms</span>
                    </div>
                    {test.details && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{test.details}</p>
                    )}
                    {test.error && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{test.error}</p>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    test.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : test.status === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
            Click <strong className="text-blue-400">"Run Full Diagnostics"</strong> above to benchmark and verify all backend features, real chat pipelines, and SQLite persistence.
          </div>
        )}
      </div>

      {/* Interactive Raw SQL Query Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Interactive Raw SQL Terminal</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Quick Queries:</span>
            <button
              type="button"
              onClick={() => {
                const q = 'SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT 10;';
                setSqlQuery(q);
                handleExecuteQuery(q);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
            >
              posts
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 10;';
                setSqlQuery(q);
                handleExecuteQuery(q);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
            >
              chats
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'SELECT * FROM student_accounts;';
                setSqlQuery(q);
                handleExecuteQuery(q);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
            >
              students
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'SELECT * FROM profiles LIMIT 10;';
                setSqlQuery(q);
                handleExecuteQuery(q);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
            >
              profiles
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              placeholder="Enter any SQL query (e.g. SELECT * FROM forum_posts;)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, PRAGMA
            </span>
            <button
              type="button"
              onClick={() => handleExecuteQuery()}
              disabled={queryRunning}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{queryRunning ? 'Executing...' : 'Execute SQL'}</span>
            </button>
          </div>
        </div>

        {/* Query Results Viewer */}
        {queryResult && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">
                {queryResult.success ? (
                  <span className="text-emerald-400">
                    Query succeeded in {queryResult.durationMs} ms
                    {queryResult.type === 'SELECT' ? ` • ${queryResult.rowCount} rows returned` : ` • ${queryResult.changes} rows modified`}
                  </span>
                ) : (
                  <span className="text-rose-400">Error: {queryResult.error}</span>
                )}
              </span>
            </div>

            {queryResult.success && queryResult.rows && queryResult.rows.length > 0 ? (
              <div className="max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-800">
                    <tr>
                      {queryResult.columns?.map((col) => (
                        <th key={col} className="p-2.5 whitespace-nowrap font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                        {queryResult.columns?.map((col) => {
                          const val = row[col];
                          const display = typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL');
                          return (
                            <td key={col} className="p-2.5 whitespace-nowrap max-w-xs truncate text-slate-300">
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : queryResult.success && queryResult.type === 'SELECT' ? (
              <div className="p-3 bg-slate-950 rounded-xl text-center text-xs text-slate-500 font-mono">
                Query executed successfully. 0 rows returned.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

// HardDrive Icon helper
function HardDriveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" x2="2" y1="12" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" x2="6.01" y1="16" y2="16" />
      <line x1="10" x2="10.01" y1="16" y2="16" />
    </svg>
  );
}
