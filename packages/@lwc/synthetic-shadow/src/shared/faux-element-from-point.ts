/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull } from '@lwc/shared';
import { elementFromPoint } from '../env/document';
import { retarget } from '../3rdparty/polymer/retarget';
import { pathComposer } from '../3rdparty/polymer/path-composer';

export function fauxElementFromPoint(
    context: Node,
    doc: Document,
    left: number,
    top: number
): Element | null {
    const element: Element | null = elementFromPoint.call(doc, left, top);
    if (isNull(element)) {
        return element;
    }

    return retarget(context, pathComposer(element, true)) as Element | null;
}
