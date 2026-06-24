import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert,
  List, ListItem, ListItemText, CircularProgress,
} from '@mui/material';
import { listarEstoque } from '../api/estoqueApi';
import type { Estoque } from '../types/estoque';

interface ConsultarSaldoDialogProps {
  open: boolean;
  onClose: () => void;
  onAjustar: (item: Estoque) => void;
}

export function ConsultarSaldoDialog({ open, onClose, onAjustar }: ConsultarSaldoDialogProps) {
  const [produtoId, setProdutoId] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [resultados, setResultados] = useState<Estoque[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleBuscar() {
    if (!produtoId) {
      setErro('Informe o produto.');
      return;
    }
    setBuscando(true);
    setErro(null);
    setResultados(null);
    try {
      const itens = await listarEstoque({ produtoId, tamanho: tamanho || undefined });
      setResultados(itens);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  function handleClose() {
    setProdutoId('');
    setTamanho('');
    setResultados(null);
    setErro(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Consultar saldo</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {erro && <Alert severity="error">{erro}</Alert>}
        <TextField
          label="Produto"
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          fullWidth
          autoFocus
        />
        <TextField
          label="Tamanho (opcional)"
          value={tamanho}
          onChange={(e) => setTamanho(e.target.value)}
          fullWidth
        />
        {buscando && <CircularProgress size={24} />}
        {resultados !== null && resultados.length === 0 && (
          <Alert severity="info">Nenhum item encontrado para esse produto/tamanho.</Alert>
        )}
        {resultados !== null && resultados.length > 0 && (
          <List>
            {resultados.map((item) => (
              <ListItem
                key={item.roupaId}
                secondaryAction={
                  <Button size="small" variant="outlined" onClick={() => onAjustar(item)}>
                    Ajustar inventário
                  </Button>
                }
              >
                <ListItemText
                  primary={`${item.tamanho ?? '—'} / ${item.cor ?? '—'}`}
                  secondary={`Saldo: ${item.saldo}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleBuscar} variant="contained" disabled={buscando}>
          Buscar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
