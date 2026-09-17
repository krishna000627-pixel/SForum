import { ApiConfig, Profile } from '../types';

export interface TestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  latencyMs?: number;
  details?: string;
}

/**
 * Builds the authorization header based on the configured authentication type.
 */
export function getAuthHeaders(config: ApiConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.authType === 'bearer' && config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
    if (config.username) {
      headers['X-API-Username'] = config.username;
    }
  } else if (config.authType === 'basic') {
    const creds = btoa(`${config.username}:${config.apiKey}`);
    headers['Authorization'] = `Basic ${creds}`;
  } else if (config.authType === 'customHeader') {
    const headerName = config.customHeaderName || 'X-API-Key';
    headers[headerName] = config.apiKey;
    if (config.username) {
      headers['X-API-Username'] = config.username;
    }
  }

  return headers;
}

/**
 * Tests an external API endpoint connection.
 */
export async function testApiConnection(config: ApiConfig): Promise<TestResult> {
  const start = performance.now();
  const url = config.baseUrl.replace(/\/+$/, '') + '/health';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(config),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - start);

    if (res.ok) {
      let bodyText = '';
      try {
        const json = await res.json();
        bodyText = JSON.stringify(json);
      } catch {
        bodyText = await res.text();
      }

      return {
        success: true,
        statusCode: res.status,
        latencyMs: latency,
        message: `Connected successfully! (HTTP ${res.status} in ${latency}ms)`,
        details: bodyText.slice(0, 300),
      };
    } else {
      return {
        success: false,
        statusCode: res.status,
        latencyMs: latency,
        message: `Endpoint responded with HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    const latency = Math.round(performance.now() - start);
    // If it's a simulated or local endpoint that cannot be reached directly from browser iframe
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out after 6000ms. Verify the server is running and accessible.',
      };
    }

    return {
      success: false,
      message: `Network/CORS Notice: Browser could not reach '${url}'. Ensure the server allows CORS (Access-Control-Allow-Origin: *) or test via terminal curl. (${err.message || 'Failed to fetch'})`,
      latencyMs: latency,
    };
  }
}

/**
 * Pushes a profile record to the remote API.
 */
export async function pushProfileToApi(
  profile: Partial<Profile>,
  config: ApiConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.enabled || !config.baseUrl) {
    return { success: false, message: 'API sync is disabled or endpoint is missing.' };
  }

  const url = config.baseUrl.replace(/\/+$/, '') + '/profiles';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(config),
      body: JSON.stringify(profile),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return { success: true, message: `Profile pushed to API successfully (HTTP ${res.status})` };
    } else {
      return { success: false, message: `API responded with error ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, message: `Failed to push to API: ${err.message}` };
  }
}

/**
 * Dispatches a webhook notification for web form submission.
 */
export async function dispatchWebhook(
  profile: Partial<Profile>,
  webhookUrl: string,
  event: 'created' | 'updated' = 'created'
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'Invalid webhook URL.' };
  }

  try {
    const payload = {
      event: `profile.${event}`,
      timestamp: new Date().toISOString(),
      profile,
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors', // Allow pushing to third-party endpoints (Zapier, Slack, Make) without CORS rejection
    });

    return { success: true, message: 'Webhook triggered successfully!' };
  } catch (err: any) {
    return { success: false, message: `Webhook error: ${err.message}` };
  }
}

/**
 * Code snippet generators for external web forms and APIs.
 */
