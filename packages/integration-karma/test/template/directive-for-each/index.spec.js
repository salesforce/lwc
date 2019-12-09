import { createElement } from 'lwc';
import XTest from 'x/test';
import ArrayNullPrototype from 'x/arrayNullPrototype';

function testForEach(type, obj) {
    it(`should render ${type}`, () => {
        const elm = createElement('x-test', { is: XTest });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('ul').childElementCount).toBe(0);
        elm.items = obj;

        return Promise.resolve()
            .then(() => {
                const ul = elm.shadowRoot.querySelector('ul');
                expect(ul.childElementCount).toBe(3);
                expect(ul.children[0].textContent).toBe('one');
                expect(ul.children[1].textContent).toBe('two');
                expect(ul.children[2].textContent).toBe('three');

                elm.items = [];
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('ul').childElementCount).toBe(0);
            });
    });
}

testForEach('Array', [
    { key: 1, value: 'one' },
    { key: 2, value: 'two' },
    { key: 3, value: 'three' },
]);

function* itemGenerator() {
    yield { key: 1, value: 'one' };
    yield { key: 2, value: 'two' };
    yield { key: 3, value: 'three' };
}
testForEach('Generator', { [Symbol.iterator]: itemGenerator });

function iterator() {
    let index = 0;
    const items = ['one', 'two', 'three'];

    return {
        next() {
            index++;

            return index > 3
                ? { done: true }
                : {
                      value: { key: index, value: items[index - 1] },
                      done: false,
                  };
        },
    };
}
testForEach('Iterator', { [Symbol.iterator]: iterator });

// TODO [#1285]: revisit
xit('should throw an error when the passing a non iterable', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.items = {};

    // TODO [#1283]: Improve this error message. The vm should not be exposed and the message is not helpful.
    expect(() => document.body.appendChild(elm)).toThrowError(
        /Invalid template iteration for value `\[object Object\]` in \[object:vm undefined \(\d+\)\]. It must be an array-like object and not `null` nor `undefined`./
    );
});

it('should render an array of objects with null prototype', () => {
    const elm = createElement('x-array-null-prototype', { is: ArrayNullPrototype });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('span').textContent).toBe('text');
});
