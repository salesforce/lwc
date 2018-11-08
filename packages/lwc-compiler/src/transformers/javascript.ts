import * as babel from "@babel/core";
import lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";
import { normalizeToCompilerError, TransformerErrors } from "lwc-errors";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from "../babel-plugins";
import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";

export default function(
    code: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): FileTransformerResult {
    const isExplicitImport = options;
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [[lwcClassTransformPlugin, { isExplicitImport }], ...BABEL_PLUGINS_BASE],
        filename,
        sourceMaps: options.outputConfig.sourcemap
    });

    let result;
    try {
        result = babel.transform(code, config);
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.JS_TRANSFORMER_ERROR, e, { filename });
    }

    const metadata: lwcClassTransformPlugin.Metadata = (result as any)
        .metadata;

    if (metadataCollector) {
        metadata.decorators.forEach(d => metadataCollector.collectDecorator(d));
        if (metadata.classMembers) {
            metadata.classMembers.forEach(c => metadataCollector.collectClassMember(c));
        }
        metadataCollector.setDeclarationLoc(metadata.declarationLoc);
        metadataCollector.setDoc(metadata.doc);

        metadataCollector.collectExports(metadata.exports);
    }

    return {
        code: result.code,
        map: result.map,
        metadata,
    };
}
