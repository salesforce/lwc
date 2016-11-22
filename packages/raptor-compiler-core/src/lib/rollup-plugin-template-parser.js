import { extname } from 'path';
import templateParserPlugin from 'babel-plugin-transform-html-template';
import { transform } from 'babel-core';

export default function (options = {}) {
    const babelConfig = {
        babelrc: false,
        plugins: [ templateParserPlugin ]
    };

    options = Object.assign({}, babelConfig, options);

    return {
        name : 'template-parser',
        injected: false,

        transform (code, id) {
            const isHTML = extname(id) === '.html';
            const localOptions = Object.assign(options, { filename: id });
            if (isHTML && !this.injected) {
                this.injected = true;
                const result = transform(code, localOptions);

                return {
                    code: result.code,
                    map: result.map
                };
            }
        }
        
    };
}