export function generateCurlSnippet(config: ApiConfig): string {
  const url = (config.baseUrl || 'https://your-domain.com/api').replace(/\/+$/, '');
  const user = config.username || 'admin_user';
  const key = config.apiKey || 'YOUR_API_KEY';

  let authHeader = '';
  if (config.authType === 'bearer') {
    authHeader = `-H "Authorization: Bearer ${key}" \\\n  -H "X-API-Username: ${user}"`;
  } else if (config.authType === 'basic') {
    authHeader = `-u "${user}:${key}"`;
  } else {
    authHeader = `-H "${config.customHeaderName || 'X-API-Key'}: ${key}" \\\n  -H "X-API-Username: ${user}"`;
  }

  return `curl -X POST "${url}/profiles" \\
  -H "Content-Type: application/json" \\
  ${authHeader} \\
  -d '{
    "fullName": "Samantha Reed",
    "roleTitle": "Data Systems Engineer",
    "category": "Engineering",
    "phone": "+1 (555) 749-2018",
    "email": "samantha.reed@example.com",
    "address": {
      "city": "Austin",
      "country": "United States"
    },
    "customValues": {
      "clearance_level": "Tier 3"
    }
  }'`;
}

export function generateJsSnippet(config: ApiConfig): string {
  const url = (config.baseUrl || 'https://your-domain.com/api').replace(/\/+$/, '');
  const user = config.username || 'admin_user';
  const key = config.apiKey || 'YOUR_API_KEY';

  return `// Web Form Submission Handler (Frontend or Node.js)
async function submitWebForm(formData) {
  const response = await fetch("${url}/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${key}",
      "X-API-Username": "${user}"
    },
    body: JSON.stringify({
      fullName: formData.fullName,
      roleTitle: formData.roleTitle,
      category: formData.category,
      phone: formData.phone,
      email: formData.email,
      address: {
        street: formData.street,
        city: formData.city,
        country: formData.country
      },
      photos: formData.photos || [],
      customValues: formData.customValues || {}
    })
  });

  const result = await response.json();
  console.log("Database Record Saved:", result);
  return result;
}`;
}

export function generatePythonSnippet(config: ApiConfig): string {
  const url = (config.baseUrl || 'https://your-domain.com/api').replace(/\/+$/, '');
  const user = config.username || 'admin_user';
  const key = config.apiKey || 'YOUR_API_KEY';

  return `import requests

API_URL = "${url}/profiles"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${key}",
    "X-API-Username": "${user}"
}

payload = {
    "fullName": "Alex Mercer",
    "roleTitle": "Field Research Analyst",
    "category": "Operations",
    "phone": "+1 555-019-2834",
    "email": "alex.mercer@company.com",
    "address": {
        "city": "Seattle",
        "state": "WA",
        "country": "United States"
    },
    "customValues": {
        "status": "Active"
    }
}

response = requests.post(API_URL, json=payload, headers=HEADERS)
print("Status Code:", response.status_code)
print("Response:", response.json())`;
}

export function generateHtmlFormSnippet(config: ApiConfig): string {
  const url = (config.baseUrl || 'https://your-domain.com/api').replace(/\/+$/, '');
  const user = config.username || 'admin_user';
  const key = config.apiKey || 'YOUR_API_KEY';

  return `<!-- Standalone Web Form to Push Directly to Database -->
<form id="profileWebForm">
  <h3>Register Profile</h3>
  
  <label>Full Name: <input type="text" name="fullName" required /></label><br/>
  <label>Role: <input type="text" name="roleTitle" required /></label><br/>
  <label>Phone: <input type="tel" name="phone" required /></label><br/>
  <label>Email: <input type="email" name="email" required /></label><br/>
  <label>City: <input type="text" name="city" /></label><br/>
  <label>Country: <input type="text" name="country" /></label><br/>

  <button type="submit">Submit to Database</button>
</form>

<script>
document.getElementById('profileWebForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    fullName: f.fullName.value,
    roleTitle: f.roleTitle.value,
    phone: f.phone.value,
    email: f.email.value,
    address: { city: f.city.value, country: f.country.value }
  };

  const res = await fetch('${url}/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${key}',
      'X-API-Username': '${user}'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('Submitted successfully to database!');
    f.reset();
  } else {
    alert('Submission failed. Check API configuration.');
  }
});
</script>`;
}
