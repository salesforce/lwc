import type { Plugin } from 'rollup';

/**
 * Create a virtual module from memory, rather than a file path.
 * @param code The code to load
 * @param name The name of the virtual module
 * @returns Rollup plugin
 */
export default function virtual(code: string, name?: string): Plugin;
