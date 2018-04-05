import { bundle } from "./bundler/bundler";
import { BundleMetadata } from "./bundler/meta-collector";
import { Diagnostic, DiagnosticLevel } from "./diagnostics/diagnostic";
import { CompilerOptions, validateOptions, normalizeOptions } from "./options";
import { version } from './index';

export { default as templateCompiler } from "lwc-template-compiler";

export interface CompilerOutput {
    success: boolean;
    diagnostics: Diagnostic[];
    result?: BundleResult;
    version: string;
}

export interface BundleResult {
    code: string;
    map: null;
    metadata: BundleMetadata;
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
        metadata,
    } = await bundle(normalizedOptions);

    diagnostics.push(...bundleDiagnostics);

    if (!hasError(diagnostics)) {
        result = {
            code,
            map: null,
            metadata,
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
