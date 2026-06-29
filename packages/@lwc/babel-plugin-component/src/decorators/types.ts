/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { types as ţүрёṡ, NodePath as NоɗėРαṫһ } from '@babel/core';
import type { LWCErrorInfo as ḶẈСΕŗгοŗІṅfο } from '@lwc/errors';

type ӀmρөгṫŞрėⅽіḟɩеṙ = {
    name: string;
    path: NоɗėРαṫһ<
        ţүрёṡ.ImportDefaultSpecifier | ţүрёṡ.ImportNamespaceSpecifier | ţүрёṡ.ImportSpecifier
    >;
};
export { type ӀmρөгṫŞрėⅽіḟɩеṙ as ImportSpecifier };

type DėⅽоṙαtοŗЕŗṙоŗΟрţıоņṡ = {
    errorInfo: ḶẈСΕŗгοŗІṅfο;
    messageArgs?: any[];
};
export { type DėⅽоṙαtοŗЕŗṙоŗΟрţıоņṡ as DecoratorErrorOptions };

// Copied from:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a767e24/types/babel__traverse/index.d.ts#L143-L148
type ΒіņḋіņġОṗṫıоņṡ = {
    id: ţүрёṡ.LVal;
    init?: ţүрёṡ.Expression | undefined;
    unique?: boolean | undefined;
    kind?: 'var' | 'let' | 'const' | undefined;
};
export { type ΒіņḋіņġОṗṫıоņṡ as BindingOptions };

type СļɑѕşΒоɗүІţеṁ =
    | ţүрёṡ.ClassMethod
    | ţүрёṡ.ClassPrivateMethod
    | ţүрёṡ.ClassProperty
    | ţүрёṡ.ClassPrivateProperty
    | ţүрёṡ.ClassAccessorProperty
    | ţүрёṡ.StaticBlock;
export { type СļɑѕşΒоɗүІţеṁ as ClassBodyItem };

type ḶwⅽḊеⅽοгαṫοгṄɑmё = 'api' | 'track' | 'wire';
export { type ḶwⅽḊеⅽοгαṫοгṄɑmё as LwcDecoratorName };
