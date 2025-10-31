import { createElement } from 'lwc';

import Anonymous from 'c/anonymous';
import Named from 'c/named';

it('should rely on the constructor name', () => {
    const elm = createElement('c-named', { is: Named });
    expect(elm.getToString()).toBe('[object MyFancyComponent]');
});

it('should fallback to LightningElement if constructor has no name', () => {
    const elm = createElement('c-anonymous', { is: Anonymous });
    expect(elm.getToString()).toBe('[object LightningElement]');
});
