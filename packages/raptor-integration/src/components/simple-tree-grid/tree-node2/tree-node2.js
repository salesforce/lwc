import { Element } from 'engine';

export default class Tree2 extends Element {
    @api data;
    @api collapsedNodes = [];
    @track
    counter = 0;

    get hasChildren() {
        return this.data.children && !!this.data.children.length;
    }

    get isNodeCollapsed() {
        return this.collapsedNodes.includes(this.data.id);
    }

    get hasChildrenAndIsNotCollapsed() {
        return this.hasChildren && !this.isNodeCollapsed;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('togglerow', {
            composed: true,
            bubbles: true,
            detail: { id: this.data.id }
        }));
    }

    handleRefresh() {
        this.counter++;
    }
}
