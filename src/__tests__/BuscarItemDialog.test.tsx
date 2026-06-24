import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BuscarItemDialog } from '../components/BuscarItemDialog';
import * as estoqueApi from '../api/estoqueApi';

describe('BuscarItemDialog', () => {
  it('seleciona automaticamente quando a busca encontra exatamente um item', async () => {
    const item = { roupaId: 'r1', produtoId: 'camiseta', tamanho: 'M', cor: 'Branca', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' };
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue([item]);
    const onSelecionar = vi.fn();

    render(<BuscarItemDialog open onClose={vi.fn()} onSelecionar={onSelecionar} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'camiseta' } });
    fireEvent.change(screen.getByLabelText(/Tamanho/i), { target: { value: 'M' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(onSelecionar).toHaveBeenCalledWith(item));
  });

  it('mostra lista para escolher quando ha mais de um resultado', async () => {
    const itens = [
      { roupaId: 'r1', produtoId: 'camiseta', tamanho: 'M', cor: 'Branca', saldo: 10, atualizadoEm: '2026-06-23T00:00:00Z' },
      { roupaId: 'r2', produtoId: 'camiseta', tamanho: 'M', cor: 'Preta', saldo: 5, atualizadoEm: '2026-06-23T00:00:00Z' },
    ];
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue(itens);
    const onSelecionar = vi.fn();

    render(<BuscarItemDialog open onClose={vi.fn()} onSelecionar={onSelecionar} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'camiseta' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(screen.getByText(/Preta/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Preta/));
    expect(onSelecionar).toHaveBeenCalledWith(itens[1]);
  });

  it('mostra mensagem quando nao encontra nenhum item', async () => {
    vi.spyOn(estoqueApi, 'listarEstoque').mockResolvedValue([]);

    render(<BuscarItemDialog open onClose={vi.fn()} onSelecionar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Produto/i), { target: { value: 'inexistente' } });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    await waitFor(() => expect(screen.getByText(/Nenhum item encontrado/i)).toBeInTheDocument());
  });
});
