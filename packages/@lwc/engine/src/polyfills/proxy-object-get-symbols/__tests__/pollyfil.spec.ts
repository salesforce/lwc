import applyPolyfill from '../polyfill';
import { ViewModelReflection } from '../../../framework/utils'
applyPolyfill();

const { defineProperty, getOwnPropertySymbols} = Object;
const { ownKeys } = Reflect;
describe('Internal fields are filtered out', () => {
    let obj;
    let secret;
    beforeEach(() => {
        obj = {};
        secret = {};
        defineProperty(obj, ViewModelReflection, { value: secret})
    });
    it('ViewModel field on object is not discoverable via Object.getOwnPropertySymbols', () => {
        expect(getOwnPropertySymbols(obj)).not.toContain(ViewModelReflection);
    })
    it('ViewModel field on object is not discoverable via Reflect.ownKeys', () => {
        expect(ownKeys(obj)).not.toContain(ViewModelReflection);
    })
});

describe('User defined symbols are not filtered out', () => {
    let obj;
    let value;
    const UserDefinedSym = Symbol('Foo');
    beforeEach(() => {
        obj = {};
        value = {};
        defineProperty(obj, UserDefinedSym, { value})
    });
    it('User defined field on object should be discoverable via Object.getOwnPropertySymbols', () => {
        expect(getOwnPropertySymbols(obj)).toContain(UserDefinedSym);
    })
    it('User defined field on object should be discoverable via Reflect.ownKeys', () => {
        expect(ownKeys(obj)).toContain(UserDefinedSym);
    })
    it('Empty objects are handled by patched methods', () => {
        const emptyObj = {};
        expect(getOwnPropertySymbols(emptyObj)).toEqual([]);
        expect(ownKeys(emptyObj)).toEqual([]);
    })
})
