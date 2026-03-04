/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import lockerBabelPluginTransformUnforgeables from '@locker/babel-plugin-transform-unforgeables';
import { transformComponentSync, type LwcSwcPluginOptions } from '@lwc/swc-plugin-component';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import type { NormalizedTransformOptions } from '../options';
import type { TransformResult } from './shared';

/**
 * Transforms a JavaScript file.
 * @param code The source code to transform
 * @param filename The source filename, with extension.
 * @param options Transformation options.
 * @returns Compiled code
 * @throws Compilation errors
 * @example
 */
export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const {
        isExplicitImport,
        enableSyntheticElementInternals,
        dynamicImports,
        outputConfig: { sourcemap },
        enableLightningWebSecurityTransforms,
        namespace,
        name,
        instrumentation,
        apiVersion,
        experimentalErrorRecoveryMode,
        componentFeatureFlagModulePath,
    } = options;

    // -------------------------------------------------------------------------
    // Pass 1 — @lwc/swc-plugin-component (LWC class transform + SWC syntax lowering)
    //
    // Replaces the previous two-step approach of:
    //   (a) babel.transformSync with @lwc/babel-plugin-component (LWC class transforms)
    //   (b) @swc/core transformSync (syntax lowering: class properties, spread, async)
    //
    // @lwc/swc-plugin-component consolidates both into a single call that:
    //   1. Applies all LWC-specific AST transformations using @swc/core Visitor API:
    //      - Decorator collection (@api, @track, @wire) → registerDecorators()
    //      - Component registration → registerComponent()
    //      - Scoped CSS import annotation (?scoped=true)
    //      - Dynamic import rewriting (when dynamicImports.loader is set)
    //      - Compiler version comment injection (/*LWC compiler vX.Y.Z*/)
    //   2. Applies SWC built-in syntax lowering via jsc.target (computed internally):
    //      - class properties (loose: useDefineForClassFields: false — CRITICAL for LWC reactivity)
    //      - object rest/spread (lowered for older API versions)
    //      - async/await + async generators (lowered when enableLightningWebSecurityTransforms)
    //
    // Returns { code, map, warnings } where map is a JSON string (or undefined).
    // -------------------------------------------------------------------------
    const lwcSwcPluginOptions: LwcSwcPluginOptions = {
        namespace,
        name,
        filename,
        apiVersion,
        isExplicitImport,
        enableSyntheticElementInternals,
        enableLightningWebSecurityTransforms,
        dynamicImports,
        componentFeatureFlagModulePath,
        instrumentation,
        sourcemap,
        experimentalErrorRecoveryMode,
    };

    let swcTransformedCode: string;
    let swcTransformedMap: string | undefined;
    try {
        const swcResult = transformComponentSync(code, lwcSwcPluginOptions);
        swcTransformedCode = swcResult.code;
        swcTransformedMap = swcResult.map;
    } catch (e) {
        // transformComponent throws CompilerError or CompilerAggregateError;
        // these are already normalised LWC errors — re-throw directly.
        throw e;
    }

    // -------------------------------------------------------------------------
    // Pass 2 (conditional) — @locker/babel-plugin-transform-unforgeables
    //
    // ADR: docs/adr/locker-plugin-decision.md
    // Decision: Keep as a separate conditional Babel pass (NOT rewritten as SWC visitor).
    //
    // Rationale summary:
    //   - Plugin is security-critical, owned by the Salesforce Locker team.
    //   - Plugin uses @babel/core types, @babel/generator CodeGenerator, and Babel scope
    //     analysis APIs (scope.bindings, scope.hasBinding, path.findParent) that have no
    //     equivalent in SWC's TypeScript Visitor API.
    //   - Reimplementing without Locker team involvement risks security regressions.
    //   - The LWS path (enableLightningWebSecurityTransforms) is rare in practice.
    //   - @babel/core is kept as a dependency ONLY for this conditional LWS pass.
    //   - Locker team can independently provide an @swc/core-compatible plugin later.
    //
    // Implementation:
    //   - Pass receives Pass 1 output code + its source map.
    //   - inputSourceMap chains maps: original → Pass 1 (LWC transforms + SWC syntax lowering).
    //   - babelrc/configFile: false ensures only the locker plugin runs in this pass.
    // -------------------------------------------------------------------------
    if (enableLightningWebSecurityTransforms) {
        let lockerResult;
        try {
            lockerResult = babel.transformSync(swcTransformedCode, {
                filename,
                sourceMaps: sourcemap ? true : false,
                babelrc: false,
                configFile: false,
                compact: false,
                inputSourceMap: swcTransformedMap ? JSON.parse(swcTransformedMap) : undefined,
                plugins: [lockerBabelPluginTransformUnforgeables],
            })!;
        } catch (e) {
            throw normalizeToCompilerError(TransformerErrors.JS_TRANSFORMER_ERROR, e, { filename });
        }
        return {
            code: lockerResult.code!,
            map: lockerResult.map ? JSON.stringify(lockerResult.map) : null,
        };
    }

    return {
        code: swcTransformedCode,
        // Return null (not undefined) when no sourcemap, consistent with the old Babel behavior.
        // Tests assert `result.map` to be defined (toBeDefined passes for null), or to be null.
        map: swcTransformedMap ?? null,
    };
}
