import { createElement } from 'lwc';

import Sample from 'x/sample';
fdescribe('test', () => {
    it('test', () => {});
    const elm = createElement('x-sample', { is: Sample });
    document.body.appendChild(elm);
});
