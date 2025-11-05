import { createElement } from 'lwc';

import Shadow from 'x/shadow';
import Light from 'x/light';

describe('stylesheet caching', () => {
    it('renders correctly when shadow and light component have identical CSS', async () => {
        const shadow = createElement('x-shadow', { is: Shadow });
        const light = createElement('x-light', { is: Light });
        document.body.appendChild(light);
        document.body.appendChild(shadow);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(getComputedStyle(shadow.shadowRoot.querySelector('h1')).color).toEqual(
            'rgb(255, 0, 255)'
        );
        expect(getComputedStyle(light.querySelector('h1')).color).toEqual('rgb(255, 0, 255)');
    });
});
