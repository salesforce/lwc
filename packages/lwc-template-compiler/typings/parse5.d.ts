import * as parse5 from 'parse5-with-errors';
declare module 'parse5-with-errors' {
    export namespace Errors {
        export class ParsingError {
            lwcCode: number;
        }
    }

    // jsdom uses updated parse5 with a different interface
    export namespace MarkupData {
        export class StartTagLocation {
            startLine: number;
            startCol: number;
        }

        export class Location {
            startLine: number;
            startCol: number;
        }
    }
}
