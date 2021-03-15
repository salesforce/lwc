import { createElement } from 'lwc';
import Container from 'x/container';
import Test from 'x/test';

describe('Macro test', () => {
    it('simple', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
    });

    fit('complex', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
    });
});
