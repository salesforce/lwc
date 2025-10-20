import { LightningElement, track } from 'lwc';

export default class extends LightningElement {
    @track
    _relatedTargetClassNames = [];

    get relatedTargetClassNames() {
        return this._relatedTargetClassNames
            .map((className) => className || 'undefined')
            .join(', ');
    }

    handleMouseOver(event) {
        this._relatedTargetClassNames.push(event.relatedTarget && event.relatedTarget.className);
    }
}
