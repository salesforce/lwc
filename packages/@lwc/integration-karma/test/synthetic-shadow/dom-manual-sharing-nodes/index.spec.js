import { createElement } from 'lwc';

import Unstyled from 'x/unstyled';
import Styled from 'x/styled';

describe('dom manual sharing nodes', () => {
    it('has correct styles when sharing nodes from styled to unstyled component', () => {
        const unstyled = createElement('x-unstyled', { is: Unstyled });
        const styled = createElement('x-styled', { is: Styled });
        document.body.appendChild(unstyled);
        document.body.appendChild(styled);

        return new Promise((resolve) => requestAnimationFrame(() => resolve()))
            .then(() => {
                expect(
                    getComputedStyle(unstyled.shadowRoot.querySelector('.manual')).color
                ).toEqual('rgb(0, 0, 0)');
                expect(getComputedStyle(styled.shadowRoot.querySelector('.manual')).color).toEqual(
                    'rgb(255, 0, 0)'
                );

                styled.insertManualNode(unstyled.getManualNode());
                return new Promise((resolve) => requestAnimationFrame(() => resolve()));
            })
            .then(() => {
                expect(getComputedStyle(styled.shadowRoot.querySelector('.manual')).color).toEqual(
                    'rgb(255, 0, 0)'
                );
            });
    });

    it('has correct styles when sharing nodes from unstyled to styled component', () => {
        const unstyled = createElement('x-unstyled', { is: Unstyled });
        const styled = createElement('x-styled', { is: Styled });
        document.body.appendChild(unstyled);
        document.body.appendChild(styled);

        return new Promise((resolve) => requestAnimationFrame(() => resolve()))
            .then(() => {
                expect(
                    getComputedStyle(unstyled.shadowRoot.querySelector('.manual')).color
                ).toEqual('rgb(0, 0, 0)');
                expect(getComputedStyle(styled.shadowRoot.querySelector('.manual')).color).toEqual(
                    'rgb(255, 0, 0)'
                );

                unstyled.insertManualNode(styled.getManualNode());
                return new Promise((resolve) => requestAnimationFrame(() => resolve()));
            })
            .then(() => {
                expect(
                    getComputedStyle(unstyled.shadowRoot.querySelector('.manual')).color
                ).toEqual('rgb(0, 0, 0)');
            });
    });
});
