import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/resourceUrl/c.mocked';
import unmockedImport from '@salesforce/resourceUrl/c.unmocked';

export default class ResourceUrl extends LightningElement {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
