/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import 'parse5-with-errors';

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
