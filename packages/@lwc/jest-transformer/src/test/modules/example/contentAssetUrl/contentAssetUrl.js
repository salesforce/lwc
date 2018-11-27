import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/contentAssetUrl/mocked';
import unmockedImport from '@salesforce/contentAssetUrl/unmocked';

export default class ContentAssetUrl extends LightningElement {
    mockedAsset = mockedImport;
    unmockedAsset = unmockedImport;
}
