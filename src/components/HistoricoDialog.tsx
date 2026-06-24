import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Chip, Typography,
} from '@mui/material';
import { listarMovimentos } from '../api/estoqueApi';
import type { Estoque, Movimento } from '../types/estoque';

interface HistoricoDialogProps {
  open: boolean;
  item: Estoque;
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

export function HistoricoDialog({ open, item, onClose }: HistoricoDialogProps) {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCarregando(true);
    setErro(null);
    listarMovimentos(item.roupaId)
      .then(setMovimentos)
      .catch((err) => setErro((err as Error).message))
      .finally(() => setCarregando(false));
  }, [open, item.roupaId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Histórico — {item.produtoId} ({item.tamanho ?? '—'} / {item.cor ?? '—'})
        <Typography variant="body2" color="text.secondary">
          Saldo atual: {item.saldo}
        </Typography>
      </DialogTitle>
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
                <TableCell align="right">Variação</TableCell>
                <TableCell align="right">Saldo anterior</TableCell>
                <TableCell align="right">Saldo após</TableCell>
                <TableCell>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimentos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.criadoEm).toLocaleString('pt-BR')}</TableCell>
                  <TableCell><Chip size="small" color={COR_TIPO[m.tipo]} label={LABEL_TIPO[m.tipo]} /></TableCell>
                  <TableCell align="right">{formatarVariacao(m)}</TableCell>
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
