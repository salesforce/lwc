import * as babel from "babel-core";
import * as raptorCompatTransformPlugin from "babel-plugin-transform-proxy-compat";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_COMPAT } from "../babel-plugins";

const COMPAT_CONFIG = {
    ...BABEL_CONFIG_BASE,
    plugins: [
        ...BABEL_PLUGINS_COMPAT,
        [
            raptorCompatTransformPlugin,
            {
                resolveProxyCompat: {
                    independent: "proxy-compat"
                }
            }
        ]
    ]
};

export default function() {
    return {
        name: "compat",

        transform(src: string) {
            const { code, map } = babel.transform(src, COMPAT_CONFIG);
            return { code, map };
        }
    };
}
