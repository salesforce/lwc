import { LightningElement } from 'lwc';

// A component without the dynamicProps opt-in. Setting undeclared props
// on this component should still produce the "Unknown public property"
// warning.
export default class PlainChild extends LightningElement {}
