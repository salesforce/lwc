import { ASTExpression, ASTIdentifier } from '../types';

interface ExpressionParser {
    position: number;
    peek(): string;
    match(expected: string): boolean;
    eat(expected?: string): string;
}

function isValidIdentifierStart(char: string): boolean {
    return (
        (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || char === '$' || char === '_'
    );
}

function isValidIdentifier(char: string): boolean {
    return isValidIdentifierStart(char) || (char >= '0' && char <= '9');
}

function createParser(str: string, offset: number = 0): ExpressionParser {
    return {
        position: offset,
        peek() {
            if (this.position > str.length) {
                throw new Error('Unexpected end of expression');
            }

            return str.charAt(this.position);
        },
        match(expected: string) {
            return this.peek() === expected;
        },
        eat(expected?: string): string {
            const actual = this.peek();
            if (expected && actual !== expected) {
                throw new Error(`Expected "${expected}" but found "${actual}"`);
            }

            this.position++;
            return actual;
        },
    };
}

function processIdentifier(parser: ExpressionParser): ASTIdentifier {
    let buffer = '';

    while (isValidIdentifier(parser.peek())) {
        buffer += parser.eat();
    }

    return {
        type: 'identifier',
        name: buffer,
    };
}

function processExpression(parser: ExpressionParser): ASTExpression {
    parser.eat('{');

    let expression: ASTExpression = processIdentifier(parser);

    while (parser.match('.')) {
        parser.eat('.');
        expression = {
            type: 'member-expression',
            object: expression,
            property: processIdentifier(parser),
        };
    }

    parser.eat('}');

    return expression;
}

export function parseExpression(str: string): ASTExpression {
    const parser = createParser(str);
    const expression = processExpression(parser);

    if (parser.position !== str.length) {
        throw new Error('Unexpected end of expression');
    }

    return expression;
}

export function parseExpressionAt(
    str: string,
    offset: number
): { expression: ASTExpression; offset: number } {
    const parser = createParser(str, offset);
    const expression = processExpression(parser);

    return {
        expression,
        offset: parser.position,
    };
}

export function parseIdentifer(str: string): ASTIdentifier {
    const parser = createParser(str);
    const identifier = processIdentifier(parser);

    if (parser.position !== str.length) {
        throw new Error('Unexpected identifier');
    }

    return identifier;
}
