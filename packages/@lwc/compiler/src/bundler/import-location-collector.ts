/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Location } from '../common-interfaces/location';

export interface ModuleImportLocation {
    name: string;
    location: Location;
}

const MODULE_IMPORT_REGEX = /(?:define\([(['|"][\w/]+['|"],?\s*)(?:\[((?:['|"][@\w-/]+['|"],?\s*)+)\])?,?\s*function/;

export function collectImportLocations(code: string) {
    const matches = new RegExp(MODULE_IMPORT_REGEX).exec(code);

    // assert amd
    if (!matches || !matches.length) {
        return [];
    }

    const searchSubstring: string = matches[0];

    // format: `'x-bar', 'x-foo'`
    const rawImports = matches[1];
    if (!rawImports) {
        return [];
    }

    // split result: ["'x-bar', 'x-foo'"]
    const imports = rawImports.split(/,\s*/) || [];

    return imports.map(moduleImport => {
        const normalizedName = moduleImport.replace(/'/g, '');
        const position = searchSubstring.indexOf(normalizedName);

        return {
            name: normalizedName,
            location: {
                start: position,
                length: normalizedName.length,
            },
        };
    });
}
