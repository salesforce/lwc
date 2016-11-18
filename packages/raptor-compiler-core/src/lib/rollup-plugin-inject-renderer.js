import babel from 'rollup-plugin-babel';
import babelInjectPlugin from './babel-plugin-transform-inject-renderer';

export default function (options = {}) {
    const babelConfig = {
        babelrc: false,
        plugins: [
            babelInjectPlugin 
        ]
    };

    // Singleton wrapper
    const babelPlugin = babel(babelConfig);

    return {
        name : 'inject-renderer',
        injected: false,
        
        resolveId (id) {
            return babelPlugin.resolveId(id);
        },

        load (id) {
            return babelPlugin.load(id);
        },

        transform (code, id) {
            console.log('> [rollup-plugin-inject-renderer] - Transform: ', id);
            if (!this.injected) {
                this.injected = true;
                return babelPlugin.transform(code, id);
            }
        }
        
    };
}