import { LightningElement, api, track } from 'lwc';

export default class Tree2 extends LightningElement {
    @api treeData;
    @api collapsedNodes = [];
    @track
    counter = 0;

    get hasChildren() {
        return this.treeData.children && !!this.treeData.children.length;
    }

    get isNodeCollapsed() {
        return this.collapsedNodes.includes(this.treeData.id);
    }

    get hasChildrenAndIsNotCollapsed() {
        return this.hasChildren && !this.isNodeCollapsed;
    }

    handleClick() {
        this.dispatchEvent(
            new CustomEvent('togglerow', {
                composed: true,
                bubbles: true,
                detail: { id: this.treeData.id },
            })
        );
    }

    handleRefresh() {
        this.counter++;
    }
}
