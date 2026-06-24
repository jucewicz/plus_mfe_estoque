import type { Estoque, Movimento } from '../types/estoque';

const BASE_URL = import.meta.env.VITE_MS_ESTOQUE_URL ?? 'http://localhost:3002';

// O mfe_auth grava o JWT em localStorage("token"); o MS Estoque ainda não valida esse
// header, mas o deliverable do T2 exige essa integração, então já enviamos desde agora.
function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface FiltroEstoque {
  produtoId?: string;
  tamanho?: string;
  cor?: string;
}

// Sem produtoId, lista tudo (GET /estoque). Com produtoId, usa a rota dedicada que
// suporta filtrar por tamanho/cor dentro daquele produto (GET /estoque/produto/:produtoId).
export function listarEstoque(filtro?: FiltroEstoque): Promise<Estoque[]> {
  const { produtoId, tamanho, cor } = filtro ?? {};
  if (!produtoId) {
    return request<Estoque[]>('/estoque');
  }
  const params = new URLSearchParams();
  if (tamanho) params.set('tamanho', tamanho);
  if (cor) params.set('cor', cor);
  const qs = params.toString();
  return request<Estoque[]>(`/estoque/produto/${encodeURIComponent(produtoId)}${qs ? `?${qs}` : ''}`);
}

export function buscarEstoque(roupaId: string): Promise<Estoque> {
  return request<Estoque>(`/estoque/${roupaId}`);
}

export function registrarEntrada(roupaId: string, quantidade: number, observacao?: string): Promise<Movimento> {
  return request<Movimento>('/estoque/entrada', {
    method: 'POST',
    body: JSON.stringify({ roupaId, quantidade, observacao }),
  });
}

export function registrarSaida(roupaId: string, quantidade: number, observacao?: string): Promise<Movimento> {
  return request<Movimento>('/estoque/saida', {
    method: 'POST',
    body: JSON.stringify({ roupaId, quantidade, observacao }),
  });
}

export function ajustarSaldo(roupaId: string, quantidade: number, observacao?: string): Promise<Movimento> {
  return request<Movimento>(`/estoque/${roupaId}/ajuste`, {
    method: 'PATCH',
    body: JSON.stringify({ quantidade, observacao }),
  });
}

export function listarMovimentos(roupaId: string): Promise<Movimento[]> {
  return request<Movimento[]>(`/estoque/${roupaId}/movimentos`);
}
