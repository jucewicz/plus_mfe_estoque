import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';

export type MovimentoTipo = 'entrada' | 'saida' | 'ajuste';

interface MovimentoDialogProps {
  open: boolean;
  tipo: MovimentoTipo;
  roupaId: string;
  saldoAtual: number;
  onClose: () => void;
  onSubmit: (quantidade: number, observacao?: string) => Promise<void>;
}

const TITULOS: Record<MovimentoTipo, string> = {
  entrada: 'Registrar entrada',
  saida: 'Registrar saída',
  ajuste: 'Ajustar saldo (inventário)',
};

const LABEL_QUANTIDADE: Record<MovimentoTipo, string> = {
  entrada: 'Quantidade',
  saida: 'Quantidade',
  ajuste: 'Novo saldo',
};

export function MovimentoDialog({ open, tipo, roupaId, saldoAtual, onClose, onSubmit }: MovimentoDialogProps) {
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit() {
    const valor = Number(quantidade);
    const invalido = !Number.isFinite(valor) || (tipo !== 'ajuste' && valor <= 0) || (tipo === 'ajuste' && valor < 0);
    if (invalido) {
      setErro('Informe uma quantidade válida.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await onSubmit(valor, observacao || undefined);
      setQuantidade('');
      setObservacao('');
      onClose();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{TITULOS[tipo]}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {erro && <Alert severity="error">{erro}</Alert>}
        <TextField label="Roupa" value={roupaId} disabled fullWidth />
        <TextField label="Saldo atual" value={saldoAtual} disabled fullWidth />
        <TextField
          label={LABEL_QUANTIDADE[tipo]}
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          fullWidth
          autoFocus
        />
        <TextField
          label="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={enviando}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
