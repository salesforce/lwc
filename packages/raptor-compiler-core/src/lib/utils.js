import { extname, normalize, join, sep, basename, dirname } from 'path';
import fs from 'fs';

export { basename };

export const ltng_format = 'aura';
export const DEFAULT_NS = 'x';

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

export function getSource(path, sources) {
    sources = sources || {};
    const filename = basename(path);
    const src = sources[filename] || sources[path];
    if (src) {
        return src;
    }
    return fs.readFileSync(path, 'utf8').toString();
}

/*
* Names and namespace mapping:
* 'foo.js' => ns: default, name: foo
* '.../foo/foo.js' => ns: default, name: foo
* '.../myns/foo/foo.js' => ns: myns, name: foo
* '.../myns/components/foo/foo.js' => ns: myns, name: foo
*/
export function getQualifiedName(path, mapNamespaceFromPath) {
    const parts = path.split('/');
    const name = basename(parts.pop(), '.js');
    let ns = DEFAULT_NS;
    let tmpNs = parts.pop();

    if (parts.length > 2 && mapNamespaceFromPath && tmpNs === ns) {
        tmpNs = parts.pop();
        ns = tmpNs === 'components' ? parts.pop() : tmpNs;
    }

    return {
        componentName : name.toLowerCase(),
        componentNamespace : ns && ns.toLowerCase()
    };
}

export function normalizeOptions(options) {
    const entry = options.entry;
    const qName = getQualifiedName(entry, options.mapNamespaceFromPath);
    options.componentNamespace = options.componentNamespace || qName.componentNamespace;
    options.componentName = options.componentName || qName.componentName;
    options.bundle = options.bundle !== undefined ? options.bundle : true;
    options.$metadata = {};

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

export function transformAmdToLtng (code) {
    return code.replace('define', '$A.componentService.addModule');
}
