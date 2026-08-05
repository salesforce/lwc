import { LightningElement } from 'lwc';

// Injects a marker node with an unscoped native id into its own shadow tree, mirroring how an
// analytics/RUM agent inserts and later looks up its own node. The id is set imperatively (not in
// the template), so synthetic-shadow id scoping doesn't rewrite it — the DOM id is exactly what we
// search for.
export default class Lookup extends LightningElement {
    renderedCallback() {
        const host = this.template.querySelector('div');
        if (host && !host.querySelector('#injected-marker')) {
            const marker = document.createElement('span');
            marker.id = 'injected-marker';
            marker.textContent = 'Injected Marker';
            host.appendChild(marker);
        }
    }
}
