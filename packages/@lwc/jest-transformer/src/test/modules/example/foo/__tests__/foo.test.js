/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import Foo from 'example/foo';
import Bar from 'other/bar';

jest.mock('globalLib', () => {
    return {
        func: () => 'from foo.test.js',
    };
});

describe('example-foo', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should render correct snapshot', () => {
        const element = createElement('example-foo', { is: Foo });
        document.body.appendChild(element);
        expect(element).toMatchSnapshot();
    });

    it('3renders foo-inner DOM', () => {
        const element = createElement('example-foo', { is: Foo });
        document.body.appendChild(element);
        const classes = element.shadowRoot
            .querySelector('example-foo-inner')
            .shadowRoot.querySelectorAll('.exampleFooInner');
        expect(classes).toHaveLength(1);
    });

    it('renders component from another namespace (other-bar)', () => {
        const element = createElement('example-foo', { is: Foo });
        document.body.appendChild(element);
        const classes = element.shadowRoot
            .querySelector('other-bar')
            .shadowRoot.querySelectorAll('.otherBar');
        expect(classes).toHaveLength(1);
    });

    it('can import component from another namespace', () => {
        const element = createElement('other-bar', { is: Bar });
        document.body.appendChild(element);
        const classes = element.shadowRoot.querySelectorAll('.otherBar');
        expect(classes).toHaveLength(1);
    });

    it('contains default property <me>', () => {
        const element = createElement('example-foo', { is: Foo });
        expect(element.me).toBe('foo');
    });

    it('can use async syntax', () => {
        const expected = { foo: 'bar' };
        const element = createElement('example-foo', { is: Foo });

        return element.asyncMethod(expected).then(ret => expect(ret).toBe(expected));
    });

    it('returns value on inner element from mock defined in test file', () => {
        const element = createElement('example-foo', { is: Foo });
        document.body.appendChild(element);
        const inner = element.shadowRoot.querySelector('example-foo-inner');
        expect(inner.globalLibReturn).toBe('from foo.test.js');
    });
});
