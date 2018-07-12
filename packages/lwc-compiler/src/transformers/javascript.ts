import * as babel from "@babel/core";
import * as lwcClassTransformPlugin from "babel-plugin-transform-lwc-class";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from "../babel-plugins";
import { NormalizedCompilerOptions } from "../compiler/options";
import { FileTransformerResult } from "./transformer";
import { MetadataCollector } from "../bundler/meta-collector";
import { CompilerError } from "../common-interfaces/compiler-error";

export default function(
    code: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): FileTransformerResult {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [lwcClassTransformPlugin, ...BABEL_PLUGINS_BASE],
        filename,
    });

    let result;
    try {
        result = babel.transform(code, config);
    } catch (e) {
        throw new CompilerError(e.message, filename, e.loc);
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
    }

    return {
        code: result.code,
        map: null,
        metadata,
    };
}
