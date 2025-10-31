import { createElement } from 'lwc';

import Shadow from 'c/shadow';
import Light from 'c/light';

describe('stylesheet caching', () => {
    it('renders correctly when shadow and light component have identical CSS', async () => {
        const shadow = createElement('c-shadow', { is: Shadow });
        const light = createElement('c-light', { is: Light });
        document.body.appendChild(light);
        document.body.appendChild(shadow);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(getComputedStyle(shadow.shadowRoot.querySelector('h1')).color).toEqual(
            'rgb(255, 0, 255)'
        );
        expect(getComputedStyle(light.querySelector('h1')).color).toEqual('rgb(255, 0, 255)');
    });
});
