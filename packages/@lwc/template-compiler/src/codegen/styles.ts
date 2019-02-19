/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babylon from '@babel/parser';
import * as styleCompiler from '@lwc/style-compiler';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';
import { Config as StylesheetConfig } from '@lwc/style-compiler/dist/types/index';
import { Statement } from '@babel/types';

export default function parseInlineStyles(
    src: string,
    stylesheetConfig: StylesheetConfig,
): Statement[] {
    let result;
    try {
        result = styleCompiler.transform(src, 'template_inline_styles', stylesheetConfig);
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.CSS_IN_HTML_ERROR, e);
    }
    // The style compiler produces a module string
    const { code } = result;
    // Convert it to an AST
    const parsed = babylon.parse(code, { sourceType: 'module' });

    // Return the body of the module
    return parsed.program.body;
}
