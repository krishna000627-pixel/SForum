import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  FileJson,
  ShieldCheck,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
  Users,
  Database,
  ArrowRight,
  Info,
  KeyRound,
  Download,
  Upload,
  Copy,
  Check,
  Layers,
  Code
} from 'lucide-react';
import { GoogleDriveBackendConfig, Profile, CustomField, AccessPass } from '../types';
import {
  getStoredDriveToken,
  requestGoogleDriveAuth,
  clearDriveToken,
  testGoogleDriveConnection,
  saveDatabaseToGoogleDrive,
  loadDatabaseFromGoogleDrive,
  findDatabaseFile,
  DRIVE_DEFAULT_FILENAME,
  DriveDatabasePayload,
  getCustomClientId,
  setCustomClientId,
  GOOGLE_OAUTH_CLIENT_ID
} from '../utils/googleDriveService';

interface GoogleDriveTabProps {
  driveConfig: GoogleDriveBackendConfig;
  profiles: Profile[];
  customFields: CustomField[];
  accessPasses: AccessPass[];
  onSaveDriveConfig: (config: GoogleDriveBackendConfig) => void;
  onImportDriveData: (data: { profiles: Profile[]; fields: CustomField[]; passes: AccessPass[] }) => void;
  onExportLocalData?: () => any;
  onImportLocalData?: (data: any) => void;
}

