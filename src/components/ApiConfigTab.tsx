import React, { useState } from 'react';
import { 
  Globe, 
  KeyRound, 
  User, 
  Link as LinkIcon, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Send, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Radio, 
  Webhook, 
  Layers, 
  Database,
  ExternalLink,
  Terminal
} from 'lucide-react';
import { ApiConfig, Profile } from '../types';
import { 
  testApiConnection, 
  pushProfileToApi, 
  TestResult, 
  generateCurlSnippet, 
  generateJsSnippet, 
  generatePythonSnippet, 
  generateHtmlFormSnippet 
} from '../utils/apiSync';

interface ApiConfigTabProps {
  apiConfig: ApiConfig;
  profiles: Profile[];
  onSaveConfig: (newConfig: ApiConfig) => void;
}

export const ApiConfigTab: React.FC<ApiConfigTabProps> = ({
  apiConfig,
  profiles,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<ApiConfig>(apiConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [codeLang, setCodeLang] = useState<'curl' | 'js' | 'python' | 'html'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Generate random API Key
  const handleGenerateKey = () => {
    const chars = 'abcdef0123456789';
    let key = 'nxk_live_';
    for (let i = 0; i < 20; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    const updated = { ...config, apiKey: key };
    setConfig(updated);
    onSaveConfig(updated);
  };

  const handleFieldChange = <K extends keyof ApiConfig>(key: K, value: ApiConfig[K]) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onSaveConfig(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testApiConnection(config);
      setTestResult(result);
      const updatedConfig = {
        ...config,
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: (result.success ? 'success' : 'failed') as 'success' | 'failed',
        lastTestMessage: result.message,
      };
      setConfig(updatedConfig);
      onSaveConfig(updatedConfig);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Test failed unexpectedly.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAllProfiles = async () => {
    if (profiles.length === 0) {
      setSyncStatus('No profiles in local database to sync.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(`Syncing ${profiles.length} profiles to ${config.baseUrl}...`);
    let successCount = 0;
    let failCount = 0;

    for (const p of profiles) {
      try {
        const res = await pushProfileToApi(p, config);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsSyncing(false);
    setSyncStatus(`Sync complete! ${successCount} sent successfully (${failCount} errors).`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const getSnippet = () => {
    switch (codeLang) {
      case 'curl':
        return generateCurlSnippet(config);
      case 'js':
        return generateJsSnippet(config);
      case 'python':
        return generatePythonSnippet(config);
      case 'html':
        return generateHtmlFormSnippet(config);
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
      {/* Overview & Live Status Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${config.enabled ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Web Form & External API Gateway
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${config.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {config.enabled ? 'Sync Active' : 'Offline / Local Only'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Push profiles directly from external web forms, landing pages, or sync with Python SQLite & Cloud databases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleFieldChange('enabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-xs font-medium text-white">Enable API Sync</span>
          </label>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostics / Test Result Alert */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' : 'bg-amber-950/40 border-amber-800/80 text-amber-300'} flex items-start gap-3`}>
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-xs text-white">
              {testResult.success ? 'API Connection Successful' : 'Connection Notice / Check'}
            </div>
            <div className="text-xs mt-0.5 leading-relaxed">{testResult.message}</div>
            {testResult.details && (
              <pre className="mt-2 p-2 rounded bg-black/40 text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5">
                {testResult.details}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* API Configuration Credentials Form */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              API Credentials & Endpoint Settings
            </h4>
          </div>
          {savedNotice && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* API Username */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>API Username / Service Account</span>
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              placeholder="e.g. admin_agent_01 or webform_client"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Sent in requests via <code className="text-slate-400">X-API-Username</code> or Basic Auth username
            </span>
          </div>

          {/* API Base URL */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>API Base URL / Endpoint</span>
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
              placeholder="http://localhost:8080/api or https://api.domain.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default Python backend uses <code className="text-slate-400">http://localhost:8080/api</code>
            </span>
          </div>

          {/* API Key / Secret Token */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>API Secret Key / Bearer Token</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate Key
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                placeholder="Enter or generate API token"
                className="w-full pl-3 pr-20 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showApiKey ? 'Hide Token' : 'Show Token'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(config.apiKey);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 1500);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Copy Token"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Auth Header Protocol */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span>Authentication Header Format</span>
            </label>
            <select
              value={config.authType}
              onChange={(e) => handleFieldChange('authType', e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="bearer">Bearer Token (Authorization: Bearer &lt;key&gt;)</option>
              <option value="basic">Basic Auth (Authorization: Basic base64(user:key))</option>
              <option value="customHeader">Custom Header (e.g. X-API-Key: &lt;key&gt;)</option>
            </select>
          </div>

          {/* Optional Webhook URL */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5 text-slate-400" />
              <span>External Webhook URL (Optional)</span>
            </label>
            <input
              type="text"
              value={config.webhookUrl || ''}
              onChange={(e) => handleFieldChange('webhookUrl', e.target.value)}
              placeholder="https://webhook.site/... or Zapier/Make/Slack webhook"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Sync Settings */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSyncOnSubmit}
              onChange={(e) => handleFieldChange('autoSyncOnSubmit', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-slate-300 text-xs">
              Auto-sync whenever a profile is saved in the web form
            </span>
          </label>

          <button
            type="button"
            onClick={handleSyncAllProfiles}
            disabled={isSyncing || profiles.length === 0}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>Push All Local Profiles ({profiles.length}) to API</span>
          </button>
        </div>

        {syncStatus && (
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/80 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Code Snippets for External Web Forms */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span>How to Push Data from Any Web Form to Database</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Copy-paste ready integration code pre-configured with your API Username, Key, and Endpoints:
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['curl', 'js', 'python', 'html'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setCodeLang(lang)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer uppercase ${
                  codeLang === lang
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'js' ? 'JavaScript' : lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800/80 max-h-72">
            {getSnippet()}
          </pre>
          <button
            type="button"
            onClick={handleCopySnippet}
            className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Production Deployment Architecture Guide */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Web & Database Deployment Architecture Guide</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Deploy Web Application</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Build production static files using <code className="text-slate-200">npm run build</code> and host on:
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li><strong className="text-white">Cloud Run / Docker:</strong> Full container with both React & Python backend</li>
              <li><strong className="text-white">Vercel / Netlify:</strong> Instant static edge web hosting</li>
              <li><strong className="text-white">VPS (Ubuntu):</strong> Nginx + Systemd service</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Database Setup</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Choose your preferred persistence layer:
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li><strong className="text-white">Python SQLite:</strong> Zero config, runs via <code className="text-slate-200">python database.py --serve</code></li>
              <li><strong className="text-white">PostgreSQL / Supabase:</strong> Connect via REST API URL</li>
              <li><strong className="text-white">Firebase Firestore:</strong> Real-time cloud database</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Web Form Submissions</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Incoming profile data flow:
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>Submissions from this web app write to the database</li>
              <li>External forms push via <code className="text-slate-200">POST /api/profiles</code></li>
              <li>Auto-generated credentials authenticate all requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
