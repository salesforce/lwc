import { createElement } from 'lwc';
import Labels from 'example/labels';

jest.mock('@salesforce/label/c.mocked', () => {
    return { default: "value set in test" };
}, { virtual: true });

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('example-labels', () => {
    it('default snapshot', () => {
        const element = createElement('example-labels', { is: Labels });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('returns default label value as import path', () => {
        const element = createElement('example-labels', { is: Labels });
        document.body.appendChild(element);
        const label = document.body.querySelector(".unmockedLabel").textContent;
        expect(label).toBe("c.unmocked");
    });

    it('returns value from mock defined in test file', () => {
        const element = createElement('example-labels', { is: Labels });
        document.body.appendChild(element);
        const label = document.body.querySelector(".mockedLabel").textContent;
        expect(label).toBe("value set in test");
    });
});
