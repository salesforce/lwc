/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { swapTemplate, events, ComponentMetadata } from '@lwc/engine-core';
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

type Template = ComponentMetadata['metadata']['tmpl'];
const activeTemplates = new Map<string, Template>();
// const staleModules = new Map<string, string>();
export type HMR_Register = (modulePath: string, hash: string) => void;

events.addEventListener('component_registered', (e: CustomEventInit<ComponentMetadata>) => {
    if (!e.detail) throw new Error('Invalid event');
    const tmpl = e.detail.metadata.tmpl;
    if (!tmpl.hmr) return;
    activeTemplates.set(tmpl.hmr.path, tmpl);
    const { path } = tmpl.hmr;
    accept(path, (newModule) => {
        const tmpl = activeTemplates.get(path);
        if (!tmpl) return;
        if (newModule.hmr?.hash === tmpl.hmr?.hash) return;

        swapTemplate(tmpl, newModule);
        activeTemplates.set(path, newModule);
    });
});

export type UpdateHandler = (mod: Module) => void;
export function updateHandler(modulePath: string): UpdateHandler | undefined {
    let callbacks: HotModuleCallback[] = [];
    if (activeTemplates.has(modulePath)) {
        // Create a copy of the callbacks to retain the current list in a closure for when the hot
        // module is available. Otherwise, the incoming hot module's callback will also be invoked
        // and removed. Thus future updates won't have a callback to process.
        callbacks = [...hotModuleCbs.get(modulePath)!];
        return (hotModule) => {
            callbacks.forEach((cb) => {
                cb(hotModule);
            });
        };
    }
}

/**
 * Provide a list of all module paths that of interest to the current page.
 * This will be registered with the dev server as modules of interest.
 * @returns A list of all the paths that was used to load the current page.
 */
export function getActiveModulePaths(): string[] {
    return Array.from(activeTemplates.keys());
}
