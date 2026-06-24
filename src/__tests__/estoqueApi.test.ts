import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarEstoque, registrarEntrada } from '../api/estoqueApi';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('estoqueApi', () => {
  it('lista estoque com sucesso', async () => {
    const mockData = [{ roupaId: 'r1', produtoId: 'p1', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    }));

    const result = await listarEstoque();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/estoque'), expect.anything());
  });

  it('propaga erro da API com a mensagem do backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Saldo insuficiente' }),
    }));

    await expect(registrarEntrada('r1', -5)).rejects.toThrow('Saldo insuficiente');
  });
});
