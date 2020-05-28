import { BaseLightningElement as LightningElement } from '../../../src';

describe('CustomElementConstructor getter', () => {
    it('should have the default behavior of throwing an error', () => {
        expect(() => {
            class Test extends LightningElement {}
            Test.CustomElementConstructor;
        }).toThrowError();
    });
});
