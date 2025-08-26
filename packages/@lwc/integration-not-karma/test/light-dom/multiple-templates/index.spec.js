import { createElement } from 'lwc';

import Multi from 'x/multi';
import MultiNoStyleInFirst from 'x/multiNoStyleInFirst';

describe('multiple templates', () => {
    it('can render multiple templates with different styles', () => {
        const element = createElement('x-multi', { is: Multi });

        document.body.appendChild(element);

        expect(element.querySelector('div').textContent).toEqual('a');
        expect(getComputedStyle(element.querySelector('div')).color).toEqual('rgb(233, 150, 122)');
        expect(getComputedStyle(element.querySelector('div')).marginLeft).toEqual('0px');
        element.querySelector('div').setAttribute('foo', '');
        element.next();
        return Promise.resolve().then(() => {
            expect(element.querySelector('div').textContent).toEqual('b');
            expect(getComputedStyle(element.querySelector('div')).color).toEqual(
                'rgb(233, 150, 122)'
            );
            expect(getComputedStyle(element.querySelector('div')).marginLeft).toEqual('10px');
            // element should not be dirty after template change
            expect(element.querySelector('div').hasAttribute('foo')).toEqual(false);
        });
    });

    it('works when first template has no scoped style but second template does', () => {
        const element = createElement('x-multi-no-style-in-first', { is: MultiNoStyleInFirst });
        document.body.appendChild(element);
        return Promise.resolve()
            .then(() => {
                expect(getComputedStyle(element.querySelector('.red')).color).toEqual(
                    'rgb(0, 0, 0)'
                );
                expect(getComputedStyle(element).marginLeft).toEqual('0px');
                element.next();
            })
            .then(() => {
                expect(getComputedStyle(element.querySelector('.red')).color).toEqual(
                    'rgb(255, 0, 0)'
                );
                expect(getComputedStyle(element).marginLeft).toEqual('5px');
                element.next();
            })
            .then(() => {
                expect(getComputedStyle(element.querySelector('.red')).color).toEqual(
                    'rgb(0, 0, 0)'
                );
                expect(getComputedStyle(element).marginLeft).toEqual('0px');
                element.next();
            })
            .then(() => {
                expect(getComputedStyle(element.querySelector('.red')).color).toEqual(
                    'rgb(255, 0, 0)'
                );
                expect(getComputedStyle(element).marginLeft).toEqual('5px');
            });
    });
});
