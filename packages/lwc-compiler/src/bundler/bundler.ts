import { rollup } from "rollup";
import * as rollupPluginReplace from "rollup-plugin-replace";

import { MetadataCollector, ExternalReference } from "./meta-collector";
import rollupModuleResolver from "../rollup-plugins/module-resolver";

import rollupTransform from "../rollup-plugins/transform";
import rollupCompat from "../rollup-plugins/compat";
import rollupMinify from "../rollup-plugins/minify";

import {
    NormalizedCompilerOptions,
    validateNormalizedOptions
} from "../options";

import { Diagnostic, DiagnosticLevel } from "../diagnostics/diagnostic";

import {
    ApiDecorator,
    TrackDecorator,
    WireDecorator
} from "babel-plugin-transform-lwc-class";

import { ImportLocation, ImportLocationCollector } from "./import-location-collector";

export interface BundleReport {
    code: string;
    diagnostics: Diagnostic[];
    map: null;
    metadata: BundleMetadata;
}

export interface BundleMetadata {
    references: ExternalReference[];
    decorators: Array<ApiDecorator | TrackDecorator | WireDecorator>;
    importLocations: ImportLocation[];
}

export type ModuleImportLocations = ImportLocation[];

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
            options,
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

    const importLocations = new ImportLocationCollector().getLocations(code) || [];
    metadataCollector.collectImportLocations(importLocations);

    return {
        diagnostics,
        code,
        map: null,
        metadata: metadataCollector.getMetadata(),
    };
}
