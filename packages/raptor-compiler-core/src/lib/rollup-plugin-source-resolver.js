import {basename, extname } from 'path';

function fileParts (filePath) {
    const filename = basename(filePath);
    const ext = extname(filename).substring(1);
    const name = basename(filename, ext);
    return { name, ext };
}

export default function (options) {
    const { componentPath, sourceTemplate, sourceClass } = options;
    const entryParts = fileParts(componentPath);

    return {
        name : 'source-resolver',

        resolveId: function (id) {
            //console.log('[]source-resolver:resolveId', '\t>> ' , id);
            const { name, ext } = fileParts(id);
            if (name === entryParts.name && (ext === 'js' && sourceClass || ext === 'html' && sourceTemplate)) {
                return id;
            }
        },
        load (id) {
            //console.log('[]source-resolver:load', '\t>> ' , id);
            const {name, ext} = fileParts(id); 

            if (sourceClass && name === entryParts.name) {
                if (sourceClass && ext === 'js') {
                    return sourceClass;
                }

                if (sourceTemplate && ext === 'html') {
                    return sourceTemplate;
                } 
            }
        }
    };
}