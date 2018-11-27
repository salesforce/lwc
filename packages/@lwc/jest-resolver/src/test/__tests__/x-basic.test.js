import { createElement } from 'lwc';
import Basic from '../x-basic';

describe('x-basic', () => {
    it('loads basic component', () => {
        const element = createElement('x-basic', { is: Basic });
        expect(element).toBe(element);
    });
});
