import { createElement } from 'engine';
import FooInner from 'example-foo-inner';

jest.mock('globalLib', () => {
    return {
        func: () => "from test"
    };
});

describe('example-foo-inner', () => {
    it('default snapshot', () => {
        const element = createElement('example-foo-inner', { is: FooInner });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('returns value from mock defined in test file', () => {
        const element = createElement('example-foo-inner', { is: FooInner });
        expect(element.globalLibReturn).toBe("from test");
    });
});
