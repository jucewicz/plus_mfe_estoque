import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConsultarSaldoDialog } from '../components/ConsultarSaldoDialog';
import * as estoqueApi from '../api/estoqueApi';

describe('ConsultarSaldoDialog', () => {
  it('lista o resultado com um botao de Ajustar inventário, mesmo com um so item', async () => {
    const item = { roupaId: 'r1', produtoId: 'camiseta', tamanho: 'M', cor: 'Branca', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' };
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue([item]);
    const onAjustar = vi.fn();

    render(<ConsultarSaldoDialog open onClose={vi.fn()} onAjustar={onAjustar} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'camiseta' } });
    fireEvent.change(screen.getByLabelText(/Tamanho/i), { target: { value: 'M' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(screen.getByText('Saldo: 10')).toBeInTheDocument());
    expect(onAjustar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Ajustar inventário/i }));
    expect(onAjustar).toHaveBeenCalledWith(item);
  });

  it('lista varios resultados, cada um com seu proprio botao de ajustar', async () => {
    const itens = [
      { roupaId: 'r1', produtoId: 'camiseta', tamanho: 'M', cor: 'Branca', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' },
      { roupaId: 'r2', produtoId: 'camiseta', tamanho: 'M', cor: 'Preta', saldo: 5, atualizadoEm: '2026-06-23T00:00:00Z' },
    ];
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue(itens);
    const onAjustar = vi.fn();

    render(<ConsultarSaldoDialog open onClose={vi.fn()} onAjustar={onAjustar} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'camiseta' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(screen.getAllByRole('button', { name: /Ajustar inventário/i })).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button', { name: /Ajustar inventário/i })[1]);
    expect(onAjustar).toHaveBeenCalledWith(itens[1]);
  });

  it('mostra mensagem quando nao encontra nenhum item', async () => {
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue([]);

    render(<ConsultarSaldoDialog open onClose={vi.fn()} onAjustar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'inexistente' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(screen.getByText(/Nenhum item encontrado/i)).toBeInTheDocument());
  });

  it('limpa busca e resultados ao selecionar um item para ajustar (nao reaparece desatualizado ao reabrir)', async () => {
    const item = { roupaId: 'r1', produtoId: 'camiseta', tamanho: 'M', cor: 'Branca', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' };
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue([item]);
    const onAjustar = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(<ConsultarSaldoDialog open onClose={onClose} onAjustar={onAjustar} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'camiseta' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    await waitFor(() => expect(screen.getByText('Saldo: 10')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Ajustar inventário/i }));
    expect(onAjustar).toHaveBeenCalledWith(item);

    // o componente fica montado (pai so alterna a prop `open`), simula fechar e reabrir
    rerender(<ConsultarSaldoDialog open={false} onClose={onClose} onAjustar={onAjustar} />);
    rerender(<ConsultarSaldoDialog open onClose={onClose} onAjustar={onAjustar} />);

    expect(screen.getByLabelText(/Produto/i)).toHaveValue('');
    expect(screen.queryByText('Saldo: 10')).not.toBeInTheDocument();
  });
});
