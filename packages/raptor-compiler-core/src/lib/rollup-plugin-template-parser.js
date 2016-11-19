import templateParserPlugin from 'babel-plugin-transform-html-template';
import { transform } from 'babel-core';
import { extname } from 'path';

export default function (options = {}) {
    const babelConfig = {
        babelrc: false,
        plugins: [ templateParserPlugin ]
    };

    return {
        name : 'template-parser',
        injected: false,

        transform (code, id) {
            const isHTML = extname(id) === '.html';
            const localOptions = Object.assign({ filename: id }, babelConfig);
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