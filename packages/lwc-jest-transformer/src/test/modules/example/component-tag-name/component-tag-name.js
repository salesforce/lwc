import { LightningElement, track } from 'lwc';
import mockedImport from '@salesforce/componentTagName/c-mocked';
import unmockedImport from '@salesforce/componentTagName/c-unmocked';

export default class componentTagName extends LightningElement {
    @track
    mockedTag = mockedImport;

    @track
    unmockedTag = unmockedImport;
}
