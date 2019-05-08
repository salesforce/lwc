/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * JEST doesn't support Web Components APIs, instead we need to
 * polyfill it with out synthetic shadow.
 **/

require('@lwc/synthetic-shadow');
