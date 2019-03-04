/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, track, api } from 'lwc';
import lang from '@salesforce/i18n/lang';
import dir from '@salesforce/i18n/dir';
import locale from '@salesforce/i18n/locale';
import timeZone from '@salesforce/i18n/timeZone';
import currency from '@salesforce/i18n/currency';
import firstDayOfWeek from '@salesforce/i18n/firstDayOfWeek';
import shortDateFormat from '@salesforce/i18n/dateTime.shortDateFormat';
import mediumDateFormat from '@salesforce/i18n/dateTime.mediumDateFormat';
import longDateFormat from '@salesforce/i18n/dateTime.longDateFormat';
import shortDateTimeFormat from '@salesforce/i18n/dateTime.shortDateTimeFormat';
import mediumDateTimeFormat from '@salesforce/i18n/dateTime.mediumDateTimeFormat';
import shortTimeFormat from '@salesforce/i18n/dateTime.shortTimeFormat';
import mediumTimeFormat from '@salesforce/i18n/dateTime.mediumTimeFormat';
import numberFormat from '@salesforce/i18n/number.numberFormat';
import percentFormat from '@salesforce/i18n/number.percentFormat';
import currencyFormat from '@salesforce/i18n/number.currencyFormat';
import currencySymbol from '@salesforce/i18n/number.currencySymbol';

export default class I18n extends LightningElement {
    @track
    defaultLang = lang;

    @track
    mockDir = dir;

    @track
    defaultDateFormat = shortDateFormat;

    @api getI18nValues() {
        return {
            lang,
            dir,
            locale,
            timeZone,
            currency,
            firstDayOfWeek,
            shortDateFormat,
            mediumDateFormat,
            longDateFormat,
            shortDateTimeFormat,
            mediumDateTimeFormat,
            shortTimeFormat,
            mediumTimeFormat,
            numberFormat,
            percentFormat,
            currencyFormat,
            currencySymbol,
        };
    }
}
