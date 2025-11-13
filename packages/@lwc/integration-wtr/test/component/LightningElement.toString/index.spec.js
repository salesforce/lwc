import { createElement } from 'lwc';

import Anonymous from 'x/anonymous';
import Named from 'x/named';

it('should rely on the constructor name', () => {
    const elm = createElement('x-named', { is: Named });
    expect(elm.getToString()).toBe('[object MyFancyComponent]');
});

it('should fallback to LightningElement if constructor has no name', () => {
    const elm = createElement('x-anonymous', { is: Anonymous });
    expect(elm.getToString()).toBe('[object LightningElement]');
});
