import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/resource-url/c.mocked';
import unmockedImport from '@salesforce/resource-url/c.unmocked';

export default class ResourceUrl extends LightningElement {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
