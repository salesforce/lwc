import { LightningElement, api, track } from 'lwc';

export default class Tree1 extends LightningElement {
    @api treeData;

    @track
    state = {};

    constructor() {
        super();
        this.template.addEventListener('togglerow', this.toggleRow.bind(this));
    }

    get collapsedNodes() {
        const nodes = this.state;
        const collapsedNodes = Object.keys(nodes).filter(node => nodes[node].collapsed);
        return collapsedNodes;
    }

    toggleRow(event) {
        event.preventDefault();
        const id = event.detail.id;

        this.state = {
            ...this.state,
            [id]: { collapsed: !(this.state[id] && this.state[id].collapsed) },
        };
    }

    @api setState() {}
}
