import { Element } from "../html-element";
import { pierce } from '../piercing';
import { ViewModelReflection } from "../def";
import { createElement } from "../upgrade";

describe('piercing', function() {
    it('should set property on pierced object successfully', function() {
        class MyComponent extends Element  {
            render() {
                return ($api) => {
                    return [$api.h('div', {}, [])];
                };
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const replica = pierce(elm[ViewModelReflection], elm);
        expect(() => {
            replica.style.position = 'absolute';
            expect(elm.style.position).toBe('absolute');
        }).not.toThrow();

    });

    it('should delete property on pierced object successfully', function() {
        class MyComponent extends Element  {
            render() {
                return ($api) => {
                    return [$api.h('div', {}, [])];
                };
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const piercedObject = {
            deleteMe: true
        };
        const replica = pierce(elm[ViewModelReflection], piercedObject);
        expect(() => {
            delete replica.deleteMe;
        }).not.toThrow();
    });
});
