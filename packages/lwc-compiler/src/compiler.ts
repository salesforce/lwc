import { bundle, BundleReport } from "./bundler/bundler";
import { getBundleReferences } from "./references/references";
import { Diagnostic, DiagnosticLevel } from "./diagnostics/diagnostic";
import { Reference } from "./references/references";
import { CompilerOptions, validateOptions, normalizeOptions } from './options';

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

export interface BundleMetadata {
    references: any;
    decorators: any;
}

export async function compile(options: CompilerOptions): Promise<CompilerOutput> {
    validateOptions(options);
    const normalizedOptions = normalizeOptions(options);

    let result: BundleResult | undefined;
    const diagnostics: Diagnostic[] = [];

    const bundleReport = getBundleReferences(normalizedOptions);
    diagnostics.push(...bundleReport.diagnostics);

    if (!hasError(diagnostics)) {
        const bundleOutput: BundleReport = await bundle(normalizedOptions);
        const bundleDiagnostics: Diagnostic[] = bundleOutput.diagnostics || [];
        diagnostics.push(...bundleDiagnostics);

        if (!hasError(diagnostics)) {
            result = {
                code: bundleOutput.code,
                map: null,
                metadata: bundleOutput.metadata,
                references: bundleReport.references
            };
        }
    }

    return {
        success: !hasError(diagnostics),
        diagnostics,
        result,
    }
}

function hasError(diagnostics: Diagnostic[]) {
    return diagnostics.some(d => {
        return (d.level <= DiagnosticLevel.Error);
    });
}
