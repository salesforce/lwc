import { Reference } from './types';
import { SAXParser } from 'parse5';

function isCustomElement(name: string) {
    return name.includes('-');
}

export function getReferences(source: string, filename: string): Reference[] {
    const parser = new SAXParser({ locationInfo: true });

    const references: Reference[] = [];
    const stack: Reference[] = [];

    parser.on('startTag', (name, attrs, selfClosing, location) => {
        if (!isCustomElement(name)) {
            return;
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
            return;
        }

        const tagRef = stack.pop();

        if (!tagRef) {
            throw new Error(`Missing matching tack for <${name}>`);
        }

        tagRef.locations.push({
            // Location offset given by the parser includes the preceding "</"
            start: location!.startOffset + 2,
            length: name.length,
        });

        references.push(tagRef);
    });

    parser.end(source);

    return references;
}
