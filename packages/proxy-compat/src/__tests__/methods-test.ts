import Proxy from "../main";

describe('Proxy', () => {

    describe('.inKey', () => {
        describe('When given proxy', function () {
            it('should correctly report if key is in object', function () {
                const proxy = new Proxy({foo:'bar'}, {});
                expect(Proxy.inKey(proxy, 'foo')).toBe(true);
            });

            it('should correctly report if key is not in object', function () {
                const proxy = new Proxy({foo:'bar'}, {});
                expect(Proxy.inKey(proxy, 'missing')).toBe(false);
            });

            it('should respect result from proxy handler', function () {
                const proxy = new Proxy({foo:'bar'}, {
                    has: function () {
                        return true;
                    }
                });
                expect(Proxy.inKey(proxy, 'missing')).toBe(true);
            });
        });

        describe('When given plain object', function () {
            it('should correctly report if key is in object', function () {
                const object = {foo:'bar'};
                expect(Proxy.inKey(object, 'foo')).toBe(true);
            });

            it('should correctly report if key is not in object', function () {
                const object = {foo:'bar'};
                expect(Proxy.inKey(object, 'missing')).toBe(false);
            });
        });
    });

    describe('.callKey', () => {

        it('should preserve the context on regular objects', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            };
            Proxy.callKey(o.foo, 'bar', 1, 2);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should preserve context on membranes', () => {
            let context, args;
            const o = new Proxy({
                foo: new Proxy({
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }, {})
            }, {});
            Proxy.callKey(Proxy.getKey(o, 'foo'), 'bar', 1, 2);
            expect(context).toBe(Proxy.getKey(o, 'foo'));
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support .call', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo.bar, 'call', o.foo, 1, 2);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support .apply', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo.bar, 'apply', o.foo, [1, 2]);
            expect(context).toBe(o.foo);
            expect(args.length).toBe(2);
            expect(args[0]).toBe(1);
            expect(args[1]).toBe(2);
        });

        it('should support no arguments', () => {
            let context, args;
            const o = {
                foo: {
                    bar: function () {
                        context = this;
                        args = arguments;
                    }
                }
            }
            Proxy.callKey(o.foo, 'bar');
            expect(context).toBe(o.foo);
            expect(args.length).toBe(0);
        });
    });
});
