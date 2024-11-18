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
    exportparts: "unsupported",
    inert: "unsupported",
    inputmode: "unsupported",
    is: "unsupported",
    itemid: "unsupported",
    itemprop: "unsupported",
    itemref: "unsupported",
    itemscope: "unsupported",
    itemtype: "unsupported",
    nonce: "unsupported",
    part: "unsupported",
    popover: "unsupported",
    slot: "unsupported",
    translate: "unsupported",
    writingsuggestions: "unsupported",
  };
}
