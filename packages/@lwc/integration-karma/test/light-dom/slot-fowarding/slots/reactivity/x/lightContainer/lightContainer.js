import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api
    lightLightUpper = 'upper';
    @api
    lightLightLower = 'lower';
    @api
    lightShadowUpper = 'upper';
    @api
    lightShadowLower = 'lower';
    @api
    shadowLightUpper = 'upper';
    @api
    shadowLightLower = 'lower';
}
