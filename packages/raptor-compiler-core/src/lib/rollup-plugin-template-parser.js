import { extname } from 'path';
import templateParserPlugin from 'babel-plugin-transform-html-template';
import { transform } from 'babel-core';

export default function (options = { babelConfig : {} }) {
    const sharedMetadata = options.sharedMetadata;
    const localBabelConfig = {
        babelrc: false,
        plugins: [ templateParserPlugin ]
    };
    options = Object.assign({}, options.babelConfig, localBabelConfig);
        
    return {
        name : 'template-parser',
        injected: false,

        transform (src, id) {
            if (extname(id) === '.html' && !this.injected) {
                this.injected = true;
                const localOptions = Object.assign(options, { filename: id });
                const {code, map, metadata} = transform(src, localOptions);

                if (sharedMetadata) {
                    sharedMetadata.templateProps = metadata.usedProps;
                }

                return { code, map };
            }
        }       
    };
}