import { CompilerDiagnostic, DiagnosticLevel } from "lwc-errors";
import { Diagnostic } from "../diagnostics/diagnostic";

import { bundle } from "../bundler/bundler";
import { BundleMetadata } from "../bundler/meta-collector";
import { CompilerOptions, validateOptions, normalizeOptions, NormalizedOutputConfig } from "./options";
import { version } from '../index';

export { default as templateCompiler } from "lwc-template-compiler";

/**
 * Transforms a CompilerDiagnostic object so that it's compatible with previous Diagnostic type
 * @param diagnostic
 */
function temporaryAdapterForTypesafety(diagnostic: CompilerDiagnostic): Diagnostic {
    return diagnostic as Diagnostic;
}

export interface CompilerOutput {
    success: boolean;
    diagnostics: Diagnostic[];
    result?: BundleResult;
    version: string;
}

export interface BundleResult {
    code: string;
    map: SourceMap | null;
    metadata: BundleMetadata;
    outputConfig: NormalizedOutputConfig;
}

export type SourceMap = any;

export async function compile(
    options: CompilerOptions
): Promise<CompilerOutput> {
    validateOptions(options);
    const normalizedOptions = normalizeOptions(options);

    let result: BundleResult | undefined;
    const diagnostics: CompilerDiagnostic[] = [];

    const {
        diagnostics: bundleDiagnostics,
        code,
        map,
        metadata,
    } = await bundle(normalizedOptions);

    diagnostics.push(...bundleDiagnostics);

    if (!hasError(diagnostics)) {
        result = {
            code,
            map,
            metadata,
            outputConfig: normalizedOptions.outputConfig,
        };
    }
    return {
        version,
        success: !hasError(diagnostics),
        diagnostics: diagnostics.map(temporaryAdapterForTypesafety),
        result
    };
}

function hasError(diagnostics: CompilerDiagnostic[]) {
    return diagnostics.some(d => {
        return d.level === DiagnosticLevel.Error || d.level === DiagnosticLevel.Fatal;
    });
}
