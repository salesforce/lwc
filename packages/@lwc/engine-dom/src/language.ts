/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Like @lwc/shared, but for DOM APIs

export const ElementDescriptors = Object.getOwnPropertyDescriptors(Element.prototype);

export const ElementAttachShadow = ElementDescriptors.attachShadow.value!;
export const ElementShadowRootGetter = ElementDescriptors.shadowRoot.get!;
