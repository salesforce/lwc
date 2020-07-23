/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isNull } from '@lwc/shared';

import { Renderer } from './renderer';
import { ComponentInterface } from './component';
import { VM, runWithBoundaryProtection } from './vm';
import { startMeasure, endMeasure } from './performance-timing';

export interface Template {
    create(): void;
    insert(target: Node, anchor?: Node): void;
    update(): void;
    detach(): void;
}

export interface TemplateFactory {
    (context: ComponentInterface, renderer: Renderer): Template;
}

export const defaultTemplateFactory: TemplateFactory = () => ({
    create() {},
    insert() {},
    update() {},
    detach() {},
});

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}

export function evaluateTemplate(vm: VM, factory?: TemplateFactory): void {
    const { component, tro, renderer, cmpRoot } = vm;

    // The returned template from by the component during this render cycle is different than the
    // previous rendering cycle. In this case the existing template need to be unmounted.
    if (vm.cmpTemplateFactory !== null && vm.cmpTemplateFactory !== factory) {
        // eslint-disable-next-line
        console.warn('TODO: template swap');
    }

    // If the new factory is null, we can just exit at this point.
    if (isUndefined(factory)) {
        return;
    }

    runWithBoundaryProtection(
        vm,
        vm.owner,
        () => {
            // pre
            vmBeingRendered = vm;
            if (process.env.NODE_ENV !== 'production') {
                startMeasure('render', vm);
            }
        },
        () => {
            if (isNull(vm.cmpTemplate)) {
                tro.observe(() => {
                    const template = factory(component, renderer);
                    vm.cmpTemplate = template;

                    template.create();
                    template.insert(cmpRoot);
                });
            } else {
                const template = vm.cmpTemplate;

                tro.observe(() => {
                    template.update(cmpRoot);
                });
            }
        },
        () => {
            if (process.env.NODE_ENV !== 'production') {
                endMeasure('render', vm);
            }
        }
    );
}

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker
 * Service and other similar libraries to sanitize vulnerable attributes.
 * This API is subject to change or being removed.
 */
export function sanitizeAttribute(
    tagName: string,
    namespaceUri: string,
    attrName: string,
    attrValue: any
) {
    // locker-service patches this function during runtime to sanitize vulnerable attributes.
    // when ran off-core this function becomes a noop and returns the user authored value.
    return attrValue;
}
