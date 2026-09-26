const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// Turns FastAPI/pydantic validation output into { field: message } plus a summary.
function parseError(status, data) {
  const detail = data?.detail;
  if (typeof detail === 'string') return new ApiError(status, detail);
  if (Array.isArray(detail)) {
    const fieldErrors = {};
    const messages = [];
    for (const item of detail) {
      const msg = String(item.msg || '').replace(/^Value error, /, '');
      const loc = (item.loc || []).filter((p) => p !== 'body');
      if (loc.length) fieldErrors[loc.join('.')] = msg;
      messages.push(msg);
    }
    return new ApiError(status, messages[0] || 'Please check your answers.', fieldErrors);
  }
  if (status === 0) return new ApiError(0, 'We couldn’t reach the service. Check your connection and try again.');
  return new ApiError(status, 'Something went wrong on our side. Please try again.');
}

/**
 * JSON request helper. Sends cookies and the CSRF token. Never logs request or
 * response bodies, since they can contain health information.
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken();

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw parseError(0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const text = res.status === 204 ? '' : await res.text();
  let data = null;
  if (isJson && text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) throw parseError(res.status, data);
  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body) => request(path, { method: 'POST', body: body ?? {} }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  url: (path) => `${BASE_URL}${path}`,
};
