import * as path from "path";

//import bundle from './bundle';
import { bundle, BundleReport } from "./bundler/bundler";
import { getBundleReferences } from "./references/references";
import { DiagnosticCollector } from "./diagnostics/diagnostic-collector";
import { Diagnostic } from "./diagnostics/diagnostic";
import { Reference } from "./references/types";
import { isString, isUndefined } from "./utils";

export { default as templateCompiler } from "lwc-template-compiler";

export interface CompilerOutput {
    success: boolean;
    diagnostics: Diagnostic[];
    result?: {
        code: string;
        map: any;
        metadata: any; // TODO: add type,
        references: Reference[];
    };
}

export interface OutputConfig {
    env?: { [name: string]: string }; // NODE_ENV: 'dev'
    minify: boolean;
    compat: boolean;
}

// TODO: keep this behemoth until api is fully converted and we come up with bundler options
export interface CompilerOptions {
    outputConfig: OutputConfig;
    // TODO: below attributes must be renamed; some removed completely once tests pass
    name: string; // TODO: name
    namespace: string;
    files: [{ filename: string }];
}

export async function compile(options: CompilerOptions) {
    const { name: entry } = options;

    // TODO: validate input
    if (isUndefined(entry) || !isString(entry)) {
        throw new Error(
            `Expected a string for entry. Received instead ${entry}`
        );
    }

    const compilationOutput: CompilerOutput = {
        diagnostics: [],
        success: false
    };

    const diagnosticCollector = new DiagnosticCollector();

    const { diagnostics, references } = getBundleReferences(options);

    // add reference diagnostics
    diagnosticCollector.addAll(diagnostics);

    // process bundle only
    if (!diagnosticCollector.hasError()) {
        const { diagnostics, code, map, metadata } = await bundle(
            entry,
            options
        );
        diagnosticCollector.addAll(diagnostics);

        // process bundling result
        if (!diagnosticCollector.hasError()) {
            compilationOutput.result = { code, map, metadata, references };
        }
    }

    // collect all the diagnostics
    compilationOutput.diagnostics = diagnosticCollector.getAll();
    return compilationOutput;
}

export const version = "__VERSION__";
