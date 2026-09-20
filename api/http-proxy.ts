import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = performance.now();

  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    const targetMethod = String(payload.method || 'GET').toUpperCase();
    let targetUrl = payload.url as string;

    if (!targetUrl || typeof targetUrl !== 'string') {
      res.status(400).json({
        success: false,
        error: "URL target diperlukan (parameter 'url' kosong).",
      });
      return;
    }

    targetUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      res.status(400).json({
        success: false,
        error: `URL tidak valid: ${targetUrl}`,
      });
      return;
    }

    if (
      parsedUrl.hostname === '169.254.169.254' ||
      parsedUrl.hostname === 'metadata.google.internal' ||
      parsedUrl.hostname === 'metadata'
    ) {
      res.status(403).json({
        success: false,
        error: 'Akses ke metadata cloud internal diblokir demi keamanan.',
      });
      return;
    }

    if (payload.params && typeof payload.params === 'object') {
      for (const [key, value] of Object.entries(payload.params)) {
        if (key && value !== undefined && value !== null) {
          parsedUrl.searchParams.append(key, String(value));
        }
      }
    }

    const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || 30000, 1000), 60000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const requestHeaders: Record<string, string> = {};
    if (payload.headers && typeof payload.headers === 'object') {
      for (const [k, v] of Object.entries(payload.headers)) {
        if (k && v !== undefined && v !== null && String(v).trim() !== '') {
          const lowerK = k.toLowerCase();
          if (lowerK !== 'host' && lowerK !== 'content-length') {
            requestHeaders[k] = String(v);
          }
        }
      }
    }

    if (!requestHeaders['user-agent'] && !requestHeaders['User-Agent']) {
      requestHeaders['User-Agent'] = 'VanPostman-ApiTester/1.0 (Mozilla/5.0; Vercel Node.js Proxy)';
    }

    let bodyData: any = undefined;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(targetMethod)) {
      if (typeof payload.body === 'string') {
        bodyData = payload.body;
      } else if (payload.body !== undefined && payload.body !== null) {
        bodyData = typeof payload.body === 'object' ? JSON.stringify(payload.body) : String(payload.body);
        if (!requestHeaders['content-type'] && !requestHeaders['Content-Type']) {
          requestHeaders['Content-Type'] = 'application/json';
        }
      }
    }

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        method: targetMethod,
        headers: requestHeaders,
        body: bodyData,
        signal: controller.signal,
        redirect: payload.followRedirects === false ? 'manual' : 'follow',
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const durationMs = Math.round(performance.now() - startTime);

    const resHeaders: Record<string, string> = {};
    const resHeadersList: { key: string; value: string }[] = [];
    response.headers.forEach((val, key) => {
      resHeaders[key] = val;
      resHeadersList.push({ key, value: val });
    });

    const contentType = response.headers.get('content-type') || '';
    const isBinary =
      contentType.includes('image/') ||
      contentType.includes('audio/') ||
      contentType.includes('video/') ||
      contentType.includes('application/pdf') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/zip');

    let rawText = '';
    let responseData: any = null;
    let isJson = false;
    let sizeBytes = 0;

    if (isBinary) {
      const arrayBuf = await response.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      sizeBytes = buf.length;
      responseData = buf.toString('base64');
    } else {
      rawText = await response.text();
      sizeBytes = Buffer.byteLength(rawText, 'utf-8');
      const trimmed = rawText.trim();
      if (
        contentType.includes('json') ||
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          responseData = JSON.parse(rawText);
          isJson = true;
        } catch {
          responseData = rawText;
        }
      } else {
        responseData = rawText;
      }
    }

    res.status(200).json({
      success: true,
      status: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
      timeMs: durationMs,
      sizeBytes,
      headers: resHeaders,
      headersList: resHeadersList,
      contentType,
      isJson,
      isBinary,
      data: responseData,
      rawText: isBinary ? undefined : rawText,
      url: response.url || parsedUrl.toString(),
      corsMode: 'proxy',
    });
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');

    res.status(200).json({
      success: false,
      status: 0,
      statusText: isAbort ? 'Request Timeout' : 'Network Error',
      timeMs: durationMs,
      sizeBytes: 0,
      headers: {},
      headersList: [],
      error: isAbort
        ? `Permintaan melebihi batas waktu (Timeout setelah ${Math.round(durationMs)} ms).`
        : (err.message || 'Gagal menghubungi server target.'),
      code: err.code || (isAbort ? 'TIMEOUT' : 'FETCH_ERROR'),
      corsMode: 'proxy',
    });
  }
}
