import * as babel from "@babel/core";
import * as lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from "../babel-plugins";
import { NormalizedCompilerOptions } from "../options";
import { FileTransformerResult } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";

export default function(
    code: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): FileTransformerResult {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [lwcClassTransformPlugin, ...BABEL_PLUGINS_BASE],
        filename
    });
    const result = babel.transform(code, config);

    if (!result || !result.code) {
        throw new Error("javascript babel transform did not produce code.");
    }

    const metadata: lwcClassTransformPlugin.Metadata = (result as any)
        .metadata;

    if (metadataCollector) {
        metadata.decorators.forEach(d => metadataCollector.collectDecorator(d));
    }

    return {
        code: result.code,
        map: null,
        metadata,
    };
}
