import { createElement } from 'lwc';
import ComponentTagName from 'example-component-tag-name';

jest.mock('@salesforce/componentTagName/c-mocked', () => {
    return { default: "value set in test" };
}, { virtual: true });

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('example-component-tag-name', () => {
    it.only('default snapshot', () => {
        const element = createElement('example-component-tag-name', { is: ComponentTagName });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('returns default component tag name as import path', () => {
        const element = createElement('example-component-tag-name', { is: ComponentTagName });
        document.body.appendChild(element);
        const componentTagName = element.querySelector(".unmockedTag").textContent;
        expect(componentTagName).toBe("c-unmocked");
    });

    it('returns value from mock defined in test file', () => {
        const element = createElement('example-component-tag-name', { is: ComponentTagName });
        document.body.appendChild(element);
        const componentTagName = element.querySelector(".mockedTag").textContent;
        expect(componentTagName).toBe("value set in test");
    });
});
