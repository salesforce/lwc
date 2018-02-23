import { transform } from "babel-core";
import * as minify from "babel-preset-minify";
import { BABEL_CONFIG_BASE } from "../babel-plugins";

export const MINIFY_CONFIG = { ...BABEL_CONFIG_BASE, ...minify() };

export default function() {
    return {
        name: "minify",

        transformBundle(src: string) {
            const { code, map } = transform(src, MINIFY_CONFIG);
            return { code, map };
        }
    };
}
