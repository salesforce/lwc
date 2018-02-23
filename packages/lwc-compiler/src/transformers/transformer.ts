import * as path from "path";
import { NormalizedCompilerOptions } from "../options";

import styleTransform from "./style";
import templateTransformer from "./template";
import javascriptTransformer from "./javascript";
import compatPluginFactory from "../rollup-plugins/compat";

import { isString, isUndefined } from "../utils";

export interface FileTransformerResult {
    code: string;
    metadata?: any; // TODO: need type
    map?: any;
}
export interface FileTransformer {
    (source: string, filename: string, options: NormalizedCompilerOptions):
        | FileTransformerResult
        | Promise<FileTransformerResult>;
}

export function transform(
    src: string,
    id: string,
    options: NormalizedCompilerOptions
) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    return transformFile(src, id, options);
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

async function transformFile(
    src: string,
    id: string,
    options: NormalizedCompilerOptions
): Promise<FileTransformerResult> {
    const transformer = getTransformer(id);
    const result = await transformer(src, id, options);

    if (options.outputConfig.compat) {
        const { transform } = compatPluginFactory();
        const { code } = transform(result.code);
        if (isUndefined(code)) {
            // TODO: write test for this case
            throw new Error('babel transform failed to produce code in compat mode');
        }
        return { code };
    }

    return result;
}
