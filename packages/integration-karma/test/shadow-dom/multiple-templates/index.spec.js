import { createElement } from 'lwc';
import Multi from 'x/multi';

if (process.env.NATIVE_SHADOW) {
    describe('Shadow DOM styling - multiple shadow DOM components', () => {
        it('Does not duplicate styles if template is re-rendered', () => {
            const element = createElement('x-multi', { is: Multi });

            const getNumStyleSheets = () => {
                if (element.shadowRoot.adoptedStyleSheets) {
                    return element.shadowRoot.adoptedStyleSheets.length;
                } else {
                    return element.shadowRoot.querySelectorAll('style').length;
                }
            };

            document.body.appendChild(element);
            return Promise.resolve()
                .then(() => {
                    expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 255)'
                    );
                    expect(getNumStyleSheets()).toEqual(1);
                    element.next();
                })
                .then(() => {
                    expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(255, 0, 0)'
                    );
                    expect(getNumStyleSheets()).toEqual(2);
                    element.next();
                })
                .then(() => {
                    expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 255)'
                    );
                    expect(getNumStyleSheets()).toEqual(2);
                });
        });
    });
}
