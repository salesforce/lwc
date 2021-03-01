import { createElement } from 'lwc';
import Container from 'x/container';

describe('Moving elements from inside lwc:dom=manual', () => {
    it('should return correct parentNode', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
    });
});
