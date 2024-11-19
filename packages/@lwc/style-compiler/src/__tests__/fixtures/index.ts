/// <reference types="vite/client" />
import type { Config } from '../../';
// @ts-expect-error import.meta
export const files = import.meta.glob<string>('./**/actual.css', { query: '?raw', import: 'default', eager: true });
// @ts-expect-error import.meta
export const configs = import.meta.glob<Config>('./**/config.json', { import: 'default', eager: true });