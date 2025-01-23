/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptors } from '@lwc/shared/language';

// Like @lwc/shared, but for DOM APIs

export const ElementDescriptors = getOwnPropertyDescriptors(Element.prototype);

export const ElementAttachShadow = ElementDescriptors.attachShadow.value!;
export const ElementShadowRootGetter = ElementDescriptors.shadowRoot.get!;
