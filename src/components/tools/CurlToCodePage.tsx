import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Terminal,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  Code2,
  Sparkles,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Share2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: string | null;
  auth: { user: string; pass: string } | null;
}

const SAMPLE_CURLS = [
  {
    name: 'POST JSON with Bearer Token',
    nameId: 'POST JSON dengan Bearer Token',
    curl: `curl -X POST "https://api.example.com/v1/orders" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "customer_id": 4821,
    "items": [
      {"sku": "KB-MECH-01", "quantity": 1}
    ],
    "payment_method": "credit_card"
  }'`,
  },
  {
    name: 'GET with Query Params & Headers',
    nameId: 'GET dengan Parameter URL & Header',
    curl: `curl -X GET "https://api.github.com/repos/facebook/react/issues?state=open&sort=created&per_page=10" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -H "User-Agent: Awesome-App"`,
  },
  {
    name: 'PUT Form-URL-Encoded',
    nameId: 'PUT dengan x-www-form-urlencoded',
    curl: `curl -X PUT "https://httpbin.org/put" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  --data "status=active&priority=high&assigned_to=irvan"`,
  },
];

// Parser function for standard cURL strings
function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    data: null,
    auth: null,
  };

  if (!curlCommand || !curlCommand.trim()) return result;

  // Clean multiline escapes and normalize spaces
  const cleaned = curlCommand.replace(/\\\r?\n/g, ' ').trim();
  // Regex to match args while preserving quotes
  const argRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens: string[] = [];
  let match;

  while ((match = argRegex.exec(cleaned)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      if (tokens[i + 1]) {
        result.method = tokens[i + 1].toUpperCase();
        i++;
      }
    } else if (token === '-H' || token === '--header') {
      if (tokens[i + 1]) {
        const headerStr = tokens[i + 1];
        const splitIdx = headerStr.indexOf(':');
        if (splitIdx > 0) {
          const key = headerStr.slice(0, splitIdx).trim();
          const val = headerStr.slice(splitIdx + 1).trim();
          result.headers[key] = val;
        }
        i++;
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      if (tokens[i + 1]) {
        result.data = tokens[i + 1];
        if (result.method === 'GET') result.method = 'POST';
        i++;
      }
    } else if (token === '-u' || token === '--user') {
      if (tokens[i + 1]) {
        const [user, pass] = tokens[i + 1].split(':');
        result.auth = { user: user || '', pass: pass || '' };
        i++;
      }
    } else if (!result.url && (token.startsWith('http://') || token.startsWith('https://'))) {
      result.url = token;
    }
  }

  if (!result.url) {
    // Look for any string with domain pattern
    const potentialUrl = tokens.find(t => t.startsWith('http') || t.includes('.'));
    if (potentialUrl && potentialUrl !== 'curl') {
      result.url = potentialUrl;
    }
  }

  return result;
}

