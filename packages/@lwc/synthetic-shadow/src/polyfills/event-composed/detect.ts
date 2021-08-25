/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Event } from '../../env/global';

export default function detect(): boolean {
    return new Event('test', { composed: true }).composed !== true;
}
