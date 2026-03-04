/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { CompilerDiagnostic, InstrumentationObject } from '@lwc/errors';

/**
 * Options for the LWC SWC plugin transform.
 * Mirrors LwcBabelPluginOptions with additional SWC-specific fields.
 */
export interface LwcSwcPluginOptions {
    // ---- Component identity (required) ----
    namespace: string;
    name: string;

    // ---- Source file info (required) ----
    filename: string;

    // ---- API version ----
    apiVersion?: number;

    // ---- Transform behavior flags ----
    isExplicitImport?: boolean;
    enableLightningWebSecurityTransforms?: boolean;
    enableSyntheticElementInternals?: boolean;

    // ---- Dynamic imports ----
    dynamicImports?: {
        loader?: string;
        strictSpecifier?: boolean;
    };

    // ---- Feature flags module ----
    componentFeatureFlagModulePath?: string;

    // ---- Source maps ----
    sourcemap?: boolean | 'inline';

    // ---- Error recovery ----
    experimentalErrorRecoveryMode?: boolean;

    // ---- Instrumentation ----
    instrumentation?: InstrumentationObject;
}

/**
 * The result of an LWC SWC plugin transformation.
 */
export interface LwcSwcTransformResult {
    /**
     * The transformed JavaScript source code.
     */
    code: string;

    /**
     * The generated source map as a JSON string (SWC native format),
     * or undefined if sourcemap was not requested.
     */
    map: string | undefined;

    /**
     * Any non-fatal diagnostic warnings collected during transformation.
     */
    warnings?: CompilerDiagnostic[];
}

/**
 * Information about a binding in program scope.
 */
export interface BindingInfo {
    /** 'module' means imported from a module; 'const'/'let'/'var' means local declaration */
    kind: 'module' | 'const' | 'let' | 'var';
    /** For module bindings: the source module path */
    source?: string;
    /** For const bindings with literal initializers: the literal value */
    value?: string | number | boolean;
    /** The value type for const bindings: 'string' | 'number' | 'boolean' */
    valueType?: 'string' | 'number' | 'boolean';
}
