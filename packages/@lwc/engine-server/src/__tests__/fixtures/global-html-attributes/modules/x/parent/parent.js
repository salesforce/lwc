import { LightningElement } from 'lwc';

export default class extends LightningElement {
  supported = {
    accesskey: "supported",
    arialabel: "supported",
    class: "supported",
    dir: "supported",
    draggable: "supported",
    hidden: "supported",
    id: "supported",
    lang: "supported",
    role: "supported",
    spellcheck: "supported",
    tabindex: "supported",
    title: "supported",
  };

  unsupported = {
    autocapitalize: "unsupported",
    autofocus: "unsupported",
    contenteditable: "unsupported",
    enterkeyhint: "unsupported",
    inert: "unsupported",
    inputmode: "unsupported",
    nonce: "unsupported",
    popover: "unsupported",
    slot: "unsupported",
    translate: "unsupported",
    writingsuggestions: "unsupported",
  };

  noreflect = {
    exportparts: "does-not-reflect",
    itemid: "does-not-reflect",
    itemprop: "does-not-reflect",
    itemref: "does-not-reflect",
    itemscope: "does-not-reflect",
    itemtype: "does-not-reflect",
    part: "does-not-reflect",
  };
}
