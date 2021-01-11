import { LightningElement, wire } from 'lwc';

import { adapter } from 'x/adapter';

describe('restrictions', () => {
    it('throws a property error when a wired field conflicts with a method', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @wire(adapter) showFeatures;
                showFeatures() {}
            }
        }).toThrowError(
            'Invalid @wire showFeatures field. Found a duplicate method with the same name.'
        );
    });
});
