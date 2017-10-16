import * as target from '../services';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';

function resetServices() {
    Object.keys(target.Services).forEach((name) => {
        delete target.Services[name];
    });
}

describe('services', () => {

    describe('register()', () => {

        beforeEach(function() {
            resetServices();
        });

        it('should throw for invalid service', () => {
            expect(() => target.register()).toThrow();
        });

        it('should support single hooks', () => {
            expect(target.Services.rehydrated).toBeUndefined();
            target.register({
                rehydrated: function () {},
            });
            expect(target.Services.rehydrated).toHaveLength(1);
        });

        it('should support multiple hook', () => {
            expect(target.Services.rehydrated).toBeUndefined();
            target.register({
                rehydrated: function () {},
                connected: function () {}
            });
            expect(target.Services.rehydrated).toHaveLength(1);
            expect(target.Services.connected).toHaveLength(1);
        });

        it('should allow multiple services to register the same hook', () => {
            expect(target.Services.rehydrated).toBeUndefined();
            target.register({
                rehydrated: function () {}
            });
            target.register({
                rehydrated: function () {}
            });
            expect(target.Services.rehydrated).toHaveLength(2);
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
                expect(r).toBe(1)
                expect(c).toBe(1)
                expect(d).toBe(1);
            });
        });
    })

});
