import { Table, TableHead, TableRow, TableCell, TableBody, Button, Stack, Chip } from '@mui/material';
import type { Estoque } from '../types/estoque';

interface EstoqueTableProps {
  itens: Estoque[];
  onEntrada: (item: Estoque) => void;
  onSaida: (item: Estoque) => void;
  onHistorico: (item: Estoque) => void;
}

export function EstoqueTable({ itens, onEntrada, onSaida, onHistorico }: EstoqueTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Produto</TableCell>
          <TableCell>Tamanho</TableCell>
          <TableCell>Cor</TableCell>
          <TableCell align="right">Saldo</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {itens.map((item) => (
          <TableRow key={item.roupaId}>
            <TableCell>{item.produtoId}</TableCell>
            <TableCell>{item.tamanho ?? '—'}</TableCell>
            <TableCell>{item.cor ?? '—'}</TableCell>
            <TableCell align="right">
              <Chip
                label={item.saldo}
                color={item.saldo === 0 ? 'error' : item.saldo < 5 ? 'warning' : 'success'}
              />
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => onEntrada(item)}>Entrada</Button>
                <Button size="small" onClick={() => onSaida(item)}>Saída</Button>
                <Button size="small" onClick={() => onHistorico(item)}>Histórico</Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
