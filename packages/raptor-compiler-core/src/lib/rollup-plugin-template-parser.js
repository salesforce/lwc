import { extname } from 'path';
import templateParserPlugin from 'babel-plugin-transform-html-template';
import templateCleanupPlugin from 'raptor-html-cleanup-transform';
import { transform } from 'babel-core';

export default function (options = { babelConfig : {} }) {
    const localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [ templateParserPlugin ]
    };
    options = Object.assign({}, options.babelConfig, localBabelConfig);
        
    return {
        name : 'template-parser',
        injected: false,
        transform (src, id) {
            return templateCleanupPlugin.transform(src).then((result) => {
                //console.log('[]template-parser', '\t>> ' , id);
                if (!this.injected && extname(id) === '.html') {
                    this.injected = true;
                    const localOptions = Object.assign(options, { filename: id });
                    const {code, map} = transform(result, localOptions);
                    return {code, map};    
                }
            });
        }
    };
}