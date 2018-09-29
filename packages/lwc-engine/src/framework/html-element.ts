// TODO: Legacy File that should be removed
//       It is used only from the tests. The content of it
//       was split into base-bridge-element and base-lightning-element

import { getCustomElementVM } from "./vm";

export function getHostShadowRoot(elm: HTMLElement): ShadowRoot | null {
    const vm = getCustomElementVM(elm);
    return vm.mode === 'open' ? vm.cmpRoot : null;
}

export { BaseLightningElement as LightningElement } from "./base-lightning-element";
