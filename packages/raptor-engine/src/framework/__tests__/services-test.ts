import * as target from '../services';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import assert from 'power-assert';

function resetServices() {
    Object.keys(target.services).forEach((name) => {
        delete target.services[name];
    });
}

describe('services', () => {

    describe('register()', () => {

        beforeEach(function() {
            resetServices();
        });

        it('should throw for invalid service', () => {
            assert.throws(() => target.register());
        });

        it('should support single hook', () => {
            assert.strictEqual(undefined, target.services.rehydrated);
            target.register({
                rehydrated: function () {},
                connected: function () {}
            });
            assert.strictEqual(1, target.services.rehydrated.length);
            assert.strictEqual(1, target.services.connected.length);
        });

        it('should support multiple hooks', () => {
            assert.strictEqual(undefined, target.services.rehydrated);
            target.register({
                rehydrated: function () {}
            });
            assert.strictEqual(1, target.services.rehydrated.length);
        });

        it('should allow multiple services to register the same hook', () => {
            assert.strictEqual(undefined, target.services.rehydrated);
            target.register({
                rehydrated: function () {}
            });
            target.register({
                rehydrated: function () {}
            });
            assert.strictEqual(2, target.services.rehydrated.length);
        });

    });

    describe('integration', () => {
        it('should invoke all hooks', () => {
            let r = 0, c = 0, d = 0;
            target.register({
                rehydrated: function () {
                    r++;
                },
                connected: function () {
                    c++;
                },
                disconnected: function () {
                    d++;
                }
            });
            class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            // insertion
            patch(elm, api.c('x-foo', MyComponent, {}));
            // removal
            patch(elm, api.h('div', {}, []));
            return Promise.resolve(() => {
                assert.strictEqual(1, r, 'rehydrated hook');
                assert.strictEqual(1, c, 'connected hook');
                assert.strictEqual(1, d, 'disconnected hook');
            });
        });
    })

});
