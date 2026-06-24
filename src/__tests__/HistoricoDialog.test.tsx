import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistoricoDialog } from '../components/HistoricoDialog';
import * as estoqueApi from '../api/estoqueApi';

const item = {
  roupaId: 'r1',
  produtoId: 'camiseta',
  tamanho: 'M',
  cor: 'Branca',
  saldo: 15,
  atualizadoEm: '2026-06-23T00:00:00Z',
};

describe('HistoricoDialog', () => {
  it('mostra saldo atual, tipos legiveis e variacao com sinal', async () => {
    vi.spyOn(estoqueApi, 'listarMovimentos').mockResolvedValue([
      {
        id: 'm2', roupaId: 'r1', produtoId: 'camiseta', tipo: 'saida', quantidade: 5,
        saldoAnterior: 20, saldoPosterior: 15, criadoEm: '2026-06-23T10:00:00Z',
      },
      {
        id: 'm1', roupaId: 'r1', produtoId: 'camiseta', tipo: 'entrada', quantidade: 20,
        saldoAnterior: 0, saldoPosterior: 20, criadoEm: '2026-06-23T09:00:00Z',
      },
    ]);

    render(<HistoricoDialog open item={item} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Entrada')).toBeInTheDocument());
    expect(screen.getByText('Saída')).toBeInTheDocument();
    expect(screen.getByText('+20')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText(/Saldo atual:\s*15/i)).toBeInTheDocument();
  });
});
