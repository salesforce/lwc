/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompilerDiagnostic, DiagnosticLevel } from '@lwc/errors';

import { bundle } from '../bundler/bundler';
import { CompileOptions, validateCompileOptions, NormalizedOutputConfig } from '../options';
import { version } from '../index';

export { default as templateCompiler } from '@lwc/template-compiler';

export interface CompilerOutput {
    success: boolean;
    diagnostics: CompilerDiagnostic[];
    result?: BundleResult;
    version: string;
}

export interface BundleResult {
    code: string;
    map: SourceMap | null;
    outputConfig: NormalizedOutputConfig;
}

export type SourceMap = any;

export async function compile(options: CompileOptions): Promise<CompilerOutput> {
    const normalizedOptions = validateCompileOptions(options);

    let result: BundleResult | undefined;
    const diagnostics: CompilerDiagnostic[] = [];

    const { diagnostics: bundleDiagnostics, code, map } = await bundle(normalizedOptions);

    diagnostics.push(...bundleDiagnostics);

    if (!hasError(diagnostics)) {
        result = {
            code,
            map,
            outputConfig: normalizedOptions.outputConfig,
        };
    }
    return {
        version,
        success: !hasError(diagnostics),
        diagnostics,
        result,
    };
}

function hasError(diagnostics: CompilerDiagnostic[]) {
    return diagnostics.some((d) => {
        return d.level === DiagnosticLevel.Error || d.level === DiagnosticLevel.Fatal;
    });
}
