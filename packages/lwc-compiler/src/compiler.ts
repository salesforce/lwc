import { bundle, BundleMetadata } from "./bundler/bundler";
import { getBundleReferences } from "./references/references";
import { Diagnostic, DiagnosticLevel } from "./diagnostics/diagnostic";
import { Reference } from "./references/references";
import { CompilerOptions, validateOptions, normalizeOptions } from "./options";

export { default as templateCompiler } from "lwc-template-compiler";

export interface CompilerOutput {
    success: boolean;
    diagnostics: Diagnostic[];
    result?: BundleResult;
}

export interface BundleResult {
    code: string;
    map: null;
    metadata: BundleMetadata;
    references: Reference[];
}

export async function compile(
    options: CompilerOptions
): Promise<CompilerOutput> {
    validateOptions(options);
    const normalizedOptions = normalizeOptions(options);

    let result: BundleResult | undefined;
    const diagnostics: Diagnostic[] = [];

    const bundleReport = getBundleReferences(normalizedOptions);
    diagnostics.push(...bundleReport.diagnostics);

    if (!hasError(diagnostics)) {
        const { diagnostics: bundleDiagnostics , code, metadata } = await bundle(
            normalizedOptions
        );

        diagnostics.push(...bundleDiagnostics);

        if (!hasError(diagnostics)) {
            result = {
                code,
                map: null,
                metadata,
                references: bundleReport.references
            };
        }
    }

    return {
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
