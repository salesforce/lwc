/// <reference types="vite/client" />

// @ts-expect-error import.meta
export const files = import.meta.glob<string>('./**/actual.js', { query: '?raw', import: 'default', eager: true });
// @ts-expect-error import.meta
export const configs = import.meta.glob<object>('./**/config.json', { import: 'default', eager: true });
// @ts-expect-error import.meta
export const dirname = import.meta.dirname;