import { LightningElement } from 'lwc';

export default class ChildRenderedThrowFrozen extends LightningElement {
    renderedCallback() {
        const frozenError = Object.freeze(
            new Error('Child threw frozen error in renderedCallback()')
        );
        throw frozenError;
    }
}
