import { createElement } from 'lwc';
import Light1 from 'x/light1';
import Light2 from 'x/light2';
import Shadow1 from 'x/shadow1';
import Shadow2 from 'x/shadow2';
import ShadowParentLightChild from 'x/shadowParentLightChild';

// Under the hood, we may de-dup styles based on their string contents. So if two
// components happen to have exactly the same CSS, we have to confirm that unrendering
// one component doesn't cause the other's component's CSS to be removed from the DOM.
describe('style collisions', () => {
    const cases = [
        {
            name: 'light',
            components: [Light1, Light2],
        },
        {
            name: 'shadow',
            components: [Shadow1, Shadow2],
        },
    ];

    const getDivColor = (elm) => {
        return getComputedStyle((elm.shadowRoot || elm).querySelector('div')).color;
    };

    const getNumGlobalStylesheets = () => {
        let count = document.head.querySelectorAll('style').length;
        if (document.adoptedStyleSheets) {
            count += document.adoptedStyleSheets.length;
        }
        return count;
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

    cases.forEach(({ name, components: [Component1, Component2] }) => {
        describe(name, () => {
            it('removes styles from the DOM when two components have exact same styles', () => {
                const elm1 = createElement('x-one', { is: Component1 });
                const elm2 = createElement('x-two', { is: Component2 });

                document.body.appendChild(elm1);
                document.body.appendChild(elm2);

                return Promise.resolve()
                    .then(() => {
                        expect(getDivColor(elm1)).toEqual('rgb(255, 0, 0)');
                        expect(getDivColor(elm2)).toEqual('rgb(255, 0, 0)');
                        document.body.removeChild(elm1);
                    })
                    .then(() => {
                        expect(getDivColor(elm2)).toEqual('rgb(255, 0, 0)');
                        document.body.removeChild(elm2);
                        expect(getNumGlobalStylesheets()).toEqual(0);
                    });
            });
        });
    });

    describe('shadow parent, light child', () => {
        it('removes styles from the DOM when two components have the exact same styles', () => {
            const elm = createElement('x-parent', { is: ShadowParentLightChild });
            document.body.appendChild(elm);

            elm.child1Shown = true;
            elm.child2Shown = true;
            return Promise.resolve()
                .then(() => {
                    const [child1, child2] = elm.shadowRoot.querySelectorAll('x-light1,x-light2');
                    expect(getDivColor(child1)).toEqual('rgb(255, 0, 0)');
                    expect(getDivColor(child2)).toEqual('rgb(255, 0, 0)');
                    elm.child1Shown = false;
                })
                .then(() => {
                    expect(getDivColor(elm.shadowRoot.querySelector('x-light2'))).toEqual(
                        'rgb(255, 0, 0)'
                    );
                    elm.child2Shown = false;
                })
                .then(() => {
                    expect(getNumStylesheetsForElement(elm)).toEqual(0);
                });
        });
    });
});
