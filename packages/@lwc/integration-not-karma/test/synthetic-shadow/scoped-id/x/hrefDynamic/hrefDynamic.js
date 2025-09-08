import { LightningElement } from 'lwc';

export default class HrefDynamic extends LightningElement {
    get attrValue() {
        return 'sanjo';
    }
    get fragmentUrl() {
        return '#sanjo';
    }
    get relativeUrl() {
        return '/shijo#kawaramachi';
    }
    get absoluteUrl() {
        return 'https://www.salesforce.com/jp/';
    }
}
