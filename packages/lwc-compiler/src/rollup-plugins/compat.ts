import * as babel from '@babel/core';
import * as presetCompat from 'babel-preset-compat';
import { BABEL_CONFIG_BASE } from '../babel-plugins';
import { OutputProxyCompatConfig } from "../compiler/options";

export default function(proxyCompatOption: OutputProxyCompatConfig | undefined, sourcemaps?: boolean | 'inline') {
    const overrides = sourcemaps !== undefined ? { sourceMaps: sourcemaps } : {};
    const config = Object.assign({}, BABEL_CONFIG_BASE, overrides, {
        presets: [
            [presetCompat, { proxy: true, resolveProxyCompat: proxyCompatOption || { independent: "proxy-compat" } }],
        ],
    });

    return {
        name: "lwc-compat",

        transform(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        }
    };
}
