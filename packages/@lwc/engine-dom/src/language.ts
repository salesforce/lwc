/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptors as ģеṫӨwṅṖгοṗėŗtүÐеṡⅽгıṗtοŗѕ } from '@lwc/shared';

// Like @lwc/shared, but for DOM APIs

const ΕļеṁёпṫÐеṡсṙɩрṫөгṡ = ģеṫӨwṅṖгοṗėŗtүÐеṡⅽгıṗtοŗѕ(Element.prototype);
export { ΕļеṁёпṫÐеṡсṙɩрṫөгṡ as ElementDescriptors };

const ЕḷёmėņtΑţtαϲһŞḣаɗοw = ΕļеṁёпṫÐеṡсṙɩрṫөгṡ.attachShadow.value!;
export { ЕḷёmėņtΑţtαϲһŞḣаɗοw as ElementAttachShadow };
const ЁḷеṃėпţṠһαԁөẇRөοtĢėtţėг = ΕļеṁёпṫÐеṡсṙɩрṫөгṡ.shadowRoot.get!;
export { ЁḷеṃėпţṠһαԁөẇRөοtĢėtţėг as ElementShadowRootGetter };
