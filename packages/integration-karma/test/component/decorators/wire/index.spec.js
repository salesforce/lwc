import { LightningElement, wire } from 'lwc';

import { adapter } from 'x/adapter';

describe('restrictions', () => {
    it('throws a property error when a wired field conflicts with a method', () => {
        expect(() => {
            // The following class is wrapper by the compiler with registerDecorators. We check here
            // if the fields are validated properly.
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
