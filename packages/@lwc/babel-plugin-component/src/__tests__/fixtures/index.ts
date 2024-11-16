/// <reference types="vite/client" />
export const files = import.meta.glob<string>('./**/actual.js', { query: '?raw', import: 'default', eager: true });
export const configs = import.meta.glob<object>('./**/config.json', { import: 'default', eager: true });
export const dirname = import.meta.dirname;