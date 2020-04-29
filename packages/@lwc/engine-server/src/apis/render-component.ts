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
    LightningElement,
} from '@lwc/engine-core';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';

// TODO [#0]: How to pass options to the renderer: turn on/off synthetic shadow
// TODO [#0]: How to serialize styles in synthetic shadow
// TODO [#0]: How do we avoid reactivity and wire service ?
export function renderComponent(
    name: string,
    Ctor: typeof LightningElement,
    props: Record<string, any>
): string {
    const elm = renderer.createElement(name);

    const def = getComponentInternalDef(Ctor);
    createVM(elm, def, {
        mode: 'open',
        isRoot: true,
        owner: null,
        renderer,
    });

    for (const [key, value] of Object.entries(props)) {
        (elm as any)[key] = value;
    }

    connectRootElement(elm);

    return serializeElement(elm);
}
