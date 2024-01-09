import type { Module } from './connection';

export type HotModuleCallback = (mod: Module) => void;

const hotModuleCbs: Map<string, HotModuleCallback[]> = new Map();
export type HMR_Accept = (modulePath: string, cb: HotModuleCallback) => void;
export function accept(modulePath: string, cb: HotModuleCallback) {
    if (hotModuleCbs.has(modulePath)) {
        hotModuleCbs.get(modulePath)?.push(cb);
    } else {
        hotModuleCbs.set(modulePath, [cb]);
    }
}

const activeModules: Map<string, string> = new Map<string, string>();
const staleModules: Map<string, string> = new Map<string, string>();
export type HMR_Register = (modulePath: string, hash: string) => void;
export function register(modulePath: string, hash: string) {
    if (activeModules.has(modulePath)) {
        // This is a new version of an existing module
        // Potentially clean up old handlers, call dispose()
        staleModules.set(modulePath, activeModules.get(modulePath)!);
    }
    activeModules.set(modulePath, hash);
}

export type UpdateHandler = (mod: Module) => void;
export function updateHandler(modulePath: string): UpdateHandler | undefined {
    let callbacks: HotModuleCallback[] = [];
    if (activeModules.has(modulePath)) {
        callbacks = hotModuleCbs.get(modulePath)!;
        return (hotModule) => {
            callbacks.forEach((cb) => {
                cb(hotModule);
            });
            const existingCbs = hotModuleCbs.get(modulePath);
            hotModuleCbs.set(
                modulePath,
                existingCbs?.filter((cb) => !callbacks.includes(cb)) ?? []
            );
        };
    }
}

/**
 * Provide a list of all module paths that of interest to the current page.
 * This will be registered with the dev server as modules of interest.
 * @returns A list of all the paths that was used to load the current page.
 */
export function getActiveModulePaths(): string[] {
    return Array.from(activeModules.keys());
}
