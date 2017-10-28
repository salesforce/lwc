import * as path from 'path';
import compile from 'raptor-template-compiler';

export default function(src, options) {
    const { filename, moduleResolver } = options;
    const cssName = path.basename(filename, path.extname(filename)) + '.css';

    const cssLocation = path.join(
        filename,
        '..',
        cssName
    );

    return moduleResolver.fileExists(cssLocation).then(hasStylesheet => {
        const config = {};

        if (hasStylesheet) {
            config.stylesheet = './' + cssName;
        }

        const { code, metadata, warnings } = compile(src, config);

        const fatalError = warnings.find(warning => warning.level === 'error');
        if (fatalError) {
            throw new Error(fatalError.message);
        }

        return { code, metadata };
    });
}