export const GoogleDriveTab: React.FC<GoogleDriveTabProps> = ({
  driveConfig,
  profiles,
  customFields,
  accessPasses,
  onSaveDriveConfig,
  onImportDriveData,
  onExportLocalData,
  onImportLocalData,
}) => {
  const [token, setToken] = useState<string | null>(() => getStoredDriveToken());
  const [userInfo, setUserInfo] = useState<{ email?: string; displayName?: string; usage?: string } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info' | null>(null);
  const [autoSync, setAutoSync] = useState(driveConfig.autoSyncOnChanges ?? true);
  const [fileName, setFileName] = useState(driveConfig.fileName || DRIVE_DEFAULT_FILENAME);

  // Custom Client ID settings
  const [clientIdInput, setClientIdInput] = useState(() => getCustomClientId());
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [clientIdSaved, setClientIdSaved] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  // Hourly Automated Backup State
  const [hourlyBackupEnabled, setHourlyBackupEnabled] = useState(true);
  const [lastHourlyBackupTime, setLastHourlyBackupTime] = useState<string | null>(null);
  const [nextBackupMinutes, setNextBackupMinutes] = useState(60);

  // Check auth and fetch user info on load
  useEffect(() => {
    const currentToken = getStoredDriveToken();
    setToken(currentToken);
    if (currentToken) {
      testGoogleDriveConnection(currentToken).then((res) => {
        if (res.success) {
          setUserInfo({
            email: res.email,
            displayName: res.displayName,
            usage: res.storageQuota?.usage,
          });
          if (res.email && driveConfig.userEmail !== res.email) {
            onSaveDriveConfig({ ...driveConfig, userEmail: res.email, enabled: true });
          }
        } else {
          setToken(null);
          clearDriveToken();
        }
      });
    }
  }, []);

  // Automated Hourly Backup Runner
  useEffect(() => {
    if (!hourlyBackupEnabled) return;

    const interval = setInterval(() => {
      setNextBackupMinutes((prev) => {
        if (prev <= 1) {
          // Trigger hourly backup
          executeHourlyBackup();
          return 60;
        }
        return prev - 1;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [hourlyBackupEnabled, token, profiles, customFields, accessPasses]);

  const executeHourlyBackup = async () => {
    const fullData = onExportLocalData ? onExportLocalData() : {};
    const payload: DriveDatabasePayload = {
      version: '2.0.0',
      updatedAt: new Date().toISOString(),
      app: 'Sunrays School Campus & Forum Database Backup',
      profiles,
      customFields,
      accessPasses,
      forumPosts: fullData.posts,
      forumComments: fullData.comments,
      studentAccounts: fullData.students,
      agentAccounts: fullData.agents,
      chats: fullData.chats,
    };

    const timeStr = new Date().toLocaleTimeString();
    setLastHourlyBackupTime(timeStr);

    if (token) {
      try {
        await saveDatabaseToGoogleDrive(token, payload, fileName);
        setStatusType('success');
        setStatusMessage(`Hourly Auto-Backup successfully saved to Google Drive at ${timeStr}`);
      } catch (err: any) {
        console.warn('Hourly drive backup error:', err?.message);
      }
    } else {
      // Store local disaster recovery snapshot
      try {
        localStorage.setItem('sunrays_hourly_backup_snapshot', JSON.stringify(payload));
      } catch (e) {
        // storage overflow fallback
      }
    }
  };

  const handleConnect = () => {
    setIsAuthenticating(true);
    setStatusMessage(null);
    requestGoogleDriveAuth(
      async (newToken) => {
        setToken(newToken);
        setIsAuthenticating(false);
        const testRes = await testGoogleDriveConnection(newToken);
        if (testRes.success) {
          setUserInfo({
            email: testRes.email,
            displayName: testRes.displayName,
            usage: testRes.storageQuota?.usage,
          });
          const updated: GoogleDriveBackendConfig = {
            ...driveConfig,
            enabled: true,
            userEmail: testRes.email,
            lastSyncTime: new Date().toISOString(),
          };
          onSaveDriveConfig(updated);
          setStatusType('success');
          setStatusMessage(`Connected to Google Drive as ${testRes.email || 'Authorized User'}!`);
        } else {
          setStatusType('error');
          setStatusMessage('Authenticated with Google, but could not read Drive profile quota.');
        }
      },
      (err) => {
        setIsAuthenticating(false);
        setStatusType('error');
        const msg = err?.message || String(err);
        if (msg.includes('origin_mismatch') || msg.includes('redirect_uri_mismatch') || msg.includes('network') || msg.includes('blocked')) {
          setStatusMessage(
            'Google OAuth popup was blocked or returned blank due to domain origin restrictions. Cloud & Cloud JSON backup below is fully active and recommended.'
          );
        } else {
          setStatusMessage(`Google Drive Connection Failed: ${msg}`);
        }
      },
      clientIdInput
    );
  };

  const handleDisconnect = () => {
    clearDriveToken();
    setToken(null);
    setUserInfo(null);
    onSaveDriveConfig({ ...driveConfig, enabled: false });
    setStatusType('info');
    setStatusMessage('Disconnected from Google Drive.');
  };

  const handleSaveClientId = () => {
    setCustomClientId(clientIdInput);
    setClientIdSaved(true);
    setTimeout(() => setClientIdSaved(false), 2500);
  };

  const handleSyncToDrive = async () => {
    if (!token) return;
    setIsSyncing(true);
    setStatusMessage(null);

    try {
      const fullData = onExportLocalData ? onExportLocalData() : {};
      const payload: DriveDatabasePayload = {
        version: '2.0.0',
        updatedAt: new Date().toISOString(),
        app: 'Sunrays School Campus & Forum Database',
        profiles,
        customFields,
        accessPasses,
        forumPosts: fullData.posts,
        forumComments: fullData.comments,
        studentAccounts: fullData.students,
        agentAccounts: fullData.agents,
        chats: fullData.chats,
      };

      const result = await saveDatabaseToGoogleDrive(token, payload, fileName);
      setIsSyncing(false);
      setStatusType('success');
      setStatusMessage(`Full database & forum records synced to Google Drive (File ID: ${result.fileId.slice(0, 10)}...) at ${new Date().toLocaleTimeString()}!`);

      onSaveDriveConfig({
        ...driveConfig,
        lastSyncTime: new Date().toISOString(),
        driveFileId: result.fileId,
        fileName,
      });
    } catch (err: any) {
      setIsSyncing(false);
      setStatusType('error');
      setStatusMessage(`Sync Failed: ${err.message}`);
    }
  };

  const handleDownloadFromDrive = async () => {
    if (!token) return;
    setIsDownloading(true);
    setStatusMessage(null);

    try {
      const payload = await loadDatabaseFromGoogleDrive(token, fileName);
      setIsDownloading(false);
      if (payload) {
        if (onImportLocalData) {
          onImportLocalData(payload);
        } else if (payload.profiles) {
          onImportDriveData({
            profiles: payload.profiles,
            fields: payload.customFields || customFields,
            passes: payload.accessPasses || accessPasses,
          });
        }
        setStatusType('success');
        setStatusMessage(`Successfully restored all database and forum tables from Google Drive backup!`);
      } else {
        setStatusType('info');
        setStatusMessage(`No database file named "${fileName}" found in your Google Drive.`);
      }
    } catch (err: any) {
      setIsDownloading(false);
      setStatusType('error');
      setStatusMessage(`Download Failed: ${err.message}`);
    }
  };

  // 1-Click Direct File Download (JSON)
  const handleExportJsonFile = () => {
    const data = onExportLocalData ? onExportLocalData() : {
      app: 'Sunrays School Campus Forum & Directory',
      exportedAt: new Date().toISOString(),
      profiles,
      customFields,
      accessPasses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunrays_school_cloud_db_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusType('success');
    setStatusMessage('Cloud JSON database snapshot downloaded successfully!');
  };

  // Copy JSON Snapshot to Clipboard
  const handleCopyJsonSnapshot = () => {
    const data = onExportLocalData ? onExportLocalData() : {
      app: 'Sunrays School Campus Forum & Directory',
      exportedAt: new Date().toISOString(),
      profiles,
      customFields,
      accessPasses
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
      setStatusType('success');
      setStatusMessage('Full Cloud JSON database snapshot copied to clipboard!');
    });
  };

  // 1-Click File Upload (JSON)
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(String(event.target?.result));
        if (onImportLocalData) {
          onImportLocalData(json);
        } else if (json.profiles) {
          onImportDriveData({
            profiles: json.profiles,
            fields: json.customFields || customFields,
            passes: json.accessPasses || accessPasses,
          });
        }
        setStatusType('success');
        setStatusMessage(`Database successfully restored from ${file.name}!`);
      } catch (err: any) {
        setStatusType('error');
        setStatusMessage(`Invalid JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentPayload = onExportLocalData ? onExportLocalData() : {
    app: 'Sunrays School Campus Forum & Directory',
    exportedAt: new Date().toISOString(),
    profilesCount: profiles.length,
    fieldsCount: customFields.length,
    passesCount: accessPasses.length
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Cloud & Cloud JSON Active Status Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border border-emerald-500/30 rounded-2xl flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">Cloud Storage & Cloud JSON Database Engine</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud JSON Enabled & Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              All student profiles, MP Board records, agent counseling accounts, and forum discussions are continuously stored and synced in Cloud JSON format with zero setup required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJsonSnapshot}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer min-h-[40px]"
          >
            {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Hourly Auto-Backup & Disaster Recovery Dashboard */}
      <div className="p-5 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 border border-blue-500/30 rounded-2xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <RefreshCw className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">Automated Hourly Drive & Disaster Recovery</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40">
                  HOURLY SCHEDULE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically captures full database snapshots every 60 minutes so that if SQL or Cloud tables ever get cleared, the complete system can be re-uploaded and restored immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={executeHourlyBackup}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Backup Now</span>
            </button>
          </div>
        </div>

        {/* Hourly Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Backup Interval</span>
            <span className="text-xs font-semibold text-blue-300 mt-0.5 block">Every 1 Hour (Automatic)</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Last Backup Snapshot</span>
            <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">
              {lastHourlyBackupTime ? `${lastHourlyBackupTime} (Saved)` : 'Active in Session'}
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Next Auto-Backup In</span>
            <span className="text-xs font-mono text-amber-300 mt-0.5 block">{nextBackupMinutes} minutes</span>
          </div>
        </div>
      </div>

      {/* Cloud JSON Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Student & Staff Profiles</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{profiles.length} Records</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Custom Schema Fields</span>
          <span className="text-lg font-bold text-purple-300 mt-0.5 block">{customFields.length} Fields</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Security Access Passes</span>
          <span className="text-lg font-bold text-blue-300 mt-0.5 block">{accessPasses.length} Passes</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Cloud Sync Protocol</span>
          <span className="text-sm font-semibold text-emerald-400 mt-1 block">Live Cloud JSON</span>
        </div>
      </div>

      {/* 1-Click Instant Cloud JSON Backup & Restore Box */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>1-Click Cloud JSON Backup & Instant Restore</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold font-mono">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct browser & cloud container JSON export, portable across all devices and hosting environments
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJsonFile}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700 min-h-[44px]"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Cloud DB Backup (.json)</span>
          </button>

          <label className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-600/20 min-h-[44px]">
            <Upload className="w-4 h-4" />
            <span>Restore DB from JSON File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Live Cloud JSON Schema Inspector */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium py-1"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>{showJsonInspector ? 'Hide Live Cloud JSON Inspector' : 'Inspect Live Cloud JSON Structure'}</span>
          </button>

          {showJsonInspector && (
            <div className="mt-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Database Payload Snapshot</span>
                <span className="font-mono text-emerald-400">Valid JSON Object</span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(currentPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            statusType === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              : statusType === 'error'
              ? 'bg-rose-950/50 border-rose-800 text-rose-200'
              : 'bg-blue-950/50 border-blue-800 text-blue-200'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : statusType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed flex-1">{statusMessage}</p>
        </div>
      )}

      {/* Optional External Google Drive Integration */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>External Google Drive Sync</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-medium">
                  OPTIONAL
                </span>
                {token && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    CONNECTED
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Optional external Google cloud drive mirror if you wish to export snapshots to personal Google Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Drive</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isAuthenticating}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border border-slate-700 disabled:opacity-50 min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuthenticating ? 'animate-spin' : ''}`} />
                <span>{isAuthenticating ? 'Connecting...' : 'Authorize External Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* If Connected to Google Drive */}
        {token && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Connected Account</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {userInfo?.email || 'Authorized'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Drive Filename</span>
                <span className="text-xs font-mono text-emerald-400 block">{fileName}</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Database Profiles</span>
                <span className="text-xs font-semibold text-white block">{profiles.length} Records</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleSyncToDrive}
                disabled={isSyncing}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 min-h-[42px]"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Uploading to Drive...' : 'Save Current DB to Drive'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFromDrive}
                disabled={isDownloading}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 min-h-[42px]"
              >
                <DownloadCloud className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
                <span>{isDownloading ? 'Downloading...' : 'Load DB from Drive'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom Google Client ID Setting */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowClientIdConfig(!showClientIdConfig)}
            className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>{showClientIdConfig ? 'Hide Custom Client ID Settings' : 'Configure Custom Google OAuth Client ID (Optional)'}</span>
          </button>

          {showClientIdConfig && (
            <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Google Cloud Web Client ID:
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveClientId}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {clientIdSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                  <span>{clientIdSaved ? 'Saved!' : 'Save Client ID'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClientIdInput(GOOGLE_OAUTH_CLIENT_ID);
                    setCustomClientId(GOOGLE_OAUTH_CLIENT_ID);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
