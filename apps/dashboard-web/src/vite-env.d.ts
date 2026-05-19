/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_EVENTS: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
