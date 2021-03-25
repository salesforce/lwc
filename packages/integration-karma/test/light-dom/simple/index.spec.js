import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Test from 'x/test';

function createShadowTree(parentNode) {
    const elm = createElement('x-test', { is: Test });
    elm.setAttribute('data-id', 'x-test');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

describe('Light DOM', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    it('should render simple component', () => {
        expect(nodes.title.innerText).toEqual(`I'm Macro`);
    });
});
