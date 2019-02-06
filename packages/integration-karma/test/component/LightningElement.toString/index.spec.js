import { createElement } from 'test-utils';

import Anonymous from 'x/anonymous';
import Named from 'x/named';

// TODO: #1033 with the transformation done by the compiler, the class name is removed, producing "[object undefined]"
xit('should rely on the constructor name', () => {
    debugger;
    const elm = createElement('x-named', { is: Named });
    expect(elm.getToString()).toBe('[object MyFancyComponent]');
});

// TODO: #1033 open issue return "[object ]" on Safari
xit('should fallback to BaseLightningElement if constructor has no name', () => {
    const elm = createElement('x-anonymous', { is: Anonymous });
    expect(elm.getToString()).toBe('[object BaseLightningElement]');
});
