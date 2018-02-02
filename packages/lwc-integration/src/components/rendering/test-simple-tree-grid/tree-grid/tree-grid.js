import { Element, api, track } from 'engine';

export default class Tree1 extends Element {
    @api treeData;

    @track
    state = {};

    constructor() {
        super();
        this.addEventListener('togglerow', this.toggleRow.bind(this));
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
            [id]: { collapsed: !(this.state[id] && this.state[id].collapsed) }
        };
    }

    @api setState(state) {

    }
}
