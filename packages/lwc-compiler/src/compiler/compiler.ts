import { bundle } from "../bundler/bundler";
import { BundleMetadata } from "../bundler/meta-collector";
import { Diagnostic, DiagnosticLevel } from "../diagnostics/diagnostic";
import { CompilerOptions, validateOptions, normalizeOptions, NormalizedOutputConfig } from "./options";
import { version } from '../index';

export { default as templateCompiler } from "lwc-template-compiler";

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

export interface SourceMap {
    version?: string;
    file?: string;
    sourceRoot?: string;
    sources?: string[];
    names?: string[];
    mappings: string;
}

export async function compile(
    options: CompilerOptions
): Promise<CompilerOutput> {
    validateOptions(options);
    const normalizedOptions = normalizeOptions(options);

    let result: BundleResult | undefined;
    const diagnostics: Diagnostic[] = [];

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
        diagnostics,
        result
    };
}

function hasError(diagnostics: Diagnostic[]) {
    return diagnostics.some(d => {
        return d.level <= DiagnosticLevel.Error;
    });
}
