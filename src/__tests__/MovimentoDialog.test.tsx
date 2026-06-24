import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovimentoDialog } from '../components/MovimentoDialog';

describe('MovimentoDialog', () => {
  it('chama onSubmit com a quantidade informada', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <MovimentoDialog
        open
        tipo="entrada"
        roupaId="r1"
        saldoAtual={10}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Quantidade/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(5, undefined));
  });

  it('exibe erro quando onSubmit rejeita', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Saldo insuficiente'));

    render(
      <MovimentoDialog
        open
        tipo="saida"
        roupaId="r1"
        saldoAtual={2}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Quantidade/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument());
  });
});
