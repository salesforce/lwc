// Decorators can only be used on a component, so we check they work here
import { LightningElement, api, wire, track } from 'lwc';
import WireAdapter from '../../../wire-adapter';

// Everything else can be imported in a helper, so we mush check in the helper
import '../../../imports';

export default class extends LightningElement {
  // LWC compiler doesn't let us console.log decorators
  @api api;
  @track track = [];
  @wire(WireAdapter) wire;
}
