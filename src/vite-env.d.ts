/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add more VITE_* vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL?: string;
}
