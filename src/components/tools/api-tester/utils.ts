import { ApiRequestState, Environment, KeyValueParam } from './types';

/**
 * Replaces {{variable}} placeholders with environment variable values.
 */
export function replaceEnvVars(text: string, env: Environment | null): string {
  if (!text || !env || !env.variables) return text;
  let result = text;
  for (const v of env.variables) {
    if (v.enabled && v.key.trim()) {
      const regex = new RegExp(`{{\\s*${v.key.trim()}\\s*}}`, 'g');
      result = result.replace(regex, v.value);
    }
  }
  return result;
}

/**
 * Extracts query parameters from URL string into KeyValueParam array.
 */
export function parseQueryFromUrl(fullUrl: string): { baseUrl: string; params: KeyValueParam[] } {
  try {
    const qIndex = fullUrl.indexOf('?');
    if (qIndex === -1) {
      return { baseUrl: fullUrl, params: [] };
    }
    const baseUrl = fullUrl.substring(0, qIndex);
    const queryString = fullUrl.substring(qIndex + 1);
    const searchParams = new URLSearchParams(queryString);
    const params: KeyValueParam[] = [];

    searchParams.forEach((val, key) => {
      params.push({
        id: 'param_' + Math.random().toString(36).substring(2, 9),
        key,
        value: val,
        enabled: true,
      });
    });

    return { baseUrl, params };
  } catch {
    return { baseUrl: fullUrl, params: [] };
  }
}

/**
 * Resolves path parameters in URL templates like /posts/{id} with actual values.
 */
export function resolveUrlPathParams(url: string, pathParams?: KeyValueParam[], env?: Environment | null): string {
  if (!url) return '';
  let resolved = url;
  if (pathParams && pathParams.length > 0) {
    pathParams.forEach(p => {
      if (p.key && p.value !== undefined && p.value !== '') {
        const val = env ? replaceEnvVars(String(p.value), env) : String(p.value);
        const regex = new RegExp(`\\{${p.key.trim()}\\}([/?#]|$)`, 'g');
        resolved = resolved.replace(new RegExp(`\\{${p.key.trim()}\\}`,'g'), encodeURIComponent(val));
      }
    });
  }
  return resolved;
}

/**
 * Builds the complete URL by combining base URL, query params, path params, and environment variables.
 */
