import * as path from 'path';

import postcss from 'postcss';
import cssnano from 'cssnano';
import postcssPluginRaptor from 'postcss-plugin-raptor';

import { isProd } from '../modes';

export function getTemplateToken(filename, options) {
    const templateId = path.basename(filename, path.extname(filename));
    return `${options.normalizedModuleName}_${templateId}`;
}

export default function transformStyle(src, options) {
    const { filename, mode, normalizedModuleName: tagName } = options;
    const token = getTemplateToken(filename, options);

    const plugins = [
        postcssPluginRaptor({
            token,
            tagName,
        }),
    ];

    if (isProd(mode)) {
        plugins.push(
            cssnano({
                preset: 'default',
            }),
        );
    }

    return postcss(plugins)
        .process(src)
        .then(res => {
            const code = [
                `export const style = \`${res}\`;`,
                `export const token = '${token}';`,
            ].join('\n');

            return {
                code,
                metadata: {},
            };
        });
}
