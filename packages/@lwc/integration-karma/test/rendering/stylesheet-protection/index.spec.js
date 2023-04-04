import { createElement } from 'lwc';
import Basic from 'x/basic';

describe('stylesheet protection', () => {
    it('test', () => {
        const element = createElement('x-basic', { is: Basic });
        document.body.appendChild(element);
    });
});
