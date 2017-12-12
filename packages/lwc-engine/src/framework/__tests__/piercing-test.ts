import * as target from '../component';
import * as api from "../api";
import { Element } from "../html-element";
import { patch } from '../patch';
import { pierce } from '../piercing';

describe('piercing', function () {
    it('should set property on pierced object successfully', function () {
        class MyComponent extends Element  {
            render () {
                return ($api, $cmp, $slotset, $ctx) => {
                    return [$api.h('div', {}, [])];
                }
            }
        }

        const elm = document.createElement('x-foo');
        document.body.appendChild(elm);
        const vnode = api.c('x-foo', MyComponent, {});
        patch(elm, vnode);

        const replica = pierce(vnode.vm, elm);
        expect(() => {
            replica.style.position = 'absolute';
            expect(elm.style.position).toBe('absolute');
        }).not.toThrow();

    });

    it('should delete property on pierced object successfully', function () {
        class MyComponent extends Element  {
            render () {
                return ($api, $cmp, $slotset, $ctx) => {
                    return [$api.h('div', {}, [])];
                }
            }
        }

        const elm = document.createElement('x-foo');
        document.body.appendChild(elm);
        const piercedObject = {
            deleteMe: true
        };
        const vnode = api.c('x-foo', MyComponent, {});
        patch(elm, vnode);

        const replica = pierce(vnode.vm, piercedObject);
        expect(() => {
            delete replica.deleteMe;
        }).not.toThrow();
    });
});
