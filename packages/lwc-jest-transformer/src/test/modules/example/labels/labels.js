import { LightningElement, track } from 'lwc';
import mockedImport from '@salesforce/label/c.mocked';
import unmockedImport from '@salesforce/label/c.unmocked';

export default class Labels extends LightningElement {
    @track
    mockedLabel = mockedImport;

    @track
    unmockedLabel = unmockedImport;
}
