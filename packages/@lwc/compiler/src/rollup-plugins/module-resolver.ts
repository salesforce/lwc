/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { Plugin } from 'rollup';
import { ModuleResolutionErrors, captureDiagnostic } from '@lwc/errors';
import { hasOwnProperty } from '@lwc/shared';

import { NormalizedCompileOptions, BundleFiles } from '../options';

const EMPTY_IMPLICIT_CSS_CONTENT = '';
const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';
const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css';
const VALID_EXTENSIONS = ['.js', '.ts', '.html', '.css']; // order of resolution is important

function isRelativeImport(id: string) {
    return id.startsWith('.');
}

function isImplicitCssImport(source: string, importer: string | undefined) {
    return (
        path.extname(source) === '.css' &&
        importer &&
        path.extname(importer) === '.html' &&
        path.basename(source, '.css') === path.basename(importer, '.html')
    );
}

function isImplicitHTMLImport(source: string, importer: string | undefined) {
    return (
        importer &&
        path.extname(importer) === '.js' &&
        path.extname(source) === '.html' &&
        path.dirname(importer) === path.dirname(source) &&
        path.basename(importer, '.js') === path.basename(source, '.html')
    );
}

function isFirstCharacterUppercased(importee: string) {
    const upperCaseRegex = /^[A-Z]/;
    return importee && upperCaseRegex.test(importee);
}

function inferExtension(fileName: string, files: BundleFiles) {
    if (!path.extname(fileName)) {
        const ext = VALID_EXTENSIONS.find(ext => hasOwnProperty.call(files, fileName + ext)) || '';
        return fileName + ext;
    }
    return fileName;
}

function fileExists(fileName: string, { files }: NormalizedCompileOptions): boolean {
    return hasOwnProperty.call(files, fileName);
}

function readFile(filename: string, options: NormalizedCompileOptions): string {
    const { files } = options;

    if (fileExists(filename, options)) {
        return files[filename];
    } else {
        throw captureDiagnostic(ModuleResolutionErrors.NONEXISTENT_FILE(filename), { filename });
    }
}

function generateModuleResolutionError(
    importee: string,
    importer: string,
    options: NormalizedCompileOptions
) {
    const absPath = getAbsolutePath(importee, importer, options);
    const caseIgnoredFilename = getCaseIgnoredFilenameMatch(options.files, absPath);

    return caseIgnoredFilename
        ? captureDiagnostic(
              ModuleResolutionErrors.IMPORT_AND_FILE_NAME_CASE_MISMATCH(
                  importee,
                  importer,
                  caseIgnoredFilename.substr(
                      0,
                      caseIgnoredFilename.length - path.extname(caseIgnoredFilename).length
                  )
              ),
              { filename: importer }
          )
        : captureDiagnostic(
              ModuleResolutionErrors.IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED(
                  importee,
                  importer,
                  absPath
              ),
              { filename: importer }
          );
}

function generateEntryResolutionError(
    importee: string,
    importer: string | undefined,
    options: NormalizedCompileOptions
) {
    const absPath = getAbsolutePath(importee, importer, options);
    const caseIgnoredFilename = getCaseIgnoredFilenameMatch(options.files, absPath);

    return caseIgnoredFilename
        ? captureDiagnostic(
              ModuleResolutionErrors.FOLDER_AND_FILE_NAME_CASE_MISMATCH(
                  caseIgnoredFilename,
                  importee
              ),
              { filename: importer }
          )
        : captureDiagnostic(ModuleResolutionErrors.IMPORTEE_RESOLUTION_FAILED(importee), {
              filename: importer
          });
}

function getAbsolutePath(
    importee: string,
    importer: string | undefined,
    options: NormalizedCompileOptions
) {
    const { baseDir, files } = options;
    const relPath = importer ? path.dirname(importer) : baseDir || '';
    return inferExtension(path.join(relPath, importee), files);
}

function getCaseIgnoredFilenameMatch(files: { [key: string]: string }, nameToMatch: string) {
    return Object.keys(files).find(
        (bundleFile: string) => bundleFile.toLowerCase() === nameToMatch
    );
}

export default function({ options }: { options: NormalizedCompileOptions }): Plugin {
    return {
        name: 'lwc-module-resolver',

        resolveId(source: string, importer: string | undefined) {
            // Mark non-relative imports (eg. 'lwc' or 'x/foo') as external dependencies.
            if (!isRelativeImport(source) && importer) {
                return false;
            }

            if (isFirstCharacterUppercased(source)) {
                throw captureDiagnostic(
                    ModuleResolutionErrors.FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER(
                        source,
                        source.charAt(0).toLowerCase() + source.slice(1)
                    )
                );
            }

            const absPath = getAbsolutePath(source, importer, options);

            if (!fileExists(absPath, options)) {
                if (isImplicitCssImport(source, importer)) {
                    return IMPLICIT_DEFAULT_CSS_PATH;
                }

                if (isImplicitHTMLImport(absPath, importer)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                throw importer
                    ? generateModuleResolutionError(source, importer, options)
                    : generateEntryResolutionError(source, importer, options);
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
        }
    };
}
