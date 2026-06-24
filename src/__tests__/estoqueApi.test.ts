import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarEstoque, registrarEntrada, listarTodosMovimentos } from '../api/estoqueApi';

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

  it('consulta saldo por produto e tamanho usando a rota dedicada', async () => {
    const mockData = [{ roupaId: 'r1', produtoId: 'p1', tamanho: 'M', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await listarEstoque({ produtoId: 'p1', tamanho: 'M' });
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/estoque/produto/p1?tamanho=M'),
      expect.anything(),
    );
  });

  it('lista tudo (sem rota de produto) quando nenhum filtro de produto e informado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    await listarEstoque({ tamanho: 'M' });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/estoque'), expect.anything());
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/produto/'), expect.anything());
  });

  it('lista movimentos de todos os produtos com filtro de intervalo de data', async () => {
    const mockData = [{ id: 'm1', roupaId: 'r1', produtoId: 'p1', tipo: 'entrada', quantidade: 10, saldoAnterior: 0, saldoPosterior: 10, criadoEm: '2026-06-23T00:00:00Z' }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mockData });
    vi.stubGlobal('fetch', fetchMock);

    const result = await listarTodosMovimentos({ desde: '2026-06-01', ate: '2026-06-30' });
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/estoque/movimentos?desde=2026-06-01&ate=2026-06-30'),
      expect.anything(),
    );
  });

  it('lista movimentos de todos os produtos sem filtro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    await listarTodosMovimentos({});
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/estoque\/movimentos$/), expect.anything());
  });
});
