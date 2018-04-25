import * as path from "path";
import * as lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";

import {
    NormalizedCompilerOptions,
    CompilerOptions,
    normalizeOptions
} from "../options";

import styleTransform from "./style";
import templateTransformer, { TemplateMetadata } from "./template";
import javascriptTransformer from "./javascript";
import compatPluginFactory from "../rollup-plugins/compat";

import { isString, isUndefined } from "../utils";
import { MetadataCollector } from "../bundler/meta-collector";

// TODO: Improve on metadata type by providing consistent interface. Currently
// javascript transformer output differs from css and html in that later return a promise
export interface FileTransformerResult {
    code: string;
    metadata?:
        | TemplateMetadata
        | lwcClassTransformPlugin.Metadata;
    map: null;
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

    if (options.outputConfig.compat) {
        const compatPlugin = compatPluginFactory(
            options.outputConfig.resolveProxyCompat
        );
        const compatResult = compatPlugin.transform(result.code);
        if (isUndefined(compatResult) || isUndefined(compatResult.code)) {
            throw new Error(
                "babel transform failed to produce code in compat mode"
            );
        }
        return { code: compatResult.code, map: null };
    }

    return result;
}
