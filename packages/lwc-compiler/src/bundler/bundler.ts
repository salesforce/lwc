import { rollup } from "rollup";
import * as rollupPluginReplace from "rollup-plugin-replace";

import { inMemoryModuleResolver } from "../module-resolvers/in-memory";
import rollupModuleResolver from "../rollup-plugins/module-resolver";

import rollupTransform from "../rollup-plugins/transform";
import rollupCompat from "../rollup-plugins/compat";
import rollupMinify from "../rollup-plugins/minify";

import { NormalizedCompilerOptions } from "../options";
import { Diagnostic, DiagnosticLevel } from "../diagnostics/diagnostic";


export interface BundleReport {
    code?: string;
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

// TODO: type
function mergeMetadata(metadata: any) {
    const dependencies = new Map(
        (metadata.rollupDependencies || []).map((d: any) => [d, "module"])
    );
    const decorators = [];

    for (let i in metadata) {
        (metadata[i].templateDependencies || []).forEach((td: any) =>
            dependencies.set(td, "component")
        );
        decorators.push(...(metadata[i].decorators || []));
    }

    return {
        decorators,
        references: Array.from(dependencies).map(d => ({
            name: d[0],
            type: d[1]
        }))
    };
}



function handleRollupWarning(diagnostics: Diagnostic[]) {
    return function onwarn({ message, loc }: RollupWarning) {
        diagnostics.push({
            level: DiagnosticLevel.Warning,
            message,
            filename: loc && loc.file
        });
    };
}

export async function bundle(options: NormalizedCompilerOptions): Promise<BundleReport> {
    const { outputConfig, name, namespace, files } = options;
    const format = (outputConfig as any).format || DEFAULT_FORMAT;

    const diagnostics: Diagnostic[] = [];
    const $metadata = {};

    const plugins = [
        rollupPluginReplace({
            "process.env.NODE_ENV": JSON.stringify(outputConfig.env.NODE_ENV)
        }),
        rollupModuleResolver({
            moduleResolver: inMemoryModuleResolver(files),
            $metadata
        }),
        rollupTransform({ $metadata, options })
    ];

    if (outputConfig.compat) {
        plugins.push(rollupCompat());
    }

    if (outputConfig.minify) {
        plugins.push(rollupMinify());
    }

    try {
        const bundle = await rollup({
            input: name,
            plugins: plugins,
            onwarn: handleRollupWarning(diagnostics),
        });

        const { code } = await bundle.generate({
            amd: { id: namespace + "-" + name },
            interop: false,
            strict: false,
            format
        });

        return {
            code: code,
            map: null,
            metadata: mergeMetadata($metadata),
            rawMetadata: $metadata,
            diagnostics
        };
    } catch (error) {
        const diagnostic = {
            level: DiagnosticLevel.Fatal,
            message: error.message
        };
        diagnostics.push(diagnostic);
        // TODO: catch the result, check for code existence - if not present then we have a fatal
        //
        return { diagnostics };
    }
}
