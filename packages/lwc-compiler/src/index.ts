import * as moduleFinder from 'root-require';

export const version = moduleFinder('package.json');
export { compile } from './compiler';
export { transform } from './transformers/transformer';
