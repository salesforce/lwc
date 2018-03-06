import { SAXParser } from 'parse5';

import { DiagnosticLevel, Diagnostic } from '../diagnostics/diagnostic';
import { Reference, ReferenceReport } from './references';

function isCustomElement(name: string) {
    return name.includes('-');
}

export function getReferences(source: string, filename: string): ReferenceReport {
    const parser = new SAXParser({ locationInfo: true });
    const result: ReferenceReport = { references: [], diagnostics: [] };
    const stack: Reference[] = [];

    parser.on('startTag', (name, attrs, selfClosing, location) => {
        if (!isCustomElement(name)) {
            return result;
        }
        const startTagRef: Reference = {
            id: name,
            type: 'component',
            file: filename,
            locations: [
                {
                    // Location offset given by the parser includes the preceding "<"
                    start: location!.startOffset + 1,
                    length: name.length,
                },
            ],
        };
        stack.push(startTagRef);
    });

    parser.on('endTag', (name, location) => {
        if (!isCustomElement(name)) {
            return result;
        }

        const tagRef = stack.pop();

        if (!tagRef) {
            const diagnostic: Diagnostic = {
                level: DiagnosticLevel.Fatal,
                message: `Missing matching tack for <${name}>`,
                filename,
            };
            if (location) {
                diagnostic.location = {
                    start: location!.startOffset,
                    length: name.length,
                };
            }

            result.diagnostics.push(diagnostic);
            return result;
        } else {

            tagRef.locations.push({
                // Location offset given by the parser includes the preceding "</"
                start: location!.startOffset + 2,
                length: name.length,
            });

            result.references.push(tagRef);
        }
    });

    parser.end(source);
    return result;
}
