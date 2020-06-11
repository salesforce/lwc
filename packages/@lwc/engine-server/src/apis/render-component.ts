/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    createVM,
    connectRootElement,
    getComponentInternalDef,
    setElementProto,
    LightningElement,
} from '@lwc/engine-core';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';

export function renderComponent(
    tagName: string,
    Ctor: typeof LightningElement,
    props: { [name: string]: any }
): string {
    const element = renderer.createElement(tagName);

    const def = getComponentInternalDef(Ctor);
    setElementProto(element, def);

    createVM(element, def, {
        mode: 'open',
        owner: null,
        renderer,
        tagName,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    connectRootElement(element);

    return serializeElement(element);
}
