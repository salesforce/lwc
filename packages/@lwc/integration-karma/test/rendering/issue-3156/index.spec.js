import { createElement } from 'lwc';
import Test from 'x/test';

describe('issue-3156', () => {
    it('throws a useful error when the engine attempts to evaluate an invalid function as a stylesheet', () => {
        const element = createElement('x-test', { is: Test });
        expect(() => {
            document.body.appendChild(element);
        }).toThrowError(TypeError, 'Unexpected LWC stylesheet content.');
    });
});
