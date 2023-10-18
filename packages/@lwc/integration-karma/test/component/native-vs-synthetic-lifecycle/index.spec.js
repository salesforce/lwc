import { createElement } from 'lwc';
import Component from 'x/component';

describe('native vs synthetic lifecycle', () => {
    it('reports', async () => {
        const elm = createElement('x-component', { is: Component });

        document.body.appendChild(elm);

        await Promise.resolve();

        document.body.removeChild(elm);

        await Promise.resolve();
    });
});
