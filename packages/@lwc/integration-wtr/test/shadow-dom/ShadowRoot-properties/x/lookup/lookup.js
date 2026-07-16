import { LightningElement } from 'lwc';

// A component that injects a plain element carrying an *unscoped* native id into its own shadow
// tree — mirroring how a third-party script (e.g. an analytics/RUM agent) inserts its own marker
// node and later looks it up by that id relative to the node's root (`node.getRootNode()`).
// The id is set imperatively via `lwc:dom="manual"`, so LWC's synthetic-shadow id scoping (which
// rewrites *template-static* ids to `id-<idx>`) does not apply — the id in the DOM is exactly the
// one we search for.
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
