/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';

import pluginUtils from '@rollup/pluginutils';
import { transformSync } from '@lwc/compiler';
import { resolveModule, RegistryType } from '@lwc/module-resolver';
import { getAPIVersionFromNumber } from '@lwc/shared';
import type { Plugin, SourceMapInput, RollupLog } from 'rollup';
import type { FilterPattern } from '@rollup/pluginutils';
import type { StylesheetConfig, DynamicImportConfig } from '@lwc/compiler';
import type { ModuleRecord } from '@lwc/module-resolver';
import type { APIVersion, CompilationMode } from '@lwc/shared';
import type { CompilerDiagnostic } from '@lwc/errors';

export interface RollupLwcOptions {
    /** A boolean indicating whether to compile for SSR runtime target. */
    targetSSR?: boolean;
    /** The variety of SSR code that should be generated, one of 'sync', 'async', or 'asyncYield' */
    ssrMode?: CompilationMode;
    /** A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should transform on. By default all files are targeted. */
    include?: FilterPattern;
    /** A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should not transform. By default no files are ignored. */
    exclude?: FilterPattern;
    /** The LWC root module directory. */
    rootDir?: string;
    /** If `true` the plugin will produce source maps. If `'inline'`, the plugin will produce inlined source maps and append them to the end of the generated file. */
    sourcemap?: boolean | 'inline';
    /** The [module resolution](https://lwc.dev/guide/es_modules#module-resolution) overrides passed to the `@lwc/module-resolver`. */
    modules?: ModuleRecord[];
    /**
     * Default modules passed to the `@lwc/module-resolver`.
     * If unspecified, defaults to `["@lwc/engine-dom", "@lwc/synthetic-shadow", "@lwc/wire-service"]`.
     */
    defaultModules?: ModuleRecord[];
    /** The stylesheet compiler configuration to pass to the `@lwc/style-compiler` */
    stylesheetConfig?: StylesheetConfig;
    /** The configuration to pass to the `@lwc/template-compiler`. */
    preserveHtmlComments?: boolean;
    // TODO [#5031]: Unify dynamicImports and experimentalDynamicComponent options
    /** The configuration to pass to `@lwc/compiler`. */
    experimentalDynamicComponent?: DynamicImportConfig;
    // TODO [#3331]: deprecate and remove lwc:dynamic
    /** The configuration to pass to `@lwc/template-compiler`. */
    experimentalDynamicDirective?: boolean;
    /** The configuration to pass to `@lwc/template-compiler`. */
    enableDynamicComponents?: boolean;
    /** The configuration to pass to `@lwc/compiler`. */
    enableSyntheticElementInternals?: boolean;
    /** The configuration to pass to `@lwc/compiler`. */
    enableLightningWebSecurityTransforms?: boolean;
    // TODO [#3370]: remove experimental template expression flag
    /** The configuration to pass to `@lwc/template-compiler`. */
    experimentalComplexExpressions?: boolean;
    /** @deprecated Spread operator is now always enabled. */
    enableLwcSpread?: boolean;
    /** The configuration to pass to the `@lwc/template-compiler`. */
    enableLwcOn?: boolean;
    /** The configuration to pass to `@lwc/compiler` to disable synthetic shadow support */
    disableSyntheticShadowSupport?: boolean;
    /** The API version to associate with the compiled module */
    apiVersion?: APIVersion;
    /** True if the static content optimization should be enabled. Defaults to true */
    enableStaticContentOptimization?: boolean;
    /**
     * Full module path for a feature flag to import and enforce at runtime.
     * The module should provide a boolean value as a default export.
     * Exporting `true` will allow the component to render; exporting `false` will result in a runtime error.
     * @example '@salesforce/featureFlag/name'
     */
    componentFeatureFlagModulePath?: string;
}

const PLUGIN_NAME = 'rollup-plugin-lwc-compiler';

