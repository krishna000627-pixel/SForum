/**
 * Client for communicating with the real backend SQLite 3 relational database.
 */

export interface SqlHealthReport {
  status: string;
  database: string;
  driver: string;
  dbFile: string;
  fileExists: boolean;
  fileSizeBytes: number;
  tablesCount: number;
  tables: Record<string, number>;
  latencyMs: number;
  serverTime: string;
}

export interface SqlQueryResult {
  success: boolean;
  type?: 'SELECT' | 'MUTATION';
  query: string;
  rowCount?: number;
  columns?: string[];
  rows?: any[];
  changes?: number;
  durationMs: number;
  error?: string;
}

export interface DiagnosticTestItem {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  durationMs: number;
  details?: string;
  error?: string;
}

export interface DiagnosticsSuiteResult {
  success: boolean;
  totalTests: number;
  passedCount: number;
  totalDurationMs: number;
  timestamp: string;
  results: DiagnosticTestItem[];
}

export async function checkBackendSqlHealth(): Promise<SqlHealthReport> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSqlTables(): Promise<{ name: string; sql: string }[]> {
  const res = await fetch('/api/sql/tables');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch SQL tables');
  return data.tables;
}

export async function runRawSqlQuery(query: string, params: any[] = []): Promise<SqlQueryResult> {
  const res = await fetch('/api/sql/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params }),
  });
  return res.json();
}

export async function runDiagnosticsSuite(): Promise<DiagnosticsSuiteResult> {
  const res = await fetch('/api/diagnostics/run-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Diagnostics runner failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function exportSqlDatabaseDump(): Promise<any> {
  const res = await fetch('/api/sql/export');
  if (!res.ok) throw new Error('Failed to export SQL database');
  return res.json();
}
