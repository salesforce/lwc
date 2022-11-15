/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

export default function detect(): boolean {
    // Note: when using this in mobile apps, we might have a DOM that does not support iframes.
    const hasIframe = typeof HTMLIFrameElement !== 'undefined';

    // Detect IE, via https://stackoverflow.com/a/9851769
    const isIE11 = !isUndefined((document as any).documentMode);

    return hasIframe && isIE11;
}
