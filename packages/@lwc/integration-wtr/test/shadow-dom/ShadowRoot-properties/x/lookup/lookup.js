import { LightningElement } from 'lwc';

// Injects a marker with an unscoped native id into its own shadow tree, like an analytics/RUM agent
// inserting and later looking up its own node. Injected imperatively (not in the template) so
// synthetic-shadow id scoping leaves the id alone. renderedCallback, not connectedCallback: the
// template isn't rendered yet at connect time, so `this.template.querySelector('div')` is null there.
export default class Lookup extends LightningElement {
    renderedCallback() {
        const host = this.template.querySelector('div');
        const marker = document.createElement('span');
        marker.id = 'injected-marker';
        marker.textContent = 'Injected Marker';
        host.appendChild(marker);
    }
}
