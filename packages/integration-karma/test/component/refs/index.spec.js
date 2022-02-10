import { createElement } from 'lwc';

import Basic from 'x/basic';
import None from 'x/none';
import Multi from 'x/multi';
import Overwrite from 'x/overwrite';
import Conflict from 'x/conflict';
import Parent from 'x/parent';
import Light from 'x/light';
import Dynamic from 'x/dynamic';
import Conditional from 'x/conditional';

describe('refs', () => {
    it('basic refs example', () => {
        const elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);

        expect(elm.getRefTextContent('first')).toEqual('first');
        expect(elm.getRefTextContent('second')).toEqual('second');
        expect(elm.getRefTextContent('inner')).toEqual('inner');
        expect(elm.getRefTextContent('deepInner')).toEqual('deepInner');
    });

    it('refs object shape', () => {
        const elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs).sort()).toEqual(['deepInner', 'first', 'inner', 'second']);

        expect(() => {
            refs.hahaha = 'yolo';
        }).toThrowError(TypeError);
    });

    it('no refs', () => {
        const elm = createElement('x-none', { is: None });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs)).toEqual([]);

        expect(() => {
            refs.hahaha = 'yolo';
        }).toThrowError(TypeError);
    });

    it('multi templates', () => {
        const elm = createElement('x-multi', { is: Multi });

        document.body.appendChild(elm);

        expect(elm.getRef('a').textContent).toEqual('a');
        expect(elm.getRef('shared').textContent).toEqual('a-shared');
        expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
        expect(elm.getRef('b')).toBeUndefined();

        elm.next();
        return Promise.resolve()
            .then(() => {
                expect(elm.getRef('b').textContent).toEqual('b');
                expect(elm.getRef('shared').textContent).toEqual('b-shared');
                expect(elm.getRef('deepShared').textContent).toEqual('b-deepShared');
                expect(elm.getRef('a')).toBeUndefined();
                elm.next();
            })
            .then(() => {
                expect(elm.getRef('a').textContent).toEqual('a');
                expect(elm.getRef('shared').textContent).toEqual('a-shared');
                expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
                expect(elm.getRef('b')).toBeUndefined();
            });
    });

    it('can overwrite refs', () => {
        const elm = createElement('x-overwrite', { is: Overwrite });

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('h1').textContent).toEqual('yolo');
    });

    it('refs not accessible externally', () => {
        const elm = createElement('x-basic', { is: Basic });

        document.body.appendChild(elm);

        expect(elm.refs).toEqual(undefined);
    });

    it('conflict between elements with same ref', () => {
        const elm = createElement('x-conflict', { is: Conflict });

        document.body.appendChild(elm);

        expect(elm.getRefTextContent('foo')).toEqual('march');
        expect(elm.getRefTextContent('bar')).toEqual('april');
        expect(elm.getRefTextContent('baz')).toEqual('july');
        expect(elm.getRefTextContent('quux')).toEqual('september');
    });

    it('ref on a component', () => {
        const elm = createElement('x-parent', { is: Parent });

        document.body.appendChild(elm);

        const child = elm.getRef('child');
        expect(child.tagName.toLowerCase()).toEqual('x-child');
        expect(child.shadowRoot.querySelector('h1').textContent).toEqual('child');
    });

    it('light dom', () => {
        const elm = createElement('x-light', { is: Light });
        document.body.appendChild(elm);

        expect(elm.getRefTextContent('foo')).toEqual('foo');
    });

    it('ref on a dynamic component', () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        const dynamic = elm.getRef('dynamic');
        expect(dynamic.tagName.toLowerCase()).toEqual('x-dynamic-cmp');
        expect(dynamic.getRefTextContent('first')).toEqual('first');
    });

    it('ref with conditional', () => {
        const elm = createElement('x-conditional', { is: Conditional });
        document.body.appendChild(elm);

        expect(elm.getRef('coinflip').textContent).toEqual('tails');
        expect(elm.getRef('onlyHeads')).toBeUndefined();
        expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
        expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
        elm.next();
        return Promise.resolve()
            .then(() => {
                expect(elm.getRef('coinflip').textContent).toEqual('heads');
                expect(elm.getRef('onlyTails')).toBeUndefined();
                expect(elm.getRef('onlyHeads').textContent).toEqual('only heads');
                expect(elm.getRefNames()).toEqual(['coinflip', 'onlyHeads']);
                elm.next();
            })
            .then(() => {
                expect(elm.getRef('coinflip').textContent).toEqual('tails');
                expect(elm.getRef('onlyHeads')).toBeUndefined();
                expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
                expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
            });
    });
});
