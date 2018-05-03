import { rollup } from "rollup";
import * as rollupPluginReplace from "rollup-plugin-replace";

import { MetadataCollector, BundleMetadata } from "./meta-collector";
import rollupModuleResolver from "../rollup-plugins/module-resolver";

import rollupTransform from "../rollup-plugins/transform";
import rollupCompat from "../rollup-plugins/compat";
import rollupMinify from "../rollup-plugins/minify";

import {
    NormalizedCompilerOptions,
    validateNormalizedOptions
} from "../compiler/options";

import { Diagnostic, DiagnosticLevel } from "../diagnostics/diagnostic";

import {
    collectImportLocations
} from "./import-location-collector";

export interface BundleReport {
    code: string;
    diagnostics: Diagnostic[];
    map: null;
    metadata: BundleMetadata;
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
        const filename = loc && loc.file;

        diagnostics.push({
            level: DiagnosticLevel.Warning,
            message,
            filename,
        });
    };
}

export async function bundle(
    options: NormalizedCompilerOptions
): Promise<BundleReport> {
    validateNormalizedOptions(options);

    const { outputConfig, name, namespace } = options;

    // TODO: remove format option once tests are converted to 'amd' format
    const format = (outputConfig as any).format || DEFAULT_FORMAT;

    const diagnostics: Diagnostic[] = [];

    const metadataCollector = new MetadataCollector();

    const plugins = [
        rollupPluginReplace({
            "process.env.NODE_ENV": JSON.stringify(outputConfig.env.NODE_ENV)
        }),
        rollupModuleResolver({
            metadataCollector,
            options
        }),
        rollupTransform({
            metadataCollector,
            options
        })
    ];

    if (outputConfig.compat) {
        plugins.push(rollupCompat(outputConfig.resolveProxyCompat));
    }

    if (outputConfig.minify) {
        plugins.push(rollupMinify());
    }

    const rollupBundler = await rollup({
        input: name,
        plugins,
        onwarn: handleRollupWarning(diagnostics)
    });

    const { code } = await rollupBundler.generate({
        amd: { id: namespace + "-" + name },
        interop: false,
        strict: false,
        format
    });

    metadataCollector.collectImportLocations(
        collectImportLocations(code) || []
    );

    return {
        diagnostics,
        code,
        map: null,
        metadata: metadataCollector.getMetadata()
    };
}
