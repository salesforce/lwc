import { unwrap, readonly } from 'lwc';
import { createElement } from 'lwc';

import Wrap from 'x/wrap';

function testUnwrapIdentity(type, obj) {
    it(`should return the same object if it not wrapped: ${type}`, () => {
        expect(unwrap(obj)).toBe(obj);
    });
}

testUnwrapIdentity('null', null);
testUnwrapIdentity('undefined', undefined);
testUnwrapIdentity('String', 'foo');
testUnwrapIdentity('Number', 1);
testUnwrapIdentity('Boolean', true);
testUnwrapIdentity('Object', { foo: true });
testUnwrapIdentity('Array', [1, 2]);
testUnwrapIdentity('Symbol', Symbol('foo'));
testUnwrapIdentity('Set', new Set('value'));
testUnwrapIdentity('Map', new Map([['key', 'value']]));

it('unwraps api objects', () => {
    const obj = { foo: true };

    const elm = createElement('x-wrap', { is: Wrap });
    elm.apiWrap = obj;

    const wrapObj = elm.getApiWrap();

    expect(wrapObj).not.toBe(obj);
    expect(unwrap(wrapObj)).toBe(obj);
});

it('unwraps track objects', () => {
    const obj = { foo: true };

    const elm = createElement('x-wrap', { is: Wrap });

    const wrapObj = elm.getTrackWrap(obj);

    expect(wrapObj).not.toBe(obj);
    expect(unwrap(wrapObj)).toBe(obj);
});

it('unwraps readonly objects', () => {
    const obj = { foo: true };
    const wrapObj = readonly(obj);

    expect(unwrap(wrapObj)).toBe(obj);
});