// Generators for multiple languages
function generateCodeSnippet(parsed: ParsedCurl, target: string): string {
  const { method, url, headers, data, auth } = parsed;
  const safeUrl = url || 'https://api.example.com/endpoint';

  // Include Basic Auth header if present
  const finalHeaders = { ...headers };
  if (auth) {
    const encoded = btoa(`${auth.user}:${auth.pass}`);
    finalHeaders['Authorization'] = `Basic ${encoded}`;
  }

  let isJson = false;
  let parsedJsonBody: any = null;
  if (data) {
    try {
      parsedJsonBody = JSON.parse(data);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  switch (target) {
    case 'fetch': {
      const headerEntries = Object.entries(finalHeaders);
      let headersCode = '';
      if (headerEntries.length > 0) {
        headersCode = `,\n  headers: {\n${headerEntries.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n  }`;
      }
      let bodyCode = '';
      if (data && method !== 'GET') {
        bodyCode = isJson
          ? `,\n  body: JSON.stringify(${JSON.stringify(parsedJsonBody, null, 2).split('\n').join('\n  ')})`
          : `,\n  body: ${JSON.stringify(data)}`;
      }

      return `// Modern JavaScript / TypeScript (fetch)
async function sendRequest() {
  try {
    const response = await fetch(${JSON.stringify(safeUrl)}, {
      method: ${JSON.stringify(method)}${headersCode}${bodyCode}
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Request failed:', error);
  }
}

sendRequest();`;
    }

    case 'axios': {
      const headerEntries = Object.entries(finalHeaders);
      return `// JavaScript / TypeScript (Axios)
import axios from 'axios';

async function sendRequest() {
  try {
    const response = await axios({
      method: ${JSON.stringify(method.toLowerCase())},
      url: ${JSON.stringify(safeUrl)},${
        headerEntries.length > 0
          ? `\n      headers: {\n${headerEntries.map(([k, v]) => `        ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n      },`
          : ''
      }${
        data && method !== 'GET'
          ? `\n      data: ${isJson ? JSON.stringify(parsedJsonBody, null, 2).split('\n').join('\n      ') : JSON.stringify(data)},`
          : ''
      }
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
  }
}

sendRequest();`;
    }

    case 'python': {
      const headerEntries = Object.entries(finalHeaders);
      const pythonMethod = method.toLowerCase();
      let bodyArg = '';
      if (data && method !== 'GET') {
        bodyArg = isJson
          ? `\n    json=${JSON.stringify(parsedJsonBody, null, 4).split('\n').join('\n    ')},`
          : `\n    data=${JSON.stringify(data)},`;
      }

      return `# Python 3 (requests)
import requests
import json

url = "${safeUrl}"
${
  headerEntries.length > 0
    ? `headers = {\n${headerEntries.map(([k, v]) => `    "${k}": "${v}"`).join(',\n')}\n}`
    : `headers = {}`
}

try:
    response = requests.${pythonMethod}(
        url,
        headers=headers,${bodyArg}
        timeout=15
    )
    response.raise_for_status()
    print("Status:", response.status_code)
    print("Response:", response.json() if "application/json" in response.headers.get("Content-Type", "") else response.text)
except requests.exceptions.RequestException as e:
    print(f"Error occurred: {e}")`;
    }

    case 'go': {
      return `// Go (net/http)
package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)

func main() {
\turl := "${safeUrl}"
\tvar reqBody io.Reader = nil

\t${
  data && method !== 'GET'
    ? `payload := strings.NewReader(\`${data}\`)\n\treqBody = payload`
    : `// No request body`
}

\treq, err := http.NewRequest("${method}", url, reqBody)
\tif err != nil {
\t\tpanic(err)
\t}

\t${Object.entries(finalHeaders)
  .map(([k, v]) => `req.Header.Add("${k}", "${v}")`)
  .join('\n\t')}

\tclient := &http.Client{}
\tres, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, err := io.ReadAll(res.Body)
\tif err != nil {
\t\tpanic(err)
\t}

\tfmt.Println("Status Code:", res.StatusCode)
\tfmt.Println(string(tbody))
}`;
    }

    case 'php': {
      return `<?php
// PHP (cURL)
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${safeUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  ${
    data && method !== 'GET'
      ? `CURLOPT_POSTFIELDS => ${JSON.stringify(data)},\n  `
      : ''
  }CURLOPT_HTTPHEADER => array(
    ${Object.entries(finalHeaders).map(([k, v]) => `'${k}: ${v}'`).join(",\n    ")}
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
?>`;
    }

    default:
      return '';
  }
}

export const CurlToCodePage: React.FC = () => {
  const { language } = usePortfolio();

  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURLS[0].curl);
  const [selectedLang, setSelectedLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'php'>('fetch');
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');

  const parsed = useMemo(() => {
    return parseCurl(curlInput);
  }, [curlInput]);

  const outputCode = useMemo(() => {
    return generateCodeSnippet(parsed, selectedLang);
  }, [parsed, selectedLang]);

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      fetch: 'ts',
      axios: 'ts',
      python: 'py',
      go: 'go',
      php: 'php',
    };
    const ext = extMap[selectedLang] || 'txt';
    const blob = new Blob([outputCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curl-request.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'cURL to Code Converter (Fetch, Axios, Python, Go, PHP) — Muchamad Irvan' : 'Konverter cURL ke Kode Siap Pakai — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Convert raw cURL commands into production-ready HTTP code for JavaScript Fetch, Axios, Python requests, Go, and PHP instantly.'
            : 'Ubah perintah cURL mentah menjadi kode HTTP siap pakai untuk JS Fetch, Axios, Python, Go, dan PHP secara instan di browser.'
        }
        url="/tools/curl-to-code"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Tools"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Terminal size={13} />
              <span>HTTP Code Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'cURL to Multi-Language Code Converter' : 'Konverter cURL ke Multi-Bahasa'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Paste any raw cURL command to instantly generate clean, production-ready code in Fetch, Axios, Python, Go, or PHP.'
              : 'Tempel perintah cURL dari browser atau terminal untuk langsung menghasilkan kode pemanggilan HTTP siap pakai.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            disabled={!outputCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Code' : 'Salin Kode')}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!outputCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors disabled:opacity-40"
            title="Download Snippet"
          >
            <Download size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Download' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      {/* Preset Curls Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <FileCode size={13} /> {language === 'en' ? 'Sample cURL:' : 'Contoh cURL:'}
        </span>
        {SAMPLE_CURLS.map(preset => (
          <button
            key={preset.name}
            onClick={() => setCurlInput(preset.curl)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-500/50 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? preset.name : preset.nameId}
          </button>
        ))}
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'input'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Raw cURL' : 'cURL Input'}
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'output'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Generated Code' : 'Kode Hasil'}
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Raw cURL input & breakdown */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'output' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-zinc-300">
              <Terminal size={14} className="text-emerald-500" />
              <span>{language === 'en' ? 'Raw cURL Command' : 'Perintah cURL Mentah'}</span>
            </div>
            <button
              onClick={() => setCurlInput('')}
              className="text-stone-400 hover:text-rose-500 transition-colors p-1"
              title="Clear input"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="relative flex-1 min-h-[300px] sm:min-h-[380px]">
            <textarea
              value={curlInput}
              onChange={e => setCurlInput(e.target.value)}
              placeholder="curl -X POST https://api.example.com -H 'Authorization: Bearer ...' -d '...'"
              className="w-full h-full p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Parsed Inspector Footer */}
          <div className="p-3 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-200 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-600 dark:text-zinc-400">
                {language === 'en' ? 'Detected Method & URL:' : 'Metode & URL Terdeteksi:'}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  parsed.method === 'POST'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : parsed.method === 'GET'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {parsed.method}
              </span>
            </div>
            <div className="font-mono text-[11px] text-stone-700 dark:text-zinc-300 truncate">
              {parsed.url || '(No URL detected)'}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-zinc-400 pt-1">
              <span>{Object.keys(parsed.headers).length} headers</span>
              <span>{parsed.data ? 'Has request body' : 'No body'}</span>
            </div>
          </div>
        </div>

        {/* Right: Output Target Language */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'input' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Target Language Buttons */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-1 overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { id: 'fetch', label: 'Fetch (JS/TS)' },
                { id: 'axios', label: 'Axios' },
                { id: 'python', label: 'Python (requests)' },
                { id: 'go', label: 'Go' },
                { id: 'php', label: 'PHP' },
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedLang === lang.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-stone-900 dark:bg-black/90 text-zinc-100 overflow-auto p-4">
            <pre className="font-mono text-xs leading-relaxed text-emerald-400 whitespace-pre">
              {outputCode}
            </pre>
          </div>

          <div className="px-4 py-2 bg-stone-50 dark:bg-zinc-800/40 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
            <span>{selectedLang.toUpperCase()} Client Snippet</span>
            <span>100% Client-Side Generator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
