export type TipoMovimento = 'entrada' | 'saida' | 'ajuste';

export interface Estoque {
  roupaId: string;
  produtoId: string;
  tamanho?: string;
  cor?: string;
  saldo: number;
  atualizadoEm: string;
}

export interface Movimento {
  id: string;
  roupaId: string;
  produtoId: string;
  tipo: TipoMovimento;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  observacao?: string;
  criadoEm: string;
}
