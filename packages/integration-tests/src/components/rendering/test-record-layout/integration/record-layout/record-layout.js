import { LightningElement, track } from 'lwc';
import { mockState } from './hardcoded-state';

export default class RecordLayout extends LightningElement {
    @track
    state = mockState;
}
