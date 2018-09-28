import * as path from "path";
import lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";
import { CompilerError } from "../common-interfaces/compiler-error";

import {
    NormalizedCompilerOptions,
    CompilerOptions,
    normalizeOptions
} from "../compiler/options";

import styleTransform from "./style";
import templateTransformer, { TemplateMetadata } from "./template";
import javascriptTransformer from "./javascript";
import compatPluginFactory from "../rollup-plugins/compat";

import { isString, isUndefined } from "../utils";
import { MetadataCollector } from "../bundler/meta-collector";
import { SourceMap } from "../compiler/compiler";

// TODO: Improve on metadata type by providing consistent interface. Currently
// javascript transformer output differs from css and html in that later return a promise
export interface FileTransformerResult {
    code: string;
    metadata?:
        | TemplateMetadata
        | lwcClassTransformPlugin.Metadata;
    map: SourceMap | null;
}

export type FileTransformer = (
    source: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
) => FileTransformerResult | Promise<FileTransformerResult>;

export function transform(src: string, id: string, options: CompilerOptions) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    return transformFile(src, id, normalizeOptions(options));
}

export function getTransformer(fileName: string): FileTransformer {
    switch (path.extname(fileName)) {
        case ".html":
            return templateTransformer;

        case ".css":
            return styleTransform;

        case ".js":
            return javascriptTransformer;

        default:
            throw new TypeError(`No available transformer for "${fileName}"`);
    }
}

export async function transformFile(
    src: string,
    id: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): Promise<FileTransformerResult> {
    const transformer = getTransformer(id);
    const result = await transformer(src, id, options, metadataCollector);

    let compatResult;
    if (options.outputConfig.compat) {
        // @todo: Evaluate for removal.
        // **Note: this is dead code since it was only used in the rollup-plugin-lwc, but it was refactored to do this as part of the rollup-plugin-compat
        try {
            const compatPlugin = compatPluginFactory(
                options.outputConfig.resolveProxyCompat
            );
            compatResult = compatPlugin.transform(result.code);
            if (isUndefined(compatResult) || isUndefined(compatResult.code)) {
                throw new CompilerError(
                    "babel transform failed to produce code in compat mode",
                    id
                );
            }
        } catch (e) {
            throw new CompilerError(
                e.message,
                id,
                e.loc
            );
        }
        return { code: compatResult.code, map: null };
    }

    return result;
}
