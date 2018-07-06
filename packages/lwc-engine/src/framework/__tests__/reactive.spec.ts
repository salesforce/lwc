import { createElement, LightningElement, unwrap } from '../main';
import { reactiveMembrane } from '../membrane';

describe('unwrap', () => {
    it('should return value when not a proxy', () => {
        const obj = {};
        expect(unwrap(obj)).toBe(obj);
    });

    it('should unwrap observable membrane object correctly', () => {
        const obj = {};
        const proxy = reactiveMembrane.getProxy(obj);
        expect(unwrap(proxy)).toBe(obj);
    });

    it('should unwrap shadow membrane object correctly', () => {
        const renderHandler = ($api) => {
            return [$api.h('div', { key: 0 }, [])]
        }
        class CustomEl extends LightningElement {
            query() {
                return this.template.querySelector('div');
            }
            render() {
                return renderHandler;
            }
        }
        CustomEl.publicMethods = ['query'];

        const el = createElement('x-foo', { is: CustomEl });
        document.body.appendChild(el);
        const val = el.query();
        expect(unwrap(val)).toBe(document.body.querySelector('div'));
    });

    it('should handle undefined value', () => {
        expect(() => {
            unwrap(undefined);
        }).not.toThrow();
    });
})
