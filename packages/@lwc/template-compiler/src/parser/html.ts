/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import * as he from 'he';

import { ParserDiagnostics } from '@lwc/errors';
import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import { sourceLocation } from '../shared/ast';

import ParserCtx from './parser';
import { errorCodesToErrorOn, errorCodesToWarnOnInOlderAPIVersions } from './parse5Errors';
import { parseFragment } from './expression-complex';

function getLwcErrorFromParse5Error(ctx: ParserCtx, code: string) {
    /* istanbul ignore else */
    if (errorCodesToErrorOn.has(code)) {
        return ParserDiagnostics.INVALID_HTML_SYNTAX;
    } else if (errorCodesToWarnOnInOlderAPIVersions.has(code)) {
        // In newer API versions, all parse 5 errors are errors, not warnings
        if (isAPIFeatureEnabled(APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS, ctx.apiVersion)) {
            return ParserDiagnostics.INVALID_HTML_SYNTAX;
        } else {
            return ParserDiagnostics.INVALID_HTML_SYNTAX_WARNING;
        }
    } else {
        // It should be impossible to reach here; we have a test in parser.spec.ts to ensure
        // all error codes are accounted for. But just to be safe, make it a warning.
        // TODO [#2650]: better system for handling unexpected parse5 errors
        // eslint-disable-next-line no-console
        console.warn('Found a Parse5 error that we do not know how to handle:', code);
        return ParserDiagnostics.INVALID_HTML_SYNTAX_WARNING;
    }
}

export function parseHTML(ctx: ParserCtx, source: string) {
    const onParseError = (err: parse5.ParserError) => {
        const { code, ...location } = err;

        const lwcError = getLwcErrorFromParse5Error(ctx, code);
        ctx.warnAtLocation(lwcError, sourceLocation(location), [code]);
    };

    // TODO [#3370]: remove experimental template expression flag
    if (ctx.config.experimentalComplexExpressions) {
        return parseFragment(source, {
            ctx,
            sourceCodeLocationInfo: true,
            onParseError,
        });
    }

    return parse5.parseFragment(source, {
        sourceCodeLocationInfo: true,
        onParseError,
    });
}

// https://github.com/babel/babel/blob/d33d02359474296402b1577ef53f20d94e9085c4/packages/babel-types/src/react.js#L9-L55
export function cleanTextNode(value: string): string {
    const lines = value.split(/\r\n|\n|\r/);
    let lastNonEmptyLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/[^ \t]/)) {
            lastNonEmptyLine = i;
        }
    }

    let str = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isFirstLine = i === 0;
        const isLastLine = i === lines.length - 1;
        const isLastNonEmptyLine = i === lastNonEmptyLine;

        let trimmedLine = line.replace(/\t/g, ' ');

        if (!isFirstLine) {
            trimmedLine = trimmedLine.replace(/^[ ]+/, '');
        }

        if (!isLastLine) {
            trimmedLine = trimmedLine.replace(/[ ]+$/, '');
        }

        if (trimmedLine) {
            if (!isLastNonEmptyLine) {
                trimmedLine += ' ';
            }

            str += trimmedLine;
        }
    }

    return str;
}

export function decodeTextContent(source: string): string {
    return he.decode(source);
}
