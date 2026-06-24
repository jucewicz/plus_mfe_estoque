import { useCallback, useEffect, useState } from 'react';
import { Container, Typography, TextField, Stack, Alert, CircularProgress } from '@mui/material';
import { EstoqueTable } from '../components/EstoqueTable';
import { MovimentoDialog, type MovimentoTipo } from '../components/MovimentoDialog';
import { HistoricoDialog } from '../components/HistoricoDialog';
import { listarEstoque, registrarEntrada, registrarSaida, ajustarSaldo } from '../api/estoqueApi';
import type { Estoque } from '../types/estoque';

export default function EstoqueDashboardPage() {
  const [itens, setItens] = useState<Estoque[]>([]);
  const [filtroProduto, setFiltroProduto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogoMovimento, setDialogoMovimento] = useState<{ tipo: MovimentoTipo; item: Estoque } | null>(null);
  const [itemHistorico, setItemHistorico] = useState<Estoque | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    listarEstoque(filtroProduto || undefined)
      .then(setItens)
      .catch((err) => setErro((err as Error).message))
      .finally(() => setCarregando(false));
  }, [filtroProduto]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmitMovimento(quantidade: number, observacao?: string) {
    if (!dialogoMovimento) return;
    const { tipo, item } = dialogoMovimento;
    if (tipo === 'entrada') await registrarEntrada(item.roupaId, quantidade, observacao);
    if (tipo === 'saida') await registrarSaida(item.roupaId, quantidade, observacao);
    if (tipo === 'ajuste') await ajustarSaldo(item.roupaId, quantidade, observacao);
    carregar();
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Gestão de Estoque</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Filtrar por produto (produtoId)"
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          size="small"
        />
      </Stack>

      {carregando && <CircularProgress />}
      {erro && <Alert severity="error">{erro}</Alert>}
      {!carregando && !erro && itens.length === 0 && (
        <Alert severity="info">Nenhum item de estoque encontrado.</Alert>
      )}
      {!carregando && itens.length > 0 && (
        <EstoqueTable
          itens={itens}
          onEntrada={(item) => setDialogoMovimento({ tipo: 'entrada', item })}
          onSaida={(item) => setDialogoMovimento({ tipo: 'saida', item })}
          onAjuste={(item) => setDialogoMovimento({ tipo: 'ajuste', item })}
          onHistorico={setItemHistorico}
        />
      )}

      {dialogoMovimento && (
        <MovimentoDialog
          open
          tipo={dialogoMovimento.tipo}
          roupaId={dialogoMovimento.item.roupaId}
          saldoAtual={dialogoMovimento.item.saldo}
          onClose={() => setDialogoMovimento(null)}
          onSubmit={handleSubmitMovimento}
        />
      )}

      {itemHistorico && (
        <HistoricoDialog
          open
          roupaId={itemHistorico.roupaId}
          onClose={() => setItemHistorico(null)}
        />
      )}
    </Container>
  );
}
