/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { flattenStylesheets } from '@lwc/shared';
import { scheduleRehydration, forceRehydration } from './vm';
import { isComponentConstructor } from './def';
import { markComponentAsDirty } from './component';
import { isTemplateRegistered } from './secure-template';
import { unrenderStylesheet } from './stylesheet';
import { assertNotProd } from './utils';
import { WeakMultiMap } from './weak-multimap';
import type { Template } from './template';
import type { LightningElementConstructor } from './base-lightning-element';
import type { VM } from './vm';
import type { Stylesheet, Stylesheets } from '@lwc/shared';

let swappedTemplateMap: WeakMap<Template, Template> = /*@__PURE__@*/ new WeakMap();
let swappedComponentMap: WeakMap<LightningElementConstructor, LightningElementConstructor> =
    /*@__PURE__@*/ new WeakMap();
let swappedStyleMap: WeakMap<Stylesheet, Stylesheet> = /*@__PURE__@*/ new WeakMap();

// The important thing here is the weak values – VMs are transient (one per component instance) and should be GC'ed,
// so we don't want to create strong references to them.
// The weak keys are kind of useless, because Templates, LightningElementConstructors, and Stylesheets are
// never GC'ed. But maybe they will be someday, so we may as well use weak keys too.
// The "pure" annotations are so that Rollup knows for sure it can remove these from prod mode
let activeTemplates: WeakMultiMap<Template, VM> = /*@__PURE__@*/ new WeakMultiMap();
let activeComponents: WeakMultiMap<LightningElementConstructor, VM> =
    /*@__PURE__@*/ new WeakMultiMap();
let activeStyles: WeakMultiMap<Stylesheet, VM> = /*@__PURE__@*/ new WeakMultiMap();

// Only used in LWC's integration tests
if (process.env.NODE_ENV === 'test-lwc-integration') {
    // Used to reset the global state between test runs
    (window as any).__lwcResetHotSwaps = () => {
        swappedTemplateMap = new WeakMap();
        swappedComponentMap = new WeakMap();
        swappedStyleMap = new WeakMap();
        activeTemplates = new WeakMultiMap();
        activeComponents = new WeakMultiMap();
        activeStyles = new WeakMultiMap();
    };
}

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

function rehydrateHotStyle(style: Stylesheet): boolean {
    const activeVMs = activeStyles.get(style);
    if (!activeVMs.size) {
        return true;
    }
    unrenderStylesheet(style);
    for (const vm of activeVMs) {
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

    // TODO [#4154]: shows stale content when swapping content back and forth multiple times
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

    // TODO [#4154]: shows stale content when swapping content back and forth multiple times
    const visited: Set<LightningElementConstructor> = new Set();
    while (swappedComponentMap.has(Ctor) && !visited.has(Ctor)) {
        visited.add(Ctor);
        Ctor = swappedComponentMap.get(Ctor)!;
    }

    return Ctor;
}

export function getStyleOrSwappedStyle(style: Stylesheet): Stylesheet {
    assertNotProd(); // this method should never leak to prod

    // TODO [#4154]: shows stale content when swapping content back and forth multiple times
    const visited: Set<Stylesheet> = new Set();
    while (swappedStyleMap.has(style) && !visited.has(style)) {
        visited.add(style);
        style = swappedStyleMap.get(style)!;
    }

    return style;
}

function addActiveStylesheets(stylesheets: Stylesheets | undefined | null, vm: VM) {
    if (isUndefined(stylesheets) || isNull(stylesheets)) {
        // Ignore non-existent stylesheets
        return;
    }
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

export function setActiveVM(vm: VM) {
    assertNotProd(); // this method should never leak to prod

    // tracking active component
    const Ctor = vm.def.ctor;
    // this will allow us to keep track of the hot components
    activeComponents.add(Ctor, vm);

    // tracking active template
    const template = vm.cmpTemplate;
    if (!isNull(template)) {
        // this will allow us to keep track of the templates that are
        // being used by a hot component
        activeTemplates.add(template, vm);

        // Tracking active styles from the template or the VM. `template.stylesheets` are implicitly associated
        // (e.g. `foo.css` associated with `foo.html`), whereas `vm.stylesheets` are from `static stylesheets`.
        addActiveStylesheets(template.stylesheets, vm);
        addActiveStylesheets(vm.stylesheets, vm);
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
        const isOldCtorAComponent = isComponentConstructor(oldComponent);
        const isNewCtorAComponent = isComponentConstructor(newComponent);
        if (isOldCtorAComponent && isNewCtorAComponent) {
            swappedComponentMap.set(oldComponent, newComponent);
            return rehydrateHotComponent(oldComponent);
        } else if (isOldCtorAComponent === false && isNewCtorAComponent === true) {
            throw new TypeError(
                `Invalid Component: Attempting to swap a non-component with a component`
            );
        } else if (isOldCtorAComponent === true && isNewCtorAComponent === false) {
            throw new TypeError(
                `Invalid Component: Attempting to swap a component with a non-component`
            );
        } else {
            // The dev-server relies on the presence of registerComponent() as a way to determine a
            // component module. However, the compiler cannot definitively add registerComponent()
            // transformation only to a component constructor. Hence the dev-server may attempt to
            // hot swap javascript modules that look like a component and should not cause the app
            // to fail. To allow that, this api ignores such hot swap attempts.
            return false;
        }
    }
    return false;
}

export function swapStyle(oldStyle: Stylesheet, newStyle: Stylesheet): boolean {
    if (process.env.NODE_ENV !== 'production') {
        // TODO [#1887]: once the support for registering styles is implemented
        // we can add the validation of both styles around this block.
        swappedStyleMap.set(oldStyle, newStyle);
        return rehydrateHotStyle(oldStyle);
    }

    return false;
}
