/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ResultMessage } from 'postcss';

export interface ImportMessage extends ResultMessage {
    type: 'import';
    id: string;
}

export interface VarFunctionMessage extends ResultMessage {
    type: 'var-function';
    original: string;
}

const IMPORT_TYPE = 'import';
const VAR_FUNCTION_TYPE = 'var-function';

export function importMessage(id: string): ImportMessage {
    return {
        type: IMPORT_TYPE,
        id,
    };
}

export function isImportMessage(message: any): message is ImportMessage {
    return message.type === IMPORT_TYPE && message.id;
}

export function varFunctionMessage(original: string): VarFunctionMessage {
    return { type: VAR_FUNCTION_TYPE, original };
}

export function isVarFunctionMessage(message: any): message is VarFunctionMessage {
    return message.type === VAR_FUNCTION_TYPE && message.original;
}
