import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Chip, Stack,
} from '@mui/material';
import { listarTodosMovimentos } from '../api/estoqueApi';
import type { Movimento } from '../types/estoque';

interface HistoricoCompletoDialogProps {
  open: boolean;
  onClose: () => void;
}

const COR_TIPO: Record<Movimento['tipo'], 'success' | 'error' | 'info'> = {
  entrada: 'success',
  saida: 'error',
  ajuste: 'info',
};

const LABEL_TIPO: Record<Movimento['tipo'], string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
};

function formatarVariacao(m: Movimento): string {
  const delta = m.saldoPosterior - m.saldoAnterior;
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '0';
}

function desdeDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

export function HistoricoCompletoDialog({ open, onClose }: HistoricoCompletoDialogProps) {
  const [periodoDias, setPeriodoDias] = useState('7');
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function buscar() {
    const dias = Number(periodoDias);
    if (!Number.isFinite(dias) || dias <= 0) {
      setErro('Informe um período em dias válido.');
      return;
    }
    setCarregando(true);
    setErro(null);
    listarTodosMovimentos({ desde: desdeDias(dias) })
      .then(setMovimentos)
      .catch((err) => setErro((err as Error).message))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    if (open) buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Histórico completo de movimentações</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            label="Período (dias)"
            type="number"
            value={periodoDias}
            onChange={(e) => setPeriodoDias(e.target.value)}
            size="small"
          />
          <Button onClick={buscar} variant="contained" disabled={carregando}>
            Buscar
          </Button>
        </Stack>

        {erro && <Alert severity="error">{erro}</Alert>}
        {carregando && <CircularProgress />}
        {!carregando && !erro && movimentos.length === 0 && (
          <Alert severity="info">Nenhum movimento encontrado nesse período.</Alert>
        )}
        {!carregando && movimentos.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Roupa</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Variação</TableCell>
                <TableCell align="right">Saldo após</TableCell>
                <TableCell>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimentos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.criadoEm).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{m.produtoId}</TableCell>
                  <TableCell>{m.roupaId}</TableCell>
                  <TableCell><Chip size="small" color={COR_TIPO[m.tipo]} label={LABEL_TIPO[m.tipo]} /></TableCell>
                  <TableCell align="right">{formatarVariacao(m)}</TableCell>
                  <TableCell align="right">{m.saldoPosterior}</TableCell>
                  <TableCell>{m.observacao ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
