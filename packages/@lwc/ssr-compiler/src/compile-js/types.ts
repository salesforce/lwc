/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { traverse } from 'estree-toolkit';
import type { Node } from 'estree';

export type Visitors = Parameters<typeof traverse<Node, ComponentMetaState>>[1];

export interface WireAdapter {
    fieldName: string;
    adapterConstructorId: string;
    config: Array<{
        configKey: string;
        referencedField: string;
    }>;
    fieldType: 'property' | 'method';
}

export interface ComponentMetaState {
    // indicates whether the LightningElement subclass is found in the JS being traversed
    isLWC: boolean;
    // indicates whether the LightningElement subclass includes a constructor method
    hasConstructor: boolean;
    // indicates whether the subclass has a connectedCallback method
    hasConnectedCallback: boolean;
    // indicates whether the subclass has a render method
    hasRenderMethod: boolean;
    // indicates whether the subclass has a renderedCallback method
    hadRenderedCallback: boolean;
    // indicates whether the subclass has a disconnectedCallback method
    hadDisconnectedCallback: boolean;
    // indicates whether the subclass has a errorCallback method
    hadErrorCallback: boolean;
    // the local name corresponding to the `LightningElement` import
    lightningElementIdentifier: string | null;
    // the class name of the subclass
    lwcClassName: string | null;
    // ties local variable names to explicitly-imported HTML templates
    tmplExplicitImports: Map<string, string> | null;
    // ties local variable names to explicitly-imported CSS files
    cssExplicitImports: Map<string, string> | null;
    // the set of variable names associated with explicitly imported CSS files
    staticStylesheetIds: Set<string> | null;
    // the public (`@api`-annotated) fields of the component class
    publicFields: Array<string>;
    // the private fields of the component class
    privateFields: Array<string>;
    // indicates whether the LightningElement has any wired props
    wireAdapters: WireAdapter[];
}
