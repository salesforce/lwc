/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { esTemplateWithYield } from '../estemplate';
import type { IfStatement as EsIfStatement } from 'estree';

export const bYieldTextContent = esTemplateWithYield`
    if (didBufferTextContent) {
        // We are at the end of a series of text nodes - flush to a concatenated string
        // We only render the ZWJ if there were actually any dynamic text nodes rendered
        // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
        // the CSR'd text content.
        yield textContentBuffer === '' ? '\u200D' : htmlEscape(textContentBuffer);
        // Reset
        textContentBuffer = '';
        didBufferTextContent = false;
    }
`<EsIfStatement>;
