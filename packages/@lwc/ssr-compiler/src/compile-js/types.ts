/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { type traverse } from 'estree-toolkit';
import type { ImportManager } from '../imports';
import type { ComponentTransformOptions } from '../shared';
import type {
    ClassDeclaration,
    Identifier,
    MemberExpression,
    MethodDefinition,
    Node,
    ObjectExpression,
    PropertyDefinition,
} from 'estree';

export type Visitors = Parameters<typeof traverse<Node, ComponentMetaState, never>>[1];

export interface WireAdapter {
    adapterId: Identifier | MemberExpression;
    config: ObjectExpression;
    field: MethodDefinition | PropertyDefinition;
}

export interface ComponentMetaState {
    /** indicates whether a subclass of LightningElement is found in the JS being traversed */
    isLWC: boolean;
    /** the class declaration currently being traversed, if it is an LWC component */
    currentComponent: ClassDeclaration | null;
    /** indicates whether the LightningElement subclass includes a constructor method */
    hasConstructor: boolean;
    /** indicates whether the subclass has a connectedCallback method */
    hasConnectedCallback: boolean;
    /** indicates whether the subclass has a renderedCallback method */
    hadRenderedCallback: boolean;
    /** indicates whether the subclass has a disconnectedCallback method */
    hadDisconnectedCallback: boolean;
    /** indicates whether the subclass has a errorCallback method */
    hadErrorCallback: boolean;
    /** the local name corresponding to the `LightningElement` import */
    lightningElementIdentifier: string | null;
    /** the class name of the subclass */
    lwcClassName: string | null;
    /** ties local variable names to explicitly-imported CSS files */
    cssExplicitImports: Map<string, string> | null;
    /** the set of variable names associated with explicitly imported CSS files */
    staticStylesheetIds: Set<string> | null;
    /** the public (`@api`-annotated) properties of the component class */
    publicProperties: Map<string, (MethodDefinition | PropertyDefinition) & { key: Identifier }>;
    /** the private properties of the component class */
    privateProperties: Set<string>;
    /** indicates whether the LightningElement has any wired props */
    wireAdapters: WireAdapter[];
    /** dynamic imports configuration */
    experimentalDynamicComponent: ComponentTransformOptions['experimentalDynamicComponent'];
    /** imports to add to the top of the program after parsing */
    importManager: ImportManager;
    /** identifiers starting with __lwc that we added */
    trustedLwcIdentifiers: WeakSet<Identifier>;
}
