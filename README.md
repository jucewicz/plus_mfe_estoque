# plus-mfe-estoque

Microfrontend de gestão de estoque (Grupo 16 — Stock Service) do projeto **Plus**.

## Tecnologias

React 18 + TypeScript, Vite 5, MUI, `@originjs/vite-plugin-federation`, Vitest + React Testing Library.

## Rodando isolado

```bash
npm install
echo "VITE_MS_ESTOQUE_URL=" > .env.development.local
npm run dev
```

Acesse http://localhost:4002 (requer o `plus_ms_estoque` rodando em paralelo, por padrão em `http://localhost:3000`).

> O `plus_ms_estoque` não envia headers de CORS, então em dev o `vite.config.ts` faz proxy de
> `/estoque` e `/health` para `http://localhost:3000` — por isso `VITE_MS_ESTOQUE_URL` fica vazio
> em dev (usa caminho relativo, que passa pelo proxy).

## Module Federation

Expõe `mfe_estoque/EstoqueDashboardPage` (export default) em
`http://localhost:4002/assets/remoteEntry.js`, consumido pelo Shell da turma
(fork `pucrs-sweii-2026-1-30/chave-shell-g16`) na rota `/estoque`.

## Testes

```bash
npm run test
```

> Nesta máquina (Node 26), o Vitest precisa de `NODE_OPTIONS=--no-experimental-webstorage`
> por causa de um conflito entre o `localStorage` nativo experimental do Node e o do jsdom.
> Não está nos scripts do `package.json` porque quebra no Node 20 (usado no CI). Localmente:
> `NODE_OPTIONS=--no-experimental-webstorage npm run test`.

## Build e Docker

```bash
npm run build
docker build --build-arg VITE_MS_ESTOQUE_URL=http://localhost:3002 -t plus-mfe-estoque .
docker run -p 4002:4002 plus-mfe-estoque
```

`VITE_MS_ESTOQUE_URL` precisa ser passado como `--build-arg` (não `environment:` do
container), pois variáveis `VITE_*` são embutidas no bundle em tempo de build.

## CI/CD

`.github/workflows/ci.yml`: testa e builda em todo push/PR; em push para `main`, publica
`@jucewicz/plus-mfe-estoque` no GitHub Packages.
