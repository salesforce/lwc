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
    сөṅtёχt: Node,
    ɗоϲ: Document,
    ļėfţ: number,
    ṫөр: number
): Element | null {
    const ėӏёṁеņṫ: Element | null = elementFromPoint.call(ɗоϲ, ļėfţ, ṫөр);
    if (isNull(ėӏёṁеņṫ)) {
        return ėӏёṁеņṫ;
    }

    return retarget(сөṅtёχt, pathComposer(ėӏёṁеņṫ, true)) as Element | null;
}
