import { LightningElement, api } from 'lwc';

// W-23508928 repro: @api props on a non-exported in-file base; thin exported subclass.
// Without the fix these render as `null` (base contributes nothing to the allowlist).
class Base extends LightningElement {
    @api value;
    @api level;
}

export default class ApiPropInFileSuperclass extends Base {}
