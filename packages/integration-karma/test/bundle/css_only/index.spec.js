import { createElement } from 'test-utils';
import Container from 'x/cssContainer';

describe('CSS only modules', () => {
    it('CSS should be applied', function() {
        const elm = createElement('x-css-container', { is: Container });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const p = elm.shadowRoot.querySelector('p');
            expect(p).not.toBeNull();

            const styles = window.getComputedStyle(p);
            expect(styles.border).toContain('1px solid');
            expect(styles.color).toContain('rgb(255, 0, 0)');
            expect(styles.background).toContain('rgb(138, 43, 226)');
        });
    });
});
