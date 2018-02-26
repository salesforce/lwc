import * as path from "path";
import { NormalizedCompilerOptions, CompilerOptions, normalizeOptions } from "../options";

import styleTransform from "./style";
import templateTransformer from "./template";
import javascriptTransformer from "./javascript";
import compatPluginFactory from "../rollup-plugins/compat";

import { isString, isUndefined } from "../utils";
import { MetadataCollector } from "../bundler/meta-collector";

export interface FileTransformerResult {
    code: string;
    metadata?: any; // TODO: need type
    map?: any;
}
export interface FileTransformer {
    (source: string, filename: string, options: NormalizedCompilerOptions, metadataCollector?: MetadataCollector):
        | FileTransformerResult
        | Promise<FileTransformerResult>;
}

export function transform(
    src: string,
    id: string,
    options: CompilerOptions,
) {
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
    metadataCollector?: MetadataCollector,
): Promise<FileTransformerResult> {
    const transformer = getTransformer(id);
    const result = await transformer(src, id, options, metadataCollector);

    if (options.outputConfig.compat) {
        const { transform } = compatPluginFactory(
            options.outputConfig.resolveProxyCompat
        );
        const { code } = transform(result.code);
        if (isUndefined(code)) {
            // TODO: write test for this case
            throw new Error(
                "babel transform failed to produce code in compat mode"
            );
        }
        return { code }; // No meta?
    }

    return result;
}
