import { createElement } from 'lwc';

import Container from 'c/cssContainer';
import ContainerComposition from 'c/cssContainerComposition';

describe('CSS only modules', () => {
    it('CSS should be applied', async function () {
        const elm = createElement('c-css-container', { is: Container });
        document.body.appendChild(elm);

        await Promise.resolve();
        const p = elm.shadowRoot.querySelector('p');
        expect(p).not.toBeNull();
        const styles = window.getComputedStyle(p);
        expect(styles.borderBottomStyle).toContain('dashed');
        expect(styles.color).toContain('rgb(255, 0, 0)');
        expect(styles.backgroundColor).toContain('rgb(138, 43, 226)');
    });

    it('should support CSS only module referencing other CSS only modules', async () => {
        const elm = createElement('c-css-container-composition', { is: ContainerComposition });
        document.body.appendChild(elm);

        await Promise.resolve();
        const p = elm.shadowRoot.querySelector('p');
        expect(window.getComputedStyle(p).borderBottomStyle).toContain('dashed');
        const div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).borderBottomStyle).toContain('dashed');
        const span = elm.shadowRoot.querySelector('span');
        expect(window.getComputedStyle(span).borderBottomStyle).toContain('dashed');
    });
});
