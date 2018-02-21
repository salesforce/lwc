import { bundle } from "./bundler/bundler";
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
    env?: { [name: string]: string }; // NODE_ENV: 'dev/prod/compat/prod_debug'
    minify: boolean;
    compat: boolean;
    format: string;
}

export interface CompilerOptions {
    outputConfig: OutputConfig;
    name: string;
    namespace: string;
    files: [{ filename: string }];
}

export async function compile(options: CompilerOptions) {
    if (isUndefined(options) || isUndefined(options.name) || !isString(options.name)) {
        throw new Error(
            `Expected a string for entry. Received instead ${options.name}`
        );
    }

    if (isUndefined(options.files)) {
        throw new Error(
            `Expected an object with files to be compiled`
        );
    }
    const { name } = options;

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
        const bundleOuput = await bundle(
            name,
            options
        );

        const { diagnostics, code, map, metadata } = bundleOuput;
        diagnosticCollector.addAll(diagnostics);

        // process bundling result
        if (!diagnosticCollector.hasError()) {
            compilationOutput.result = { code, map, metadata, references };
        }
    }

    // collect all the diagnostics
    compilationOutput.diagnostics = diagnosticCollector.getAll();
    compilationOutput.success = !diagnosticCollector.hasError();

    return compilationOutput;
}

export const version = "__VERSION__";
