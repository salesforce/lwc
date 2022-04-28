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
            name: 'shadow parent. light child',
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
                        parent.delete();
                        children = getChildren();
                    })
                    .then(() => {
                        expect(getDivColor(children[0])).toEqual('rgb(255, 0, 0)');
                        parent.delete();
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

    for (const caseA of cases) {
        for (const caseB of cases) {
            if (caseA === caseB) {
                continue;
            }
            describe(`mixing 1) ${caseA.name} and 2) ${caseB.name}`, () => {
                const setup = (Component) => {
                    const parent = createElement('x-parent', { is: Component });
                    document.body.appendChild(parent);
                    const child = (parent.shadowRoot || parent).querySelector('x-light,x-shadow');
                    return child;
                };

                const getDivColor = (child) => {
                    return getComputedStyle((child.shadowRoot || child).querySelector('div')).color;
                };

                if (process.env.NATIVE_SHADOW) {
                    // In synthetic mode, we can't guarantee the correct style swapping for light children. Their styles
                    // are effectively global at all times. So swapping from template A to template B causes
                    // both <style>s to be present globally in the DOM.
                    it('does not remove styles when swapping template on unrelated component', () => {
                        const childA = setup(caseA.Component);
                        const childB = setup(caseB.Component);

                        expect(getDivColor(childA)).toEqual('rgb(255, 0, 0)');
                        expect(getDivColor(childB)).toEqual('rgb(255, 0, 0)');

                        // when unrendering the template from one, we don't expect the other one
                        // to also unrender its style
                        childA.next();
                        return Promise.resolve().then(() => {
                            expect(getDivColor(childA)).toEqual('rgb(0, 0, 255)');
                            expect(getDivColor(childB)).toEqual('rgb(255, 0, 0)');
                        });
                    });
                }

                it('does not remove styles when disconnecting unrelated component', () => {
                    const childA = setup(caseA.Component);
                    const childB = setup(caseB.Component);

                    expect(getDivColor(childA)).toEqual('rgb(255, 0, 0)');
                    expect(getDivColor(childB)).toEqual('rgb(255, 0, 0)');

                    // when removing one component, we don't expect the other one
                    // to also unrender its style
                    childA.parentNode.removeChild(childA);
                    return Promise.resolve().then(() => {
                        expect(getDivColor(childB)).toEqual('rgb(255, 0, 0)');
                    });
                });
            });
        }
    }
});
