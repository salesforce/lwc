import { createElement } from 'lwc';

import Container from 'x/cssContainer';
import ContainerComposition from 'x/cssContainerComposition';

describe('CSS only modules', () => {
    it('CSS should be applied', function () {
        const elm = createElement('x-css-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const p = elm.shadowRoot.querySelector('p');
            expect(p).not.toBeNull();

            const styles = window.getComputedStyle(p);
            expect(styles.borderBottomStyle).toContain('dashed');
            expect(styles.color).toContain('rgb(255, 0, 0)');
            expect(styles.backgroundColor).toContain('rgb(138, 43, 226)');
        });
    });

    it('should support CSS only module referencing other CSS only modules', () => {
        const elm = createElement('x-css-container-composition', { is: ContainerComposition });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const p = elm.shadowRoot.querySelector('p');
            expect(window.getComputedStyle(p).borderBottomStyle).toContain('dashed');

            const div = elm.shadowRoot.querySelector('div');
            expect(window.getComputedStyle(div).borderBottomStyle).toContain('dashed');

            const span = elm.shadowRoot.querySelector('span');
            expect(window.getComputedStyle(span).borderBottomStyle).toContain('dashed');
        });
    });
});
