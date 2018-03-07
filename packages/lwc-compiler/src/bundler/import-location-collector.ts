export interface ImportLocation {
    name: string;
    location: {
        start: number;
        length: number;
    };
}

const BRACKET_LENGTH = 1;
const EXPECTED_MATCH_LENGTH = 3;
const IMPORT_SEPARATOR = ", ";
const QUOTE_LENGTH = 1;
const MODULE_IMPORT_REGEX = /(?<=define\()('.*?', )\[('.*?')\]/;

export class ImportLocationCollector {
    getLocations(code: string): ImportLocation[] {
        const locations: ImportLocation[] = [];

        if (!code) {
            return locations;
        }

        const regex = new RegExp(MODULE_IMPORT_REGEX);
        const matches = regex.exec(code);

        // we expect matches to return 3 objects
        // 1. full match
        // 2. filename
        // 3. imports
        if (!matches || matches.length < EXPECTED_MATCH_LENGTH) {
            return locations;
        }

        const filename = matches[1].replace(/'/g, ""); // normalize - result items come back with double quotes "'x-foo'"
        const imports = matches[2].split(IMPORT_SEPARATOR);

        // starting index points to filename, thus incrementing to point to correct location
        let position =
            matches.index +
            filename.length +
            IMPORT_SEPARATOR.length +
            BRACKET_LENGTH +
            QUOTE_LENGTH;

        imports.forEach((moduleImport: string) => {
            const name = moduleImport.replace(/'/g, ""); // string comes back with two types of quotes "'x-foo'"

            locations.push({
                name,
                location: {
                    start: position,
                    length: name.length
                }
            });

            // increment position from beginning of the current to next import ['current-import', 'next-import']
            position +=
                name.length +
                QUOTE_LENGTH +
                IMPORT_SEPARATOR.length +
                QUOTE_LENGTH;
        });

        return locations;
    }
}
