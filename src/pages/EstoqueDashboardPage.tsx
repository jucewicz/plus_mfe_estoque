import { useCallback, useEffect, useState } from 'react';
import { Container, Typography, TextField, Stack, Alert, CircularProgress, Button } from '@mui/material';
import { EstoqueTable } from '../components/EstoqueTable';
import { MovimentoDialog, type MovimentoTipo } from '../components/MovimentoDialog';
import { HistoricoDialog } from '../components/HistoricoDialog';
import { ConsultarSaldoDialog } from '../components/ConsultarSaldoDialog';
import { listarEstoque, registrarEntrada, registrarSaida, ajustarSaldo } from '../api/estoqueApi';
import type { Estoque } from '../types/estoque';

export default function EstoqueDashboardPage() {
  const [itens, setItens] = useState<Estoque[]>([]);
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroTamanho, setFiltroTamanho] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogoMovimento, setDialogoMovimento] = useState<{ tipo: MovimentoTipo; item: Estoque } | null>(null);
  const [itemHistorico, setItemHistorico] = useState<Estoque | null>(null);
  const [consultaSaldoAberta, setConsultaSaldoAberta] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    listarEstoque({ produtoId: filtroProduto || undefined, tamanho: filtroTamanho || undefined })
      .then(setItens)
      .catch((err) => setErro((err as Error).message))
      .finally(() => setCarregando(false));
  }, [filtroProduto, filtroTamanho]);

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

  function handleAjustarDaConsulta(item: Estoque) {
    setConsultaSaldoAberta(false);
    setDialogoMovimento({ tipo: 'ajuste', item });
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Gestão de Estoque</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <TextField
          label="Filtrar por produto (produtoId)"
          value={filtroProduto}
          onChange={(e) => {
            setFiltroProduto(e.target.value);
            if (!e.target.value) setFiltroTamanho('');
          }}
          size="small"
        />
        <TextField
          label="Filtrar por tamanho"
          value={filtroTamanho}
          onChange={(e) => setFiltroTamanho(e.target.value)}
          size="small"
          disabled={!filtroProduto}
          helperText={!filtroProduto ? 'Informe o produto para filtrar por tamanho' : ' '}
        />
        <Button variant="outlined" onClick={() => setConsultaSaldoAberta(true)}>
          Consultar saldo
        </Button>
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
          item={itemHistorico}
          onClose={() => setItemHistorico(null)}
        />
      )}

      <ConsultarSaldoDialog
        open={consultaSaldoAberta}
        onClose={() => setConsultaSaldoAberta(false)}
        onAjustar={handleAjustarDaConsulta}
      />
    </Container>
  );
}
