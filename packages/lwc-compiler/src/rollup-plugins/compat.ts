import * as babel from '@babel/core';
import * as presetCompat from 'babel-preset-compat';
import { BABEL_CONFIG_BASE } from '../babel-plugins';
import { OutputProxyCompatConfig } from "../options";

export default function(proxyCompatOption: OutputProxyCompatConfig | undefined) {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
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
