import { LightningElement, track } from 'lwc';

export default class BoundaryAltViewThrow extends LightningElement {
    @track state = { error: false, title: 'initial' };
}
