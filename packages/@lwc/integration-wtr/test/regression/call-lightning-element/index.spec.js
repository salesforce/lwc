import { createElement } from 'lwc';
import Component from 'x/cmp';

// See W-23887203
it('calling LightningElement does not work', () => {
    expect(() => createElement('x-cmp', { is: Component })).toThrow(
        'LightningElement must be constructed.'
    );
});
