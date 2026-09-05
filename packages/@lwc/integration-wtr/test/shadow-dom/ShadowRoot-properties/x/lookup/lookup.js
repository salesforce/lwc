import { LightningElement } from 'lwc';

// Injects markers with unscoped native ids into its own shadow tree, like an analytics/RUM agent
// inserting and later looking up its own nodes. Injected imperatively (not in the template) so
// synthetic-shadow id scoping leaves the ids alone. renderedCallback, not connectedCallback: the
// template isn't rendered yet at connect time, so `this.template.querySelector('div')` is null there.
export default class Lookup extends LightningElement {
    renderedCallback() {
        const host = this.template.querySelector('div');

        // A plain lookup target.
        host.appendChild(marker('injected-marker', 'Injected Marker'));

        // An id that isn't a valid CSS identifier (leading digit, dot): `querySelector('#' + id)`
        // would throw without CSS.escape, but `getElementById` must accept it.
        host.appendChild(marker('2-weird.id', 'Weird Id'));

        // Two elements sharing an id — getElementById must return the first in tree order.
        host.appendChild(marker('dup', 'First'));
        host.appendChild(marker('dup', 'Second'));
    }
}

function marker(id, text) {
    const span = document.createElement('span');
    span.id = id;
    span.textContent = text;
    return span;
}
