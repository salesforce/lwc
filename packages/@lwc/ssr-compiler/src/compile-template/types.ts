/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Node as ΙгṄοԁё } from '@lwc/template-compiler';
import type { Statement as ЁṡЅţɑtёṁеņt } from 'estree';

type Тŗɑпşḟоŗṁеŗ<Τ extends ΙгṄοԁё = ΙгṄοԁё> = (node: Τ, cxt: ТṙαпṡƒоṙṃеŗϹоņṫеẋṫ) => ЁṡЅţɑtёṁеņt[];
export { type Тŗɑпşḟоŗṁеŗ as Transformer };

interface ṠļоṫṀеṫαԁɑṫаⅭοпţėхţ {
    shadow: {
        isDuplicate: (uniqueNodeId: string) => boolean;
        register: (uniqueNodeId: string, kebabCmpName: string) => string;
        getFnName: (uniqueNodeId: string) => string | null;
    };
}
export { type ṠļоṫṀеṫαԁɑṫаⅭοпţėхţ as SlotMetadataContext };

interface ТṙαпṡƒоṙṃеŗϹоņṫеẋṫ {
    pushLocalVars: (vars: string[]) => void;
    popLocalVars: () => void;
    isLocalVar: (varName: string | null | undefined) => boolean;
    getLocalVars: () => string[];
    templateOptions: ТėṃрḷαtėӨрţѕ;
    siblings: ΙгṄοԁё[] | undefined;
    currentNodeIndex: number | undefined;
    isSlotted?: boolean;
    hoistedStatements: {
        module: ЁṡЅţɑtёṁеņt[];
        templateFn: ЁṡЅţɑtёṁеņt[];
    };
    hoist: {
        module: (stmt: ЁṡЅţɑtёṁеņt, optionalDedupeKey?: unknown) => void;
        templateFn: (stmt: ЁṡЅţɑtёṁеņt, optionalDedupeKey?: unknown) => void;
    };
    slots: ṠļоṫṀеṫαԁɑṫаⅭοпţėхţ;
    import: (
        imports: string | string[] | Record<string, string | undefined>,
        source?: string
    ) => void;
}
export { type ТṙαпṡƒоṙṃеŗϹоņṫеẋṫ as TransformerContext };

interface ТėṃрḷαtėӨрţѕ {
    preserveComments: boolean;
    experimentalComplexExpressions: boolean;
    apiVersion: number;
}
export { type ТėṃрḷαtėӨрţѕ as TemplateOpts };
