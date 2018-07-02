import { Element, track } from 'engine';
import mockedImport from '@salesforce/label/c.mocked';
import unmockedImport from '@salesforce/label/c.unmocked';

export default class Labels extends Element {
    @track
    mockedLabel = mockedImport;

    @track
    unmockedLabel = unmockedImport;
}
