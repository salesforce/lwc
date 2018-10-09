import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/resourceUrl/mocked';
import unmockedImport from '@salesforce/resourceUrl/unmocked';

export default class ResourceUrl extends LightningElement {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
