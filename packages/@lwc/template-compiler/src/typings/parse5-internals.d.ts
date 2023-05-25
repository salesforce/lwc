/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// TODO [#3388]: if/when we upgrade to v7 or greater of parse5, these
//               types can be removed or slimmed down

declare module 'parse5/lib/parser' {
    import Tokenizer, { Token } from 'parse5/lib/tokenizer';
    import { Document, DocumentFragment, Element, ParserOptions } from 'parse5';

    export class OpenElements {
        current: Document | Element;
    }

    export default class Parser {
        treeAdapter: any;
        tokenizer: Tokenizer;
        options: ParserOptions;
        openElements: OpenElements;
        constructor(options: ParserOptions);
        parseFragment(html: string, fragmentContext?: any): DocumentFragment;
        _bootstrap(document: Document, fragmentContext: any): void;
        _insertCharacters(token: Token): void;
    }
}

declare module 'parse5/lib/tokenizer' {
    export type CodePoint = number;

    export class Preprocessor {
        html: string | null;
        pos: number;
        write(chunk: string, isLastChunk?: boolean): void;
        advance(): void;
    }

    export interface Token {
        type: string;
        chars: string;
        location: {
            startOffset: number;
            endOffset: number;
        };
    }

    export default class Tokenizer {
        static CHARACTER_TOKEN: string;
        static NULL_CHARACTER_TOKEN: string;
        static WHITESPACE_CHARACTER_TOKEN: string;

        preprocessor: Preprocessor;
        currentAttr: {
            name: string;
            value: string;
        } | null;
        currentCharacterToken: Token | null;
        ATTRIBUTE_VALUE_UNQUOTED_STATE(cp: CodePoint): void;
        DATA_STATE(cp: CodePoint): void;
        write(chunk: string, isLastChunk?: boolean): void;
        _unconsume(): void;
        _emitCurrentCharacterToken(): void;
        _createCharacterToken(type: string, chars: string): void;
    }
}
