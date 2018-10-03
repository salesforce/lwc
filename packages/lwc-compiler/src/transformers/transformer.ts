import * as path from "path";
import lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";

import {
    NormalizedCompilerOptions,
    CompilerOptions,
    normalizeOptions
} from "../compiler/options";

import styleTransform from "./style";
import templateTransformer, { TemplateMetadata } from "./template";
import javascriptTransformer from "./javascript";

import { isString } from "../utils";
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

export function transformFile(
    src: string,
    id: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): Promise<FileTransformerResult> {
    const transformer = getTransformer(id);

    // Some transforms are synchronous, while the CSS one is async. In order to
    // have a single output type, we make sure to wrap everything into a promise.
    return Promise.resolve(
        transformer(src, id, options, metadataCollector)
    );
}
