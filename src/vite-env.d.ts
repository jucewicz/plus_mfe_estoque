/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MS_ESTOQUE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
