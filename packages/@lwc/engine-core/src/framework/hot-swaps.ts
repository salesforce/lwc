/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isFalse, isUndefined, isNull } from '@lwc/shared';
import { VM, scheduleRehydration, forceRehydration } from './vm';
import { isComponentConstructor } from './def';
import { LightningElementConstructor } from './base-lightning-element';
import { Template } from './template';
import { markComponentAsDirty } from './component';
import { isTemplateRegistered } from './secure-template';
import { StylesheetFactory } from './stylesheet';
import { assertNotProd, flattenStylesheets } from './utils';
import { WeakMultiMap } from './weak-multimap';

const swappedTemplateMap = new WeakMap<Template, Template>();
const swappedComponentMap = new WeakMap<LightningElementConstructor, LightningElementConstructor>();
const swappedStyleMap = new WeakMap<StylesheetFactory, StylesheetFactory>();

// The important thing here is the weak values – VMs are transient (one per component instance) and should be GC'ed,
// so we don't want to create strong references to them.
// The weak keys are kind of useless, because Templates, LightningElementConstructors, and StylesheetFactories are
// never GC'ed. But maybe they will be someday, so we may as well use weak keys too.
const activeTemplates: WeakMultiMap<Template, VM> = new WeakMultiMap();
const activeComponents: WeakMultiMap<LightningElementConstructor, VM> = new WeakMultiMap();
const activeStyles: WeakMultiMap<StylesheetFactory, VM> = new WeakMultiMap();

function rehydrateHotTemplate(tpl: Template): boolean {
    const list = activeTemplates.get(tpl);
    for (const vm of list) {
        if (isFalse(vm.isDirty)) {
            // forcing the vm to rehydrate in the micro-task:
            markComponentAsDirty(vm);
            scheduleRehydration(vm);
        }
    }
    // Resetting the Set since these VMs are no longer related to this template, instead
    // they will get re-associated once these instances are rehydrated.
    activeTemplates.delete(tpl);
    return true;
}

function rehydrateHotStyle(style: StylesheetFactory): boolean {
    const list = activeStyles.get(style);
    for (const vm of list) {
        // if a style definition is swapped, we must reset
        // vm's template content in the next micro-task:
        forceRehydration(vm);
    }
    // Resetting the Set since these VMs are no longer related to this style, instead
    // they will get re-associated once these instances are rehydrated.
    activeStyles.delete(style);
    return true;
}

function rehydrateHotComponent(Ctor: LightningElementConstructor): boolean {
    const list = activeComponents.get(Ctor);
    let canRefreshAllInstances = true;
    for (const vm of list) {
        const { owner } = vm;
        if (!isNull(owner)) {
            // if a component class definition is swapped, we must reset
            // owner's template content in the next micro-task:
            forceRehydration(owner);
        } else {
            // the hot swapping for components only work for instances of components
            // created from a template, root elements can't be swapped because we
            // don't have a way to force the creation of the element with the same state
            // of the current element.
            // Instead, we can report the problem to the caller so it can take action,
            // for example: reload the entire page.
            canRefreshAllInstances = false;
        }
    }
    // resetting the Set since these VMs are no longer related to this constructor, instead
    // they will get re-associated once these instances are rehydrated.
    activeComponents.delete(Ctor);
    return canRefreshAllInstances;
}

export function getTemplateOrSwappedTemplate(tpl: Template): Template {
    assertNotProd(); // this method should never leak to prod

    const visited: Set<Template> = new Set();
    while (swappedTemplateMap.has(tpl) && !visited.has(tpl)) {
        visited.add(tpl);
        tpl = swappedTemplateMap.get(tpl)!;
    }

    return tpl;
}

export function getComponentOrSwappedComponent(
    Ctor: LightningElementConstructor
): LightningElementConstructor {
    assertNotProd(); // this method should never leak to prod

    const visited: Set<LightningElementConstructor> = new Set();
    while (swappedComponentMap.has(Ctor) && !visited.has(Ctor)) {
        visited.add(Ctor);
        Ctor = swappedComponentMap.get(Ctor)!;
    }

    return Ctor;
}

export function getStyleOrSwappedStyle(style: StylesheetFactory): StylesheetFactory {
    assertNotProd(); // this method should never leak to prod

    const visited: Set<StylesheetFactory> = new Set();
    while (swappedStyleMap.has(style) && !visited.has(style)) {
        visited.add(style);
        style = swappedStyleMap.get(style)!;
    }

    return style;
}

export function setActiveVM(vm: VM) {
    assertNotProd(); // this method should never leak to prod

    // tracking active component
    const Ctor = vm.def.ctor;
    // this will allow us to keep track of the hot components
    activeComponents.add(Ctor, vm);

    // tracking active template
    const tpl = vm.cmpTemplate;
    if (tpl) {
        // this will allow us to keep track of the templates that are
        // being used by a hot component
        activeTemplates.add(tpl, vm);

        // tracking active styles associated to template
        const stylesheets = tpl.stylesheets;
        if (!isUndefined(stylesheets)) {
            for (const stylesheet of flattenStylesheets(stylesheets)) {
                // this is necessary because we don't hold the list of styles
                // in the vm, we only hold the selected (already swapped template)
                // but the styles attached to the template might not be the actual
                // active ones, but the swapped versions of those.
                const swappedStylesheet = getStyleOrSwappedStyle(stylesheet);
                // this will allow us to keep track of the stylesheet that are
                // being used by a hot component
                activeStyles.add(swappedStylesheet, vm);
            }
        }
    }
}

export function swapTemplate(oldTpl: Template, newTpl: Template): boolean {
    if (process.env.NODE_ENV !== 'production') {
        if (isTemplateRegistered(oldTpl) && isTemplateRegistered(newTpl)) {
            swappedTemplateMap.set(oldTpl, newTpl);
            return rehydrateHotTemplate(oldTpl);
        } else {
            throw new TypeError(`Invalid Template`);
        }
    }

    return false;
}

export function swapComponent(
    oldComponent: LightningElementConstructor,
    newComponent: LightningElementConstructor
): boolean {
    if (process.env.NODE_ENV !== 'production') {
        if (isComponentConstructor(oldComponent) && isComponentConstructor(newComponent)) {
            swappedComponentMap.set(oldComponent, newComponent);
            return rehydrateHotComponent(oldComponent);
        } else {
            throw new TypeError(`Invalid Component`);
        }
    }

    return false;
}

export function swapStyle(oldStyle: StylesheetFactory, newStyle: StylesheetFactory): boolean {
    if (process.env.NODE_ENV !== 'production') {
        // TODO [#1887]: once the support for registering styles is implemented
        // we can add the validation of both styles around this block.
        swappedStyleMap.set(oldStyle, newStyle);
        return rehydrateHotStyle(oldStyle);
    }

    return false;
}
