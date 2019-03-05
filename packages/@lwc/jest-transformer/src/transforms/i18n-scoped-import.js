/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { stringScopedImportTransform } = require('./utils');

const I18N_IMPORT_IDENTIFIER = '@salesforce/i18n/';

module.exports = function({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const importId = path.get('source.value').node;
                if (importId.startsWith(I18N_IMPORT_IDENTIFIER)) {
                    const mockValue = getMockValue(importId);
                    stringScopedImportTransform(t, path, importId, mockValue);
                }
            },
        },
    };
};

function getMockValue(importId) {
    importId = importId.substring(I18N_IMPORT_IDENTIFIER.length);
    const parts = importId.split('.');
    switch (parts[0]) {
        case 'lang':
            return 'en';
        case 'dir':
            return 'ltr';
        case 'locale':
            return 'en-US';
        case 'timeZone':
            return 'America/Los_Angeles';
        case 'currency':
            return 'USD';
        case 'firstDayOfWeek':
            return 0;
        case 'dateTime':
            switch (parts[1]) {
                case 'shortDateFormat':
                    return 'M/d/yyyy';
                case 'mediumDateFormat':
                    return 'MMM d, yyyy';
                case 'longDateFormat':
                    return 'MMMM d, yyyy';
                case 'shortDateTimeFormat':
                    return 'M/d/yyyy h:mm a';
                case 'mediumDateTimeFormat':
                    return 'MMM d, yyyy h:mm:ss a';
                case 'shortTimeFormat':
                    return 'h:mm a';
                case 'mediumTimeFormat':
                    return 'h:mm:ss a';
                default:
                    return undefined;
            }
        case 'number':
            switch (parts[1]) {
                case 'numberFormat':
                    return '#,##0.###';
                case 'percentFormat':
                    return '#,##0%';
                case 'currencyFormat':
                    return '¤#,##0.00;(¤#,##0.00)';
                case 'currencySymbol':
                    return '$';
                default:
                    return undefined;
            }
        default:
            return undefined;
    }
}
