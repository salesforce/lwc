import {basename, extname } from 'path';

function fileParts (filePath) {
    const filename = basename(filePath);
    const ext = extname(filename).substring(1);
    const name = basename(filename, ext);
    return { name: name, ext: ext };
}

export default function (options) {
    const componentPath = options.componentPath;
    const sourceTemplate = options.sourceTemplate;
    const sourceClass = options.sourceClass;
    const entryParts = fileParts(componentPath);

    return {
        name : 'source-resolver',

        resolveId: function (id) {
            // console.log('[]source-resolver:resolveId', '\t>> ' , id);
            const parts = fileParts(id);
            if (parts.name === entryParts.name && (parts.ext === 'js' && sourceClass || parts.ext === 'html' && sourceTemplate)) {
                return id;
            }
        },
        load (id) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
             const parts = fileParts(id);

            if (sourceClass && parts.name === entryParts.name) {
                if (sourceClass && parts.ext === 'js') {
                    return sourceClass;
                }

                if (sourceTemplate && parts.ext === 'html') {
                    return sourceTemplate;
                } 
            }
        }
    };
}