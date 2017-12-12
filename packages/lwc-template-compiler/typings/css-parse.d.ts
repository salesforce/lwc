/**
 * Partial type definition for css-parse
 * From: https://github.com/reworkcss/css
 */

declare namespace Errors {
    interface ParsingError {
        message: string;
        reason: string;
        filename?: string;
        line?: number;
        column: number;
        source: string;
    }
}

declare namespace AST {
    interface Location {
        line: number;
        column: number;
    }

    interface ASTNode {
        type: string;
        parent: ASTNode | null;
        position: {
            start: Location;
            end: Location;
            source?: string;
            content: string;
        }
    }

    interface Stylesheet extends ASTNode {
        type: 'stylesheet';
        rules: (Rule | Comment)[];
        parsingErrors: Errors.ParsingError[];
    }

    interface Rule extends ASTNode {
        type: 'rule';
        selectors: string[];
        declarations: (Declaration | Comment)[];
    }

    interface Declaration extends ASTNode {
        type: 'declaration';
        property: string;
        value: string | number | null;
    }

    interface Comment extends ASTNode {
        type: 'comment';
        comment: 'string';
    }

    interface Root {
        stylesheet: Stylesheet;
    }
}

declare module 'css-parse' {
    interface ParsingOptions {
        silent?: boolean;
        source?: string;
    }

    const parse: (code: string, options?: ParsingOptions) => AST.Root;
    export = parse;
}
