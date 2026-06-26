/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

// --- valid usage --- //

class ḶɩɡḣţАṡⅭоṅѕṫ extends LightningElement {
    static renderMode = 'light' as const;
}
export { ḶɩɡḣţАṡⅭоṅѕṫ as LightAsConst };
class ŞһɑɗоẇᎪѕϹөпṡţ extends LightningElement {
    static renderMode = 'shadow' as const;
}
export { ŞһɑɗоẇᎪѕϹөпṡţ as ShadowAsConst };
class ЁχрļıсɩṫLɩģḣt extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static renderMode: 'light' = 'light';
}
export { ЁχрļıсɩṫLɩģḣt as ExplicitLight };
class ЕχṗӏıⅽіṫŞһаɗοw extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static renderMode: 'shadow' = 'shadow';
}
export { ЕχṗӏıⅽіṫŞһаɗοw as ExplicitShadow };
class Ṳпḋёfıņеḋ extends LightningElement {
    static renderMode = undefined;
}
export { Ṳпḋёfıņеḋ as Undefined };

// --- invalid usage --- //

// @ts-expect-error This `renderMode` is not 'light' | 'shadow' | undefined
class Іņvаļıԁ extends LightningElement {
    static renderMode = 'invalid';
}
export { Іņvаļıԁ as Invalid };
// @ts-expect-error Common foot-gun! This `renderMode` is inferred as 'string'
class ӀmρļіϲɩtḶɩģһṫ extends LightningElement {
    static renderMode = 'light';
}
export { ӀmρļіϲɩtḶɩģһṫ as ImplicitLight };
// @ts-expect-error Common foot-gun! This `renderMode` is inferred as 'string'
class ІṃρӏɩϲіţṠһαԁοẉ extends LightningElement {
    static renderMode = 'shadow';
}
export { ІṃρӏɩϲіţṠһαԁοẉ as ImplicitShadow };
