import * as path from 'path';

//import bundle from './bundle';
import { bundle, BundleReport } from './bundler/bundler';
import { getBundleReferences } from './references/references';
import { DiagnosticCollector } from './diagnostics/diagnostic-collector';
import { ALL_MODES, MODES } from './modes';
import { isUndefined, isString } from './utils';

import fsModuleResolver from './module-resolvers/fs';
import inMemoryModuleResolver from './module-resolvers/in-memory';
import { Diagnostic } from './diagnostics/diagnostic';
import { LwcModule } from './lwc-module';
import { Reference } from './references/types';

export { default as templateCompiler } from 'lwc-template-compiler';

const DEFAULT_NAMESPACE = 'x';

const DEFAULT_COMPILE_OPTIONS = {
    format: 'es',
    mode: MODES.DEV,
    mapNamespaceFromPath: false,
    env: {},
    resolveProxyCompat: {
        independent: 'proxy-compat',
    },
};

export interface CompilerOutput {
    status: string;
    code?: string;
    mode: string;
    references: Reference[];
    diagnostics: Diagnostic[];
    map?: any;
    metadata?: any;
    rawMetadata?: any;
}

export interface CompilerInput {
    /** The module to compile */
    module: LwcModule;

    env?: {
        [key: string]: string;
    };

    options: {
        format: string,
        mode: string;
    }

    /** Mandatory mode enum*/
    mode: string;
}

// TODO: keep this behemoth until api is fully converted and we come up with bundler options
export interface CompilerOptions {
    format?: string;
    mode: string;
    env?: any,
    mapNamespaceFromPath?: boolean,
    resolveProxyCompat?: any,
    // TODO: below attributes must be renamed; some removed completely once tests pass
    moduleName?: string,
    moduleNamespace?: string,
    normalizedModuleName?: string,
    sources: [{ filename: string }],
    moduleResolver?: any,
    $metadata?: any,
    componentName?: string,
    componentNamespace?: string;
    globals?: any,
}


// TODO: will need to turn into name, namespace once we change compile param type
export interface CmpNameNormalizationOptions {
    componentName?: string,
    componentNamespace?: string;
    mapNamespaceFromPath?: boolean,
}


export async function compile(entry: string, options: CompilerOptions) {
    if (isUndefined(entry) || !isString(entry)) {
        throw new Error(
            `Expected a string for entry. Received instead ${entry}`,
        );
    }

    entry = normalizeEntryPath(entry);
    options = Object.assign({ entry }, DEFAULT_COMPILE_OPTIONS, options);

    const acceptedModes = Object.keys(ALL_MODES).map(mode => ALL_MODES[mode]);
    if (!acceptedModes.includes(options.mode)) {
        throw new Error(
            `Expected a mode in ${acceptedModes.join(
                ', ',
            )}. Received instead ${options.mode}`,
        );
    }

    // Extract component namespace and name and add it to option
    // TODO: rename the componentName and componentNamespace APIs, to moduleName and moduleNamespace,
    //       not all the modules are components.
    const normalizationParams: CmpNameNormalizationOptions = {
        componentName: options.componentName,
        componentNamespace: options.componentNamespace,
        mapNamespaceFromPath: options.mapNamespaceFromPath,
    };
    const { name, namespace, normalizedName } = getNormalizedName(entry, normalizationParams);
    options.moduleName = name;
    options.moduleNamespace = namespace || undefined;
    options.normalizedModuleName = normalizedName;

    // Add extra properties needed for the compilation
    // TODO: provide proper abstraction instead of stuffing the options object
    options.$metadata = {};
    options.moduleResolver = isUndefined(options.sources)
        ? fsModuleResolver()
        : inMemoryModuleResolver(options);

    const refReport = getBundleReferences({
        entry,
        sources: options.sources
    });

    const diagnosticCollector = new DiagnosticCollector();
    diagnosticCollector.addAll(refReport.diagnostics);

    let bundledReport: BundleReport = {};
    if (!diagnosticCollector.hasError()) {
        bundledReport = await bundle(entry, options);
        diagnosticCollector.addAll(bundledReport.diagnostics || []);

        // diagnostics are saved onto the collector
        delete bundledReport.diagnostics;
    }



    const result: CompilerOutput = {
        diagnostics: diagnosticCollector.getAll(),
        mode: options.mode,
        references: refReport.references,
        status: diagnosticCollector.hasError() ? 'error' : 'ok',
        ...bundledReport,
    };
    return result;
}


/**
 * Takes a module location and returns it's entry point:
 *  '/foo/bar' => '/foo/bar/bar'
 *  '/foo/bar/bar.js' => '/foo/bar/bar.js'
 *
 * @param {string} fileName
 */
function normalizeEntryPath(fileName: string) {
    fileName = path.normalize(fileName.replace(/\/$/, ''));
    const ext = path.extname(fileName);
    return ext
        ? fileName
        : path.join(fileName, fileName.split(path.sep).pop() + ext);
}

/**
 * Names and namespace mapping:
 * 'foo.js' => ns: default, name: foo
 * '.../foo/foo.js' => ns: default, name: foo
 * '.../myns/foo/foo.js' => ns: myns, name: foo
 *
 * @param {string} fileName
 * @param {boolean} mapNamespaceFromPath
 */
function getNormalizedName(fileName: string, { componentName, componentNamespace, mapNamespaceFromPath }: CmpNameNormalizationOptions) {
    const ext = path.extname(fileName);
    const parts = fileName.split(path.sep);
    const basename: string = parts.pop() || "";
    const name = componentName || path.basename(basename, ext);

    let namespace;
    if (!isUndefined(componentNamespace)) {
        namespace = componentNamespace;
    } else {
        namespace = name.indexOf('-') === -1 ? DEFAULT_NAMESPACE : null;

        let tmpNs = parts.pop();
        if (tmpNs === name) {
            tmpNs = parts.pop();
        }
        // If mapping folder structure override namespace
        if (tmpNs && mapNamespaceFromPath) {
            namespace = tmpNs;
        }
    }

    return {
        name,
        namespace,
        normalizedName: [namespace, name].join('-'),
    };
}

export const version = '__VERSION__';
