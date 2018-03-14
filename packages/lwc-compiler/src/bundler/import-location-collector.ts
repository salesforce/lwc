import { Location } from "../common-interfaces/location";

export interface ModuleImportLocation {
    name: string;
    location: Location;
}

const MODULE_IMPORT_REGEX = /(?:define\([(['|"][\w-]+['|"],?\s*)(?:\[((?:['|"][@\w-/]+['|"],?\s*)+)\])?,?\s*function/;

export function collectImportLocations(code: string) {
    const locations: ModuleImportLocation[] = [];
    const matches = new RegExp(MODULE_IMPORT_REGEX).exec(code);

    // assert amd
    if (!matches || !matches.length) {
        return locations;
    }

    const searchSubstring: string = matches[0];

    // format: `'x-bar', 'x-foo'`
    const rawImports = matches[1];
    if (!rawImports) {
        return locations;
    }

    // split result: ["'x-bar', 'x-foo'"]
    const imports = rawImports.split(/,\s*/) || [];

    imports.forEach(moduleImport => {
        const normalizedName = moduleImport.replace(/'/g, "");
        const position = searchSubstring.indexOf(normalizedName);

        locations.push({
            name: normalizedName,
            location: {
                start: position,
                length: normalizedName.length
            }
        });
    });
    return locations;
}