export function buildUrlWithParams(
  rawUrl: string,
  params: KeyValueParam[],
  env: Environment | null,
  pathParams?: KeyValueParam[]
): string {
  let urlWithEnv = replaceEnvVars(rawUrl.trim(), env);
  if (!urlWithEnv) return '';

  if (pathParams && pathParams.length > 0) {
    urlWithEnv = resolveUrlPathParams(urlWithEnv, pathParams, env);
  }

  const qIndex = urlWithEnv.indexOf('?');
  const base = qIndex !== -1 ? urlWithEnv.substring(0, qIndex) : urlWithEnv;

  // Gather existing params if any in base URL
  const existingParams = new URLSearchParams(qIndex !== -1 ? urlWithEnv.substring(qIndex + 1) : '');

  // Add enabled params from table (if not already handled)
  const finalParams = new URLSearchParams();
  existingParams.forEach((val, key) => {
    finalParams.append(key, val);
  });

  for (const p of params) {
    if (p.enabled && p.key.trim()) {
      const cleanKey = replaceEnvVars(p.key.trim(), env);
      const cleanVal = replaceEnvVars(p.value, env);
      // If base already had it, we don't duplicate needlessly unless intended
      if (!existingParams.has(cleanKey)) {
        finalParams.append(cleanKey, cleanVal);
      }
    }
  }

  const qs = finalParams.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Assembles all active headers including Auth headers and content-type.
 */
export function buildEffectiveHeaders(
  headers: KeyValueParam[],
  auth: ApiRequestState['auth'],
  bodyType: ApiRequestState['bodyType'],
  env: Environment | null
): Record<string, string> {
  const result: Record<string, string> = {};

  // Custom user headers
  for (const h of headers) {
    if (h.enabled && h.key.trim()) {
      result[replaceEnvVars(h.key.trim(), env)] = replaceEnvVars(h.value, env);
    }
  }

  // Authorization headers
  if (auth.type === 'bearer' && auth.bearerToken) {
    const token = replaceEnvVars(auth.bearerToken.trim(), env);
    result['Authorization'] = `Bearer ${token}`;
  } else if (auth.type === 'basic' && (auth.basicUsername || auth.basicPassword)) {
    const u = replaceEnvVars(auth.basicUsername || '', env);
    const p = replaceEnvVars(auth.basicPassword || '', env);
    const b64 = btoa(`${u}:${p}`);
    result['Authorization'] = `Basic ${b64}`;
  } else if (auth.type === 'apikey' && auth.apiKeyName && auth.apiKeyValue) {
    if (auth.apiKeyLocation === 'header' || !auth.apiKeyLocation) {
      result[replaceEnvVars(auth.apiKeyName.trim(), env)] = replaceEnvVars(auth.apiKeyValue, env);
    }
  }

  // Body Content-Type if not manually overridden
  const hasContentType = Object.keys(result).some(k => k.toLowerCase() === 'content-type');
  if (!hasContentType) {
    if (bodyType === 'json') {
      result['Content-Type'] = 'application/json';
    } else if (bodyType === 'x-www-form-urlencoded') {
      result['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }

  return result;
}

/**
 * Builds request body payload based on bodyType.
 */
export function buildRequestBody(
  request: ApiRequestState,
  env: Environment | null
): string | undefined {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method) || request.bodyType === 'none') {
    return undefined;
  }

  if (request.bodyType === 'json' || request.bodyType === 'raw') {
    return replaceEnvVars(request.rawBody || '', env);
  }

  if (request.bodyType === 'x-www-form-urlencoded') {
    const sp = new URLSearchParams();
    for (const item of request.urlEncodedData) {
      if (item.enabled && item.key.trim()) {
        sp.append(replaceEnvVars(item.key.trim(), env), replaceEnvVars(item.value, env));
      }
    }
    return sp.toString();
  }

  if (request.bodyType === 'form-data') {
    // For proxy serialization, serialize to JSON representation or key-value
    const obj: Record<string, string> = {};
    for (const item of request.formData) {
      if (item.enabled && item.key.trim()) {
        obj[replaceEnvVars(item.key.trim(), env)] = replaceEnvVars(item.value, env);
      }
    }
    return JSON.stringify(obj);
  }

  return undefined;
}

/**
 * Generates an executable cURL command string.
 */
export function generateCurl(request: ApiRequestState, env: Environment | null): string {
  const finalUrl = buildUrlWithParams(request.url, request.params, env);
  const headers = buildEffectiveHeaders(request.headers, request.auth, request.bodyType, env);
  const body = buildRequestBody(request, env);

  const parts = [`curl -X ${request.method} "${finalUrl || 'https://api.example.com'}"`];

  for (const [k, v] of Object.entries(headers)) {
    parts.push(`  -H "${k}: ${v}"`);
  }

  if (body && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const escaped = body.replace(/"/g, '\\"');
    parts.push(`  -d "${escaped}"`);
  }

  return parts.join(' \\\n');
}

/**
 * Generates code snippet in multiple programming languages.
 */
export function generateCodeSnippet(
  lang: 'fetch' | 'axios' | 'python' | 'go' | 'php',
  request: ApiRequestState,
  env: Environment | null
): string {
  const finalUrl = buildUrlWithParams(request.url, request.params, env) || 'https://api.example.com';
  const headers = buildEffectiveHeaders(request.headers, request.auth, request.bodyType, env);
  const body = buildRequestBody(request, env);

  switch (lang) {
    case 'fetch':
      return `// JavaScript (Native Fetch)
const response = await fetch("${finalUrl}", {
  method: "${request.method}",
  headers: ${JSON.stringify(headers, null, 2)},
${body && !['GET', 'HEAD'].includes(request.method) ? `  body: JSON.stringify(${body.startsWith('{') || body.startsWith('[') ? body : JSON.stringify(body)}),\n` : ''}});
const data = await response.json();
console.log(data);`;

    case 'axios':
      return `// JavaScript / TypeScript (Axios)
import axios from 'axios';

const response = await axios({
  method: '${request.method.toLowerCase()}',
  url: '${finalUrl}',
  headers: ${JSON.stringify(headers, null, 2)},
${body && !['GET', 'HEAD'].includes(request.method) ? `  data: ${body.startsWith('{') || body.startsWith('[') ? body : JSON.stringify(body)},\n` : ''}});
console.log(response.data);`;

    case 'python':
      return `# Python (requests)
import requests

url = "${finalUrl}"
headers = ${JSON.stringify(headers, null, 4)}
${body && !['GET', 'HEAD'].includes(request.method) ? `payload = ${body.startsWith('{') || body.startsWith('[') ? body : JSON.stringify(body)}\nresponse = requests.${request.method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${request.method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;

    case 'go':
      return `// Go (net/http)
package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t${body ? '"strings"' : ''}
)

func main() {
\tclient := &http.Client{}
${body ? `\tbody := strings.NewReader(\`${body}\`)\n\treq, err := http.NewRequest("${request.method}", "${finalUrl}", body)` : `\treq, err := http.NewRequest("${request.method}", "${finalUrl}", nil)`}
\tif err != nil {
\t\tpanic(err)
\t}

${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
  .join('\n')}

\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbytes, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(bytes))
}`;

    case 'php':
      return `<?php
// PHP (cURL)
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${finalUrl}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${request.method}",
${body ? `  CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',\n` : ''}  CURLOPT_HTTPHEADER => [
${Object.entries(headers)
  .map(([k, v]) => `    "${k}: ${v}",`)
  .join('\n')}
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`;

    default:
      return generateCurl(request, env);
  }
}

/**
 * Formats byte size into human readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats response latency in milliseconds.
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Returns color classes corresponding to HTTP status code.
 */
export function getStatusColorClass(status: number): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  if (status >= 200 && status < 300) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    };
  }
  if (status >= 300 && status < 400) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/30',
      dot: 'bg-blue-500',
    };
  }
  if (status >= 400 && status < 500) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    };
  }
  if (status >= 500) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500',
    };
  }
  return {
    bg: 'bg-stone-500/10 dark:bg-zinc-700/30',
    text: 'text-stone-700 dark:text-zinc-300',
    border: 'border-stone-500/30',
    dot: 'bg-stone-400',
  };
}

/**
 * Returns color badge for HTTP Method.
 */
export function getMethodBadgeClass(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'POST':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'PUT':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    case 'PATCH':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'DELETE':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    case 'HEAD':
      return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30';
    case 'OPTIONS':
    default:
      return 'bg-stone-500/15 text-stone-700 dark:text-zinc-300 border-stone-500/30';
  }
}
