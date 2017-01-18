import { extname, normalize, join, sep, basename, dirname } from 'path';
import fs from 'fs';

export { basename };

export function normalizeEntryPath(path) {
    path = normalize(path.replace(/\/$/, ''));
    return extname(path) ? path : join(path, path.split(sep).pop() + '.js' );
}

export function fileParts(filePath) {
    const filename = basename(filePath);
    const rawExt = extname(filename);
    const ext = rawExt.substring(1);
    const name = basename(filename, rawExt);
    return { name: name, ext: ext };
}

export function getSource(path, sources = {}) {
    const filename = basename(path);
    const src = sources[filename] || sources[path];
    if (src) {
        return src;
    }
    return fs.readFileSync(path, 'utf8').toString();
}

export function getQualifiedName(path) {
    const dirParts = dirname(path).split('/');
    const pathBasedName = dirParts.pop();
    let pathBasedNS = dirParts.pop();

    if (pathBasedNS === 'components') {
        pathBasedNS = dirParts.pop();
    }

    return { 
        componentName : pathBasedName.toLowerCase(), 
        componentNamespace : pathBasedNS && pathBasedNS.toLowerCase() 
    };
}

export function normalizeOptions(options) {
    const entry = options.entry;
    const qName = getQualifiedName(entry);

    options.componentNamespace = options.componentNamespace || qName.componentNamespace;
    options.$metadata = {};
    options.bundle = options.bundle !== undefined ? options.bundle : true;

    if (options.bundle) {
        options.sources = options.sources || {};
        const entryParts = fileParts(entry);

        if (options.sourceClass) {
            options.sources[entry] = options.sourceClass;
            options.sources[entryParts.name + '.js'] = options.sourceClass;
        }

        if (options.sourceTemplate) {
            options.sources[entryParts.name + '.html'] = options.sourceTemplate;
        }

        if (options.sourceCss) {
            options.sources[entryParts.name + '.css'] = options.sourceCss;
        }
    }

    return options;
}

export function mergeMetadata (metadata) {
    const templateUsedIds = [];
    const templateDependencies = [];
    for (let i in metadata) {
        templateUsedIds.push(...metadata[i].templateUsedIds || []);
        templateDependencies.push(...metadata[i].templateDependencies || []);
    }

    return {
        bundleDependencies: templateDependencies,
        templateUsedIds
    };
}