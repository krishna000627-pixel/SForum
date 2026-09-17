import { Profile, CustomField, AccessPass, ApiConfig, GoogleDriveBackendConfig } from '../types';
import { INITIAL_PROFILES, INITIAL_CUSTOM_FIELDS, INITIAL_ACCESS_PASSES } from '../data/initialData';

const PROFILES_KEY = 'nexusdb_profiles_v1';
const FIELDS_KEY = 'nexusdb_fields_v1';
const PASSES_KEY = 'nexusdb_passes_v1';
const ADMIN_PIN_KEY = 'nexusdb_admin_pin_v1';
const API_CONFIG_KEY = 'nexusdb_api_config_v1';
const DRIVE_CONFIG_KEY = 'nexusdb_drive_config_v1';

export const DEFAULT_DRIVE_CONFIG: GoogleDriveBackendConfig = {
  enabled: false,
  fileName: 'nexus_profile_database.json',
  autoSyncOnChanges: true,
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  enabled: false,
  baseUrl: 'http://localhost:8080/api',
  username: 'admin_agent_01',
  apiKey: 'nxk_live_9d82f710a6234b8c910e',
  authType: 'bearer',
  customHeaderName: 'X-API-Key',
  webhookUrl: 'https://webhook.site/demo-endpoint',
  autoSyncOnSubmit: false,
};

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load profiles from storage', e);
  }
  saveProfiles(INITIAL_PROFILES);
  return INITIAL_PROFILES;
}

export function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to storage', e);
  }
}

export function loadCustomFields(): CustomField[] {
  try {
    const raw = localStorage.getItem(FIELDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load custom fields from storage', e);
  }
  saveCustomFields(INITIAL_CUSTOM_FIELDS);
  return INITIAL_CUSTOM_FIELDS;
}

export function saveCustomFields(fields: CustomField[]): void {
  try {
    localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
  } catch (e) {
    console.error('Failed to save custom fields to storage', e);
  }
}

export function loadAccessPasses(): AccessPass[] {
  try {
    const raw = localStorage.getItem(PASSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load access passes from storage', e);
  }
  saveAccessPasses(INITIAL_ACCESS_PASSES);
  return INITIAL_ACCESS_PASSES;
}

export function saveAccessPasses(passes: AccessPass[]): void {
  try {
    localStorage.setItem(PASSES_KEY, JSON.stringify(passes));
  } catch (e) {
    console.error('Failed to save access passes to storage', e);
  }
}

export function getAdminPin(): string {
  try {
    return localStorage.getItem(ADMIN_PIN_KEY) || 'Krishna@1987';
  } catch {
    return 'Krishna@1987';
  }
}

export function setAdminPin(pin: string): void {
  try {
    localStorage.setItem(ADMIN_PIN_KEY, pin);
  } catch (e) {
    console.error('Failed to set admin pin', e);
  }
}

export function loadApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(API_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_API_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load API config from storage', e);
  }
  return DEFAULT_API_CONFIG;
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save API config to storage', e);
  }
}

export function loadDriveConfig(): GoogleDriveBackendConfig {
  try {
    const raw = localStorage.getItem(DRIVE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DRIVE_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load Google Drive config from storage', e);
  }
  return DEFAULT_DRIVE_CONFIG;
}

export function saveDriveConfig(config: GoogleDriveBackendConfig): void {
  try {
    localStorage.setItem(DRIVE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Google Drive config to storage', e);
  }
}

export function resetToDefaults(): {
  profiles: Profile[];
  fields: CustomField[];
  passes: AccessPass[];
  apiConfig: ApiConfig;
  driveConfig: GoogleDriveBackendConfig;
} {
  saveProfiles(INITIAL_PROFILES);
  saveCustomFields(INITIAL_CUSTOM_FIELDS);
  saveAccessPasses(INITIAL_ACCESS_PASSES);
  saveApiConfig(DEFAULT_API_CONFIG);
  saveDriveConfig(DEFAULT_DRIVE_CONFIG);
  setAdminPin('admin123');
  return {
    profiles: INITIAL_PROFILES,
    fields: INITIAL_CUSTOM_FIELDS,
    passes: INITIAL_ACCESS_PASSES,
    apiConfig: DEFAULT_API_CONFIG,
    driveConfig: DEFAULT_DRIVE_CONFIG,
  };
}
