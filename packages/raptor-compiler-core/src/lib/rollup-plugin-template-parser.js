import babel from 'rollup-plugin-babel';
import {extname} from 'path';
import templateParserPlugin from 'babel-plugin-transform-html-template';

export default function (options = {}) {
    const babelConfig = {
        babelrc: false,
        plugins: [ templateParserPlugin ]
    };

    // Singleton wrapper
    const babelPlugin = babel(babelConfig);

    return {
        name : 'template-parser',
        injected: false,
        
        resolveId (id) {
            console.log('> [rollup-plugin-template-parser] - Resolve: ', id);
            return babelPlugin.resolveId(id);
        },

        load (id) {
            console.log('> [rollup-plugin-template-parser] - Load: ', id);
            return babelPlugin.load(id);
        },

        transform (code, id) {
            console.log('> [rollup-plugin-template-parser] - Transform: ', id);
            const isHTML = extname(id) === '.html';
            if (isHTML && !this.injected) {
                this.injected = true;
                return babelPlugin.transform(code, id);
            }
        }
        
    };
}