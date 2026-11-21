import { API_URL, USE_MOCK } from '../config';
import { mock } from './mock';

let token = null;
let aoExpirar = () => {};
export const setToken = (t) => { token = t; };
/** O AuthController registra aqui o que fazer quando a sessão expira (401). */
export const setAoExpirar = (fn) => { aoExpirar = fn; };

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function servidor(method, path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(API_URL + path, {
      method, signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError((data && data.mensagem) || `Erro ${res.status}`, res.status);
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('Não foi possível conectar ao servidor. Verifique a conexão.', 0);
  } finally { clearTimeout(timer); }
}

async function request(method, path, body) {
  try {
    return USE_MOCK ? await mock(method, path, body, token) : await servidor(method, path, body);
  } catch (e) {
    const erro = e instanceof ApiError ? e : new ApiError(e.message, e.status || 0);
    // 401 numa rota que exige login = sessão expirada. Em /api/auth/* é só senha errada.
    if (erro.status === 401 && !path.startsWith('/api/auth/')) aoExpirar();
    throw erro;
  }
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
};
