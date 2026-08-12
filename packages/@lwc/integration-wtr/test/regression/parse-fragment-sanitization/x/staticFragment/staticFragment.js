import { LightningElement } from 'lwc';

// A purely static template (no dynamic bindings) compiles to a `parseFragment` / `$api.st`
// call, which drives the static-content optimization under test (W-23814957).
export default class StaticFragment extends LightningElement {}
