import * as babel from "babel-core";
import * as raptorCompatTransformPlugin from "babel-plugin-transform-proxy-compat";

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_COMPAT } from "../babel-plugins";
import { OutputProxyCompatConfig } from "../options";

export default function(proxyCompatOption: OutputProxyCompatConfig | undefined) {
    const config = {
        ...BABEL_CONFIG_BASE,
        plugins: [
            ...BABEL_PLUGINS_COMPAT,
            [
                raptorCompatTransformPlugin,
                {
                    resolveProxyCompat: proxyCompatOption || { independent: "proxy-compat" }
                }
            ]
        ]
    };
    console.log("proxyCompatOption >>> ", proxyCompatOption);
    return {
        name: "compat",

        transform(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        }
    };
}
