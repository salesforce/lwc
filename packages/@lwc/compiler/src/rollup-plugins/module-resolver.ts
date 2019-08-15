/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { Plugin } from 'rollup';
import { ModuleResolutionErrors, generateCompilerError } from '@lwc/errors';

import { NormalizedCompilerOptions, BundleFiles } from '../compiler/options';

const EMPTY_IMPLICIT_CSS_CONTENT = '';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css';
const VALID_EXTENSIONS = ['.js', '.ts', '.html', '.css']; // order of resolution is important

function isRelativeImport(id: string) {
    return id.startsWith('.');
}

function isImplicitCssImport(id: string, importee: string) {
    return (
        path.extname(id) === '.css' &&
        path.extname(importee) === '.html' &&
        path.basename(id, '.css') === path.basename(importee, '.html')
    );
}

function isImplicitHTMLImport(importee: string, importer: string) {
    return (
        importer &&
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
    );
}

function isFirstCharacterUppercased(importee: string) {
    const upperCaseRegex = /^[A-Z]/;
    return importee && upperCaseRegex.test(importee);
}

function inferExtension(fileName: string, files: BundleFiles) {
    if (!path.extname(fileName)) {
        const ext = VALID_EXTENSIONS.find(ext => files.hasOwnProperty(fileName + ext)) || '';
        return fileName + ext;
    }
    return fileName;
}

function fileExists(fileName: string, { files }: NormalizedCompilerOptions): boolean {
    return files.hasOwnProperty(fileName);
}

function readFile(filename: string, options: NormalizedCompilerOptions): string {
    const { files } = options;

    if (fileExists(filename, options)) {
        return files[filename];
    } else {
        throw generateCompilerError(ModuleResolutionErrors.NONEXISTENT_FILE, {
            messageArgs: [filename],
            origin: { filename },
        });
    }
}

function generateModuleResolutionError(
    importee: string,
    importer: string,
    options: NormalizedCompilerOptions
) {
    const absPath = getAbsolutePath(importee, importer, options);
    const caseIgnoredFilename = getCaseIgnoredFilenameMatch(options.files, absPath);

    return caseIgnoredFilename
        ? generateCompilerError(ModuleResolutionErrors.IMPORT_AND_FILE_NAME_CASE_MISMATCH, {
              messageArgs: [
                  importee,
                  importer,
                  caseIgnoredFilename.substr(
                      0,
                      caseIgnoredFilename.length - path.extname(caseIgnoredFilename).length
                  ),
              ],
              origin: { filename: importer },
          })
        : generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED, {
              messageArgs: [importee, importer, absPath],
              origin: { filename: importer },
          });
}

function generateEntryResolutionError(
    importee: string,
    importer: string,
    options: NormalizedCompilerOptions
) {
    const absPath = getAbsolutePath(importee, importer, options);
    const caseIgnoredFilename = getCaseIgnoredFilenameMatch(options.files, absPath);

    return caseIgnoredFilename
        ? generateCompilerError(ModuleResolutionErrors.FOLDER_AND_FILE_NAME_CASE_MISMATCH, {
              messageArgs: [caseIgnoredFilename, importee],
              origin: { filename: importer },
          })
        : generateCompilerError(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FAILED, {
              messageArgs: [importee],
              origin: { filename: importer },
          });
}

function getAbsolutePath(importee: string, importer: string, options: NormalizedCompilerOptions) {
    const { baseDir, files } = options;
    const relPath = importer ? path.dirname(importer) : baseDir || '';
    return inferExtension(path.join(relPath, importee), files);
}

function getCaseIgnoredFilenameMatch(files: { [key: string]: string }, nameToMatch: string) {
    return Object.keys(files).find(
        (bundleFile: string) => bundleFile.toLowerCase() === nameToMatch
    );
}

export default function({ options }: { options: NormalizedCompilerOptions }): Plugin {
    return {
        name: 'lwc-module-resolver',

        resolveId(importee: string, importer: string) {
            // Mark non-relative imports (eg. 'lwc' or 'x/foo') as external dependencies.
            if (!isRelativeImport(importee) && importer) {
                return false;
            }

            if (isFirstCharacterUppercased(importee)) {
                throw generateCompilerError(
                    ModuleResolutionErrors.FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER,
                    {
                        messageArgs: [
                            importee,
                            importee.charAt(0).toLowerCase() + importee.slice(1),
                        ],
                    }
                );
            }

            const absPath = getAbsolutePath(importee, importer, options);

            if (!fileExists(absPath, options)) {
                if (isImplicitCssImport(importee, importer)) {
                    return IMPLICIT_DEFAULT_CSS_PATH;
                }

                if (isImplicitHTMLImport(absPath, importer)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                throw importer
                    ? generateModuleResolutionError(importee, importer, options)
                    : generateEntryResolutionError(importee, importer, options);
            }
            return absPath;
        },

        load(id: string) {
            if (id === IMPLICIT_DEFAULT_CSS_PATH) {
                return EMPTY_IMPLICIT_CSS_CONTENT;
            }

            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            return path.extname(id) === '.css' && !fileExists(id, options)
                ? EMPTY_IMPLICIT_CSS_CONTENT
                : readFile(id, options);
        },
    };
}
