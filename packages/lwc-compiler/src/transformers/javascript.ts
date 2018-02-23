import * as babel from "babel-core";
import * as raptorClassTransformPlugin from "babel-plugin-transform-lwc-class";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from "../babel-plugins";
import { NormalizedCompilerOptions } from "../options";
import { FileTransformerResult } from "./transformer";

export default function(
    code: string,
    filename: string,
    options: NormalizedCompilerOptions
): FileTransformerResult {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [raptorClassTransformPlugin, ...BABEL_PLUGINS_BASE],
        filename,
    });

    const transformed = babel.transform(code, config);
    if (!transformed.code) {
        throw new Error('javascript babel transform did not produce code.'); // TODO: create test coverage.
    }

    return {
        code: transformed.code,
        map: transformed.map,
        metadata: (transformed as any).metadata,
    };
}
