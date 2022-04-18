import { createElement } from 'lwc';
import LightParentLightChild from 'x/lightParentLightChild';
import LightParentShadowChild from 'x/lightParentShadowChild';
import ShadowParentLightChild from 'x/shadowParentLightChild';

describe('unrendering styles', () => {
    const cases = [
        {
            name: 'light parent, light child',
            Component: LightParentLightChild,
        },
        {
            name: 'light parent, shadow child',
            Component: LightParentShadowChild,
        },
        {
            name: 'light child, shadow parent',
            Component: ShadowParentLightChild,
        },
    ];

    cases.forEach(({ name, Component }) => {
        describe(name, () => {
            let parent;
            let child;

            beforeEach(() => {
                parent = createElement('x-parent', { is: Component });
                document.body.appendChild(parent);
                child = getChildren()[0];
            });

            const getChildren = () => {
                return [...(parent.shadowRoot || parent).querySelectorAll('x-light,x-shadow')];
            };

            const getDivColor = (theChild = child) => {
                return getComputedStyle((theChild.shadowRoot || theChild).querySelector('div'))
                    .color;
            };

            const getNumStylesheetsForElement = (elm) => {
                let count = 0;
                if (elm.shadowRoot) {
                    if (elm.shadowRoot.adoptedStyleSheets) {
                        count += elm.shadowRoot.adoptedStyleSheets.length;
                    }
                    count += elm.shadowRoot.querySelectorAll('style').length;
                }
                return count;
            };

            const getNumStylesheets = () => {
                let count = document.head.querySelectorAll('style').length;
                if (document.adoptedStyleSheets) {
                    count += document.adoptedStyleSheets.length;
                }
                if (document.body.contains(parent)) {
                    count += getNumStylesheetsForElement(parent);
                    const children = getChildren();
                    for (const child of children) {
                        count += getNumStylesheetsForElement(child);
                    }
                }
                return count;
            };

            it('replaces styles when swapping templates', () => {
                expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                expect(getNumStylesheets()).toEqual(1);
                child.next();
                return Promise.resolve()
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(0, 0, 255)');
                        expect(getNumStylesheets()).toEqual(1);
                        child.next();
                    })
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                        expect(getNumStylesheets()).toEqual(1);
                        child.next();
                    })
                    .then(() => {
                        expect(getDivColor()).toEqual('rgb(0, 0, 255)');
                        expect(getNumStylesheets()).toEqual(1);
                    });
            });

            it('removes styles when removing elements', () => {
                expect(getNumStylesheets()).toEqual(1);
                document.body.removeChild(parent);
                expect(getNumStylesheets()).toEqual(0);
            });

            it('removes styles when removing multiple elements', () => {
                expect(getNumStylesheets()).toEqual(1);
                expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                parent.add();
                let children = getChildren();
                return Promise.resolve()
                    .then(() => {
                        expect(getDivColor(children[0])).toEqual('rgb(255, 0, 0)');
                        expect(getDivColor(children[1])).toEqual('rgb(255, 0, 0)');
                        parent.remove();
                        children = getChildren();
                    })
                    .then(() => {
                        expect(getDivColor(children[0])).toEqual('rgb(255, 0, 0)');
                        parent.remove();
                        children = getChildren();
                    })
                    .then(() => {
                        expect(getNumStylesheets()).toEqual(0);
                    });
            });

            it('removes styles when removing multiple elements with swapped templates', () => {
                expect(getNumStylesheets()).toEqual(1);
                expect(getDivColor()).toEqual('rgb(255, 0, 0)');
                parent.add();
                let children = getChildren();
                return Promise.resolve()
                    .then(() => {
                        expect(getDivColor(children[0])).toEqual('rgb(255, 0, 0)');
                        expect(getDivColor(children[1])).toEqual('rgb(255, 0, 0)');
                        children = getChildren();
                        for (const child of children) {
                            child.next();
                        }
                    })
                    .then(() => {
                        expect(getDivColor(children[0])).toEqual('rgb(0, 0, 255)');
                        expect(getDivColor(children[1])).toEqual('rgb(0, 0, 255)');
                        document.body.removeChild(parent);
                    })
                    .then(() => {
                        expect(getNumStylesheets()).toEqual(0);
                    });
            });
        });
    });
});
