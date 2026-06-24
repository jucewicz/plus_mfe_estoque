import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistoricoCompletoDialog } from '../components/HistoricoCompletoDialog';
import * as estoqueApi from '../api/estoqueApi';

describe('HistoricoCompletoDialog', () => {
  it('busca automaticamente ao abrir, com o periodo padrao em dias', async () => {
    const spy = vi.spyOn(estoqueApi, 'listarTodosMovimentos').mockResolvedValue([
      {
        id: 'm1', roupaId: 'r1', produtoId: 'camiseta', tipo: 'entrada', quantidade: 10,
        saldoAnterior: 0, saldoPosterior: 10, criadoEm: '2026-06-23T09:00:00.000Z',
      },
      {
        id: 'm2', roupaId: 'r2', produtoId: 'calca', tipo: 'saida', quantidade: 3,
        saldoAnterior: 10, saldoPosterior: 7, criadoEm: '2026-06-23T10:00:00.000Z',
      },
    ]);

    render(<HistoricoCompletoDialog open onClose={vi.fn()} />);

    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(screen.getByText('camiseta')).toBeInTheDocument();
    expect(screen.getByText('calca')).toBeInTheDocument();
    expect(screen.getByText('Entrada')).toBeInTheDocument();
    expect(screen.getByText('Saída')).toBeInTheDocument();
  });

  it('refaz a busca com o novo intervalo de dias informado', async () => {
    const spy = vi.spyOn(estoqueApi, 'listarTodosMovimentos').mockResolvedValue([]);

    render(<HistoricoCompletoDialog open onClose={vi.fn()} />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText(/Per[íi]odo \(dias\)/i), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    const ultimaChamada = spy.mock.calls[1]?.[0];
    expect(ultimaChamada?.desde).toBeDefined();
  });

  it('mostra mensagem quando nao ha movimentos no periodo', async () => {
    vi.spyOn(estoqueApi, 'listarTodosMovimentos').mockResolvedValue([]);

    render(<HistoricoCompletoDialog open onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Nenhum movimento encontrado/i)).toBeInTheDocument());
  });
});
