import { createElement } from 'lwc';
import { installCustomContext, getValueForIdentity } from 'c/advancedProvider';
import Consumer from 'c/advancedConsumer';
import { setValueForIdentity } from './c/advancedProvider/advancedProvider';

describe('Advanced Custom Context Provider', () => {
    it('should be install-able on any dom element', function () {
        const div = document.createElement('div');
        const elm = createElement('c-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        div.appendChild(elm);
        expect(typeof elm.getIdentity()).toBe('function');
        expect(getValueForIdentity(elm.getIdentity())).toBe(undefined);
    });
    it('should provide identity as null when missing provider', function () {
        const div = document.createElement('div');
        const elm = createElement('c-consumer', { is: Consumer });
        document.body.appendChild(div);
        div.appendChild(elm);
        expect(elm.getIdentity()).toBe(null);
    });
    it('should allow setting value associated to identity', function () {
        const div = document.createElement('div');
        const elm = createElement('c-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        div.appendChild(elm);
        expect(elm.getIdentity()).not.toBe(null);
        expect(getValueForIdentity(elm.getIdentity())).toBe(undefined);
        setValueForIdentity(elm.getIdentity(), '2');
        expect(getValueForIdentity(elm.getIdentity())).toBe('2');
    });
});
