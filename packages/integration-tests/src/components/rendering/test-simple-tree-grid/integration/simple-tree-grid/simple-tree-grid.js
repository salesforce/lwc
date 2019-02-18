import { LightningElement, track } from 'lwc';
import data from './hardcoded-data';

export default class TreeContainer extends LightningElement {
    @track
    myData = data;

    toggleAll() {}
}
