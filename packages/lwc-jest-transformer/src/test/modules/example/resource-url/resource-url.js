import { Element } from 'engine';
import mockedImport from '@salesforce/resource-url/c.mocked';
import unmockedImport from '@salesforce/resource-url/c.unmocked';

export default class Labels extends Element {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
