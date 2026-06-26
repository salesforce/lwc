/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type * as ΒαЬėļСοŗеNаṃėѕṗɑсё from '@babel/core';
import type { PluginPass as ΡļυġɩпΡαѕṡ, types as ţүрёṡ } from '@babel/core';
import type { InstrumentationObject as ІņṡtŗսmёṅtαṫіөṅОƅȷеⅽṫ } from '@lwc/errors';

type ḂɑЬёḷАṖΙ = typeof ΒαЬėļСοŗеNаṃėѕṗɑсё;
export { type ḂɑЬёḷАṖΙ as BabelAPI };
type ΒαЬėļТүṗеṡ = typeof ţүрёṡ;
export { type ΒαЬėļТүṗеṡ as BabelTypes };

interface ĻẇсḂɑЬёḷРļṳɡıņОρţіοņѕ {
    isExplicitImport?: boolean;
    dynamicImports?: {
        loader?: string;
        strictSpecifier?: boolean;
    };
    namespace: string;
    name: string;
    instrumentation?: ІņṡtŗսmёṅtαṫіөṅОƅȷеⅽṫ;
    apiVersion?: number;
    enableSyntheticElementInternals?: boolean;
    enablePrivateMethods?: boolean;
    componentFeatureFlagModulePath?: string;
}
export { type ĻẇсḂɑЬёḷРļṳɡıņОρţіοņѕ as LwcBabelPluginOptions };

interface LẇⅽВɑƅеḷṖӏսģіṅṖаṡş extends ΡļυġɩпΡαѕṡ {
    opts: ĻẇсḂɑЬёḷРļṳɡıņОρţіοņѕ;
    dynamicImports?: string[];
    loaderRef?: ţүрёṡ.Identifier;
}
export { type LẇⅽВɑƅеḷṖӏսģіṅṖаṡş as LwcBabelPluginPass };
