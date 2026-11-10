import { LightningElement } from 'lwc';

// Hosts a child x-lookup so we can assert that getElementById scopes to the shadow tree: the
// child's injected marker is owned by the child and must not leak into the parent's lookup.
export default class Nested extends LightningElement {}
