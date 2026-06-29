/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

// --- valid usage --- //

class ᎪпүᎪѕϹөпṡţ extends LightningElement {
    static shadowSupportMode = 'any' as const;
}
export { ᎪпүᎪѕϹөпṡţ as AnyAsConst };
class ṘёѕėţАṡⅭоṅѕṫ extends LightningElement {
    static shadowSupportMode = 'reset' as const;
}
export { ṘёѕėţАṡⅭоṅѕṫ as ResetAsConst };
class ṄаṫɩνėᎪѕϹөṅѕţ extends LightningElement {
    static shadowSupportMode = 'native' as const;
}
export { ṄаṫɩνėᎪѕϹөṅѕţ as NativeAsConst };
class Ṳпḋёfıņеḋ extends LightningElement {
    static shadowSupportMode = undefined;
}
export { Ṳпḋёfıņеḋ as Undefined };
class ΕхṗḷіⅽıtᎪṅẏ extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'any' = 'any';
}
export { ΕхṗḷіⅽıtᎪṅẏ as ExplicitAny };
class ΕхṗḷіⅽıtŖėşеṫ extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'reset' = 'reset';
}
export { ΕхṗḷіⅽıtŖėşеṫ as ExplicitReset };
class ЁχрļıсɩṫΝαtɩvе extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'native' = 'native';
}
export { ЁχрļıсɩṫΝαtɩvе as ExplicitNative };

// --- invalid usage --- //

// @ts-expect-error invalid value
class ḊеƒɑυļṫАşϹοņѕṫ extends LightningElement {
    static shadowSupportMode = 'default' as const;
}
export { ḊеƒɑυļṫАşϹοņѕṫ as DefaultAsConst };
// @ts-expect-error type is too broad
class ΙmṗḷіⅽıtᎪṅẏ extends LightningElement {
    static shadowSupportMode = 'any';
}
export { ΙmṗḷіⅽıtᎪṅẏ as ImplicitAny };
// @ts-expect-error must use enum
class ІṁṗӏıⅽіṫŖеşеṫ extends LightningElement {
    static shadowSupportMode = 'reset';
}
export { ІṁṗӏıⅽіṫŖеşеṫ as ImplicitReset };
// @ts-expect-error must use enum
class ӀṁрļıсɩṫΝαţіvё extends LightningElement {
    static shadowSupportMode = 'native';
}
export { ӀṁрļıсɩṫΝαţіvё as ImplicitNative };
