import { Element } from 'engine';
import mockedImport from '@resource-url/c.mocked';
import unmockedImport from '@resource-url/c.unmocked';

export default class Labels extends Element {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
