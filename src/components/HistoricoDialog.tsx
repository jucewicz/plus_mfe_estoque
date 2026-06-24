import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Chip,
} from '@mui/material';
import { listarMovimentos } from '../api/estoqueApi';
import type { Movimento } from '../types/estoque';

interface HistoricoDialogProps {
  open: boolean;
  roupaId: string;
  onClose: () => void;
}

const COR_TIPO: Record<Movimento['tipo'], 'success' | 'error' | 'info'> = {
  entrada: 'success',
  saida: 'error',
  ajuste: 'info',
};

export function HistoricoDialog({ open, roupaId, onClose }: HistoricoDialogProps) {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCarregando(true);
    setErro(null);
    listarMovimentos(roupaId)
      .then(setMovimentos)
      .catch((err) => setErro((err as Error).message))
      .finally(() => setCarregando(false));
  }, [open, roupaId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Histórico de movimentos — {roupaId}</DialogTitle>
      <DialogContent>
        {carregando && <CircularProgress />}
        {erro && <Alert severity="error">{erro}</Alert>}
        {!carregando && !erro && movimentos.length === 0 && (
          <Alert severity="info">Nenhum movimento encontrado.</Alert>
        )}
        {!carregando && movimentos.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Saldo anterior</TableCell>
                <TableCell align="right">Saldo posterior</TableCell>
                <TableCell>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimentos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.criadoEm).toLocaleString('pt-BR')}</TableCell>
                  <TableCell><Chip size="small" color={COR_TIPO[m.tipo]} label={m.tipo} /></TableCell>
                  <TableCell align="right">{m.quantidade}</TableCell>
                  <TableCell align="right">{m.saldoAnterior}</TableCell>
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
