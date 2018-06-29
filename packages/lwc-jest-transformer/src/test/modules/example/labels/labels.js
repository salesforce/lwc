import { Element, track } from 'engine';
import mockedImport from '@label/c.mocked';
import unmockedImport from '@label/c.unmocked';

export default class Labels extends Element {
    @track
    mockedLabel = mockedImport;

    @track
    unmockedLabel = unmockedImport;
}
