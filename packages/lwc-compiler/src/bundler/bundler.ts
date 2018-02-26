import { rollup } from "rollup";
import * as rollupPluginReplace from "rollup-plugin-replace";

import { bundleMetadataCollector } from "./meta-collector";
import { inMemoryModuleResolver } from "../module-resolvers/in-memory";
import rollupModuleResolver from "../rollup-plugins/module-resolver";

import rollupTransform from "../rollup-plugins/transform";
import rollupCompat from "../rollup-plugins/compat";
import rollupMinify from "../rollup-plugins/minify";

import {
    NormalizedCompilerOptions,
    validateNormalizedOptions
} from "../options";
import { Diagnostic, DiagnosticLevel } from "../diagnostics/diagnostic";

export interface BundleReport {
    code: string;
    diagnostics: Diagnostic[];
    map?: null;
    metadata?: any;
    rawMetadata?: any;
}

interface RollupWarning {
    message: string;
    frame?: string;
    loc?: {
        file: string;
        line: number;
        column: number;
    };
}

const DEFAULT_FORMAT = "amd";


function handleRollupWarning(diagnostics: Diagnostic[]) {
    return function onwarn({ message, loc }: RollupWarning) {
        diagnostics.push({
            level: DiagnosticLevel.Warning,
            message,
            filename: loc && loc.file
        });
    };
}


export async function bundle(
    options: NormalizedCompilerOptions
): Promise<BundleReport> {
    validateNormalizedOptions(options);

    const { outputConfig, name, namespace, files } = options;
    const format = (outputConfig as any).format || DEFAULT_FORMAT;

    const diagnostics: Diagnostic[] = [];

    const metaCollector = bundleMetadataCollector();
    const plugins = [
        rollupPluginReplace({
            "process.env.NODE_ENV": JSON.stringify(outputConfig.env.NODE_ENV)
        }),
        rollupModuleResolver({
            collect: metaCollector.module,
            moduleResolver: inMemoryModuleResolver(files),
        }),
        rollupTransform({
            collect: metaCollector.file,
            options,
        })
    ];

    if (outputConfig.compat) {
        plugins.push(rollupCompat(outputConfig.resolveProxyCompat));
    }

    if (outputConfig.minify) {
        plugins.push(rollupMinify());
    }

    const bundle = await rollup({
        input: name,
        plugins: plugins,
        onwarn: handleRollupWarning(diagnostics)
    });

    const { code } = await bundle.generate({
        amd: { id: namespace + "-" + name },
        interop: false,
        strict: false,
        format
    });

    return {
        code,
        map: null,
        metadata: metaCollector.getMetadata(),
        diagnostics
    };
}