const IMPLICIT_DEFAULT_HTML_PATH = path.join('@lwc', 'resources', 'empty_html.js');
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_CSS_PATH = path.join('@lwc', 'resources', 'empty_css.css');
const EMPTY_IMPLICIT_CSS_CONTENT = '';
const SCRIPT_FILE_EXTENSIONS = ['.js', '.mjs', '.jsx', '.ts', '.mts', '.tsx'];

const DEFAULT_MODULES = [
    { npm: '@lwc/engine-dom' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

function isImplicitHTMLImport(importee: string, importer: string, importerExt: string): boolean {
    return (
        SCRIPT_FILE_EXTENSIONS.includes(importerExt) &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, importerExt) === path.basename(importee, '.html')
    );
}

function isImplicitCssImport(importee: string, importer: string): boolean {
    return (
        path.extname(importee) === '.css' &&
        path.extname(importer) === '.html' &&
        (path.basename(importee, '.css') === path.basename(importer, '.html') ||
            path.basename(importee, '.scoped.css') === path.basename(importer, '.html'))
    );
}

interface Descriptor {
    filename: string;
    scoped: boolean;
    specifier: string | null;
}

function parseDescriptorFromFilePath(id: string): Descriptor {
    const [filename, query] = id.split('?', 2);
    const params = new URLSearchParams(query);
    const scoped = params.has('scoped');
    const specifier = params.get('specifier');
    return {
        filename,
        specifier,
        scoped,
    };
}

function appendAliasSpecifierQueryParam(id: string, specifier: string): string {
    const [filename, query] = id.split('?', 2);
    const params = new URLSearchParams(query);
    params.set('specifier', specifier);
    return `${filename}?${params.toString()}`;
}

function transformWarningToRollupLog(
    warning: CompilerDiagnostic,
    src: string,
    id: string
): RollupLog {
    // For reference on RollupLogs (f.k.a. RollupWarnings), a good example is:
    // https://github.com/rollup/plugins/blob/53776ee/packages/typescript/src/diagnostics/toWarning.ts
    const pluginCode = `LWC${warning.code}`; // modeled after TypeScript, e.g. TS5055
    const result: RollupLog = {
        // Replace any newlines in case they exist, just so the Rollup output looks a bit cleaner
        message: `@lwc/rollup-plugin: ${warning.message?.replace(/\n/g, ' ')}`,
        plugin: PLUGIN_NAME,
        pluginCode,
    };
    const { location } = warning;
    if (location) {
        result.loc = {
            // The CompilerDiagnostic from @lwc/template-compiler reports an undefined filename, because it loses the
            // filename context here:
            // https://github.com/salesforce/lwc/blob/e2bc36f/packages/%40lwc/compiler/src/transformers/template.ts#L35-L38
            file: id,
            // For LWC, the column is 0-based and the line is 1-based. Rollup just reports this for informational
            // purposes, though; it doesn't seem to matter what we put here.
            column: location.column,
            line: location.line,
        };
        // To get a fancier output like @rollup/plugin-typescript's, we would need to basically do our
        // own color coding on the entire line, adding the wavy lines to indicate an error, etc. You can see how
        // TypeScript does it here: https://github.com/microsoft/TypeScript/blob/1a4643b/src/compiler/program.ts#L453-L485
        // Outputting just the string that caused the error is good enough for now though.
        if (typeof location.start === 'number' && typeof location.length === 'number') {
            result.frame = src.substring(location.start, location.start + location.length);
        }
    }
    return result;
}

/**
 * Rollup plugin for bundling LWC components
 * @param pluginOptions LWC rollup plugin options
 * @returns LWC rollup plugin
 */
export default function lwc(pluginOptions: RollupLwcOptions = {}): Plugin {
    const filter = pluginUtils.createFilter(pluginOptions.include, pluginOptions.exclude);

    let { rootDir, modules = [] } = pluginOptions;

    const {
        targetSSR,
        ssrMode,
        stylesheetConfig,
        sourcemap = false,
        preserveHtmlComments,
        experimentalDynamicComponent,
        experimentalDynamicDirective,
        enableDynamicComponents,
        enableSyntheticElementInternals,
        enableLwcOn,
        enableLightningWebSecurityTransforms,
        // TODO [#3370]: remove experimental template expression flag
        experimentalComplexExpressions,
        disableSyntheticShadowSupport,
        apiVersion,
        defaultModules = DEFAULT_MODULES,
        componentFeatureFlagModulePath,
    } = pluginOptions;

    const plugin: Plugin = {
        name: PLUGIN_NAME,
        // The version from the package.json is inlined by the build script
        version: process.env.LWC_VERSION,
        buildStart({ input }) {
            if (rootDir === undefined) {
                if (Array.isArray(input)) {
                    rootDir = path.dirname(path.resolve(input[0]));

                    if (input.length > 1) {
                        this.warn(
                            `The "rootDir" option should be explicitly set when passing an "input" array to rollup. The "rootDir" option is implicitly resolved to ${rootDir}.`
                        );
                    }
                } else {
                    rootDir = path.dirname(path.resolve(Object.values(input)[0]));

                    this.warn(
                        `The "rootDir" option should be explicitly set when passing "input" object to rollup. The "rootDir" option is implicitly resolved to ${rootDir}.`
                    );
                }
            } else {
                rootDir = path.resolve(rootDir);
            }

            modules = [...modules, ...defaultModules, { dir: rootDir }];
        },

        resolveId(importee, importer) {
            if (importer) {
                // Importer has been resolved already and may contain an alias specifier
                const { filename: importerFilename } = parseDescriptorFromFilePath(importer);

                // Normalize relative import to absolute import
                // Note that in @rollup/plugin-node-resolve v13, relative imports will sometimes
                // be in absolute format (e.g. "/path/to/module.js") so we have to check that as well.
                if (importee.startsWith('.') || importee.startsWith('/')) {
                    const importerExt = path.extname(importerFilename);
                    // if importee has query params importeeExt will store them.
                    // ex: if scoped.css?scoped=true, importeeExt = .css?scoped=true
                    const importeeExt = path.extname(importee) || importerExt;

                    const importeeResolvedPath = path.resolve(
                        path.dirname(importerFilename),
                        importee
                    );
                    // importeeAbsPath will contain query params because they are attached to importeeExt.
                    // ex: myfile.scoped.css?scoped=true
                    const importeeAbsPath = pluginUtils.addExtension(
                        importeeResolvedPath,
                        importeeExt
                    );

                    // remove query params
                    const { filename: importeeNormalizedFilename } =
                        parseDescriptorFromFilePath(importeeAbsPath);

                    if (
                        isImplicitHTMLImport(
                            importeeNormalizedFilename,
                            importerFilename,
                            importerExt
                        ) &&
                        !fs.existsSync(importeeNormalizedFilename)
                    ) {
                        return IMPLICIT_DEFAULT_HTML_PATH;
                    }

                    if (
                        isImplicitCssImport(importeeNormalizedFilename, importerFilename) &&
                        !fs.existsSync(importeeNormalizedFilename)
                    ) {
                        return IMPLICIT_DEFAULT_CSS_PATH;
                    }

                    return importeeAbsPath;
                } else {
                    // Could be an import like `import component from 'x/component'`
                    try {
                        const { entry, specifier, type } = resolveModule(importee, importer, {
                            modules,
                            rootDir,
                        });

                        if (type === RegistryType.alias) {
                            // specifier must be in in namespace/name format
                            const [namespace, name, ...rest] = specifier.split('/');
                            // Alias specifier must have been in the namespace / name format
                            // to be used as the tag name of a custom element.
                            // Verify 3 things about the alias specifier:
                            // 1. The namespace is a non-empty string
                            // 2. The name is an non-empty string
                            // 3. The specifier was in a namespace / name format, ie no extra '/' (this is what rest checks)
                            const hasValidSpecifier =
                                !!namespace?.length && !!name?.length && !rest?.length;
                            if (hasValidSpecifier) {
                                return appendAliasSpecifierQueryParam(entry, specifier);
                            }
                        }

                        return entry;
                    } catch (err: any) {
                        if (err && err.code !== 'NO_LWC_MODULE_FOUND') {
                            throw err;
                        }
                    }
                }
            }
        },

        load(id) {
            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            if (id === IMPLICIT_DEFAULT_CSS_PATH) {
                return EMPTY_IMPLICIT_CSS_CONTENT;
            }

            // Have to parse the `?scoped=true` in `load`, because it's not guaranteed
            // that `resolveId` will always be called (e.g. if another plugin resolves it first)
            const { filename, specifier: hasAlias } = parseDescriptorFromFilePath(id);
            const isCSS = path.extname(filename) === '.css';

            if (isCSS || hasAlias) {
                const exists = fs.existsSync(filename);
                if (exists) {
                    return fs.readFileSync(filename, 'utf8');
                } else if (isCSS) {
                    this.warn(
                        `The imported CSS file ${filename} does not exist: Importing it as undefined. ` +
                            `This behavior may be removed in a future version of LWC. Please avoid importing a ` +
                            `CSS file that does not exist.`
                    );
                    return EMPTY_IMPLICIT_CSS_CONTENT;
                }
            }
        },

        transform(src, id) {
            const { scoped, filename, specifier } = parseDescriptorFromFilePath(id);

            // Filter user-land config and lwc import
            if (!filter(filename)) {
                return;
            }

            // Extract module name and namespace from file path.
            // Specifier will only exist for modules with alias paths.
            // Otherwise, use the file directory structure to resolve namespace and name.
            const [namespace, name] =
                specifier?.split('/') ?? path.dirname(filename).split(path.sep).slice(-2);

            /* v8 ignore next */
            if (!namespace || !name) {
                // TODO [#4824]: Make this an error rather than a warning
                this.warn(
                    `The component namespace and name (${JSON.stringify(
                        namespace
                    )} and ${JSON.stringify(
                        name
                    )}) could not be determined from the specifier ${JSON.stringify(
                        specifier
                    )} or filename ${JSON.stringify(path.dirname(filename))}`
                );
            }

            const apiVersionToUse = getAPIVersionFromNumber(apiVersion);

            const { code, map, warnings } = transformSync(src, filename, {
                name,
                namespace,
                outputConfig: { sourcemap },
                stylesheetConfig,
                experimentalDynamicComponent,
                experimentalDynamicDirective,
                enableDynamicComponents,
                enableSyntheticElementInternals,
                enableLwcOn,
                enableLightningWebSecurityTransforms,
                // TODO [#3370]: remove experimental template expression flag
                experimentalComplexExpressions,
                preserveHtmlComments,
                scopedStyles: scoped,
                disableSyntheticShadowSupport,
                apiVersion: apiVersionToUse,
                enableStaticContentOptimization:
                    // {enableStaticContentOptimization:undefined} behaves like `false`
                    // but {} (prop unspecified) behaves like `true`
                    'enableStaticContentOptimization' in pluginOptions
                        ? pluginOptions.enableStaticContentOptimization
                        : true,
                targetSSR,
                ssrMode,
                componentFeatureFlagModulePath,
            });

            if (warnings) {
                for (const warning of warnings) {
                    this.warn(transformWarningToRollupLog(warning, src, filename));
                }
            }

            const rollupMap = map as SourceMapInput;
            return { code, map: rollupMap };
        },
    };

    Object.entries(plugin).forEach(([hook, val]) => {
        if (typeof val === 'function') {
            (plugin as any)[hook] = function (...args: any) {
                // eslint-disable-next-line no-console
                console.log(hook, args);
                return val.apply(this, args);
            };
        }
    });

    return plugin;
}

// For backward compatibility with commonjs format
if (typeof module !== 'undefined') {
    // Using Object.defineProperty because regular assignment breaks when running with vite
    Object.defineProperty(module, 'exports', { value: lwc });
}
