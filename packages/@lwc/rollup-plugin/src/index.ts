/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';
import { XMLParser } from 'fast-xml-parser';

import { Plugin, SourceMapInput, RollupWarning, TransformPluginContext } from 'rollup';
import pluginUtils, { FilterPattern } from '@rollup/pluginutils';
import { transformSync, StylesheetConfig, DynamicComponentConfig } from '@lwc/compiler';
import { resolveModule, ModuleRecord } from '@lwc/module-resolver';
import { APIVersion } from '@lwc/shared';
import type { CompilerDiagnostic } from '@lwc/errors';

export interface RollupLwcOptions {
    /** A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should transform on. By default all files are targeted. */
    include?: FilterPattern;
    /** A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should not transform. By default no files are ignored. */
    exclude?: FilterPattern;
    /** The LWC root module directory. */
    rootDir?: string;
    /** If `true` the plugin will produce source maps. */
    sourcemap?: boolean;
    /** The [module resolution](https://lwc.dev/guide/es_modules#module-resolution) overrides passed to the `@lwc/module-resolver`. */
    modules?: ModuleRecord[];
    /** The stylesheet compiler configuration to pass to the `@lwc/style-compiler` */
    stylesheetConfig?: StylesheetConfig;
    /** The configuration to pass to the `@lwc/template-compiler`. */
    preserveHtmlComments?: boolean;
    /** The configuration to pass to `@lwc/compiler`. */
    experimentalDynamicComponent?: DynamicComponentConfig;
    /** The configuration to pass to the `@lwc/template-compiler`. */
    enableLwcSpread?: boolean;
    /** The configuration to pass to `@lwc/template-compiler` to enable scoped slots feature.*/
    enableScopedSlots?: boolean;
    /** The configuration to pass to `@lwc/compiler` to disable synthetic shadow support */
    disableSyntheticShadowSupport?: boolean;
    apiVersion?: APIVersion;
}

const xmlParser = new XMLParser();

const PLUGIN_NAME = 'rollup-plugin-lwc-compiler';

const DEFAULT_MODULES = [
    { npm: '@lwc/engine-dom' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css';
const EMPTY_IMPLICIT_CSS_CONTENT = '';

function isImplicitHTMLImport(importee: string, importer: string): boolean {
    return (
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
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

interface scopedOption {
    filename: string;
    scoped: boolean;
}

function parseQueryParamsForScopedOption(id: string): scopedOption {
    const [filename, query] = id.split('?', 2);
    const params = query && new URLSearchParams(query);
    const scoped = !!(params && params.get('scoped'));
    return {
        filename,
        scoped,
    };
}

function transformWarningToRollupWarning(
    warning: CompilerDiagnostic,
    src: string,
    id: string
): RollupWarning {
    // For reference on RollupWarnings, a good example is:
    // https://github.com/rollup/plugins/blob/53776ee/packages/typescript/src/diagnostics/toWarning.ts
    const pluginCode = `LWC${warning.code}`; // modeled after TypeScript, e.g. TS5055
    const result: RollupWarning = {
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

function findColocatedApiVersion(
    context: TransformPluginContext,
    filename: string
): number | undefined {
    const dirname = path.dirname(filename);
    const basename = path.basename(dirname);
    const jsMetaFilename = `${basename}.js-meta.xml`;
    const jsMetaFullFilename = path.join(dirname, jsMetaFilename);
    context.addWatchFile(jsMetaFullFilename);
    if (!fs.existsSync(jsMetaFullFilename)) {
        return undefined;
    }
    let parsed;
    try {
        parsed = xmlParser.parse(fs.readFileSync(jsMetaFullFilename, 'utf-8'), true);
    } catch (err) {
        context.warn({
            message: `Ignoring malformed XML file "${jsMetaFilename}"`,
            cause: err,
        });
        return undefined;
    }
    const apiVersion = parsed?.LightningComponentBundle?.apiVersion;
    if (typeof apiVersion !== 'number') {
        return undefined;
    }
    return apiVersion;
}

export default function lwc(pluginOptions: RollupLwcOptions = {}): Plugin {
    const filter = pluginUtils.createFilter(pluginOptions.include, pluginOptions.exclude);

    let { rootDir, modules = [] } = pluginOptions;
    const {
        stylesheetConfig,
        sourcemap = false,
        preserveHtmlComments,
        experimentalDynamicComponent,
        enableLwcSpread,
        enableScopedSlots,
        disableSyntheticShadowSupport,
        apiVersion,
    } = pluginOptions;

    return {
        name: PLUGIN_NAME,

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

            modules = [...modules, ...DEFAULT_MODULES, { dir: rootDir }];
        },

        resolveId(importee, importer) {
            // Normalize relative import to absolute import
            // Note that in @rollup/plugin-node-resolve v13, relative imports will sometimes
            // be in absolute format (e.g. "/path/to/module.js") so we have to check that as well.
            if ((importee.startsWith('.') || importee.startsWith('/')) && importer) {
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                let absPath = pluginUtils.addExtension(normalizedPath, ext);

                const { filename } = parseQueryParamsForScopedOption(absPath);
                absPath = filename; // remove query param

                if (isImplicitHTMLImport(absPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                if (isImplicitCssImport(absPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_CSS_PATH;
                }

                return pluginUtils.addExtension(normalizedPath, ext);
            } else if (importer) {
                // Could be an import like `import component from 'x/component'`
                try {
                    return resolveModule(importee, importer, {
                        modules,
                        rootDir,
                    }).entry;
                } catch (err: any) {
                    if (err && err.code !== 'NO_LWC_MODULE_FOUND') {
                        throw err;
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
            const { filename } = parseQueryParamsForScopedOption(id);
            id = filename; // remove query param

            const isCSS = path.extname(id) === '.css';

            if (isCSS) {
                const exists = fs.existsSync(id);
                if (exists) {
                    return fs.readFileSync(id, 'utf8');
                } else {
                    this.warn(
                        `The imported CSS file ${id} does not exist: Importing it as undefined. ` +
                            `This behavior may be removed in a future version of LWC. Please avoid importing a ` +
                            `CSS file that does not exist.`
                    );
                    return EMPTY_IMPLICIT_CSS_CONTENT;
                }
            }
        },

        transform(src, id) {
            // Filter user-land config and lwc import
            if (!filter(id)) {
                return;
            }

            const { scoped, filename } = parseQueryParamsForScopedOption(id);
            if (scoped) {
                id = filename; // remove query param
            }

            // Extract module name and namespace from file path
            const [namespace, name] = path.dirname(id).split(path.sep).slice(-2);

            // If an explicit version is passed in, use that unless the component declares its own API version
            const colocatedApiVersion = findColocatedApiVersion(this, id);
            const apiVersionToUse =
                typeof colocatedApiVersion === 'number' ? colocatedApiVersion : apiVersion;

            const { code, map, warnings } = transformSync(src, id, {
                name,
                namespace,
                outputConfig: { sourcemap },
                stylesheetConfig,
                experimentalDynamicComponent,
                preserveHtmlComments,
                scopedStyles: scoped,
                enableLwcSpread,
                enableScopedSlots,
                disableSyntheticShadowSupport,
                apiVersion: apiVersionToUse,
            });

            if (warnings) {
                for (const warning of warnings) {
                    this.warn(transformWarningToRollupWarning(warning, src, id));
                }
            }

            const rollupMap = map as SourceMapInput;
            return { code, map: rollupMap };
        },
    };
}

// For backward compatibility with commonjs format
module.exports = lwc;
