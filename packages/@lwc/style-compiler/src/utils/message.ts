/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Message } from 'postcss';

interface ImportMessage extends Message {
    type: 'import';
    id: string;
}

const PLUGIN_NAME = '@lwc/style-compiler';

const IMPORT_TYPE = 'import';

export function importMessage(id: string): ImportMessage {
    return {
        plugin: PLUGIN_NAME,
        type: IMPORT_TYPE,
        id,
    };
}

export function isImportMessage(message: any): message is ImportMessage {
    return message.type === IMPORT_TYPE && message.id;
}
