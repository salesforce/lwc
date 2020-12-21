// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

const { targetGetter } = window.originalDomApis;

function createShadowTree(parentNode) {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

function addInstrumentation(target, type) {
    var log = [];
    for (var node = target; node; node = node.parentNode || node.host) {
        node.addEventListener(
            type,
            function (event) {
                log.push([this, targetGetter.call(event), event.composedPath()]);
            }.bind(node)
        );
    }
    // document.defaultView does not work in IE11
    window.addEventListener(
        'click',
        function (event) {
            log.push([this, targetGetter.call(event), event.composedPath()]);
        }.bind(window)
    );

    return log;
}

if (!process.env.NATIVE_SHADOW) {
    describe('Event.target', () => {
        let nodes;
        beforeEach(() => {
            nodes = createShadowTree(document.body);
        });

        it('should return original target when using original getter', () => {
            const button = nodes['button'];
            const log = addInstrumentation(button, 'click');
            button.click();

            const composedPath = [
                nodes.button,
                nodes['child_div'],
                nodes['x-child'].shadowRoot,
                nodes['x-child'],
                nodes['container_div'],
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            expect(log).toEqual([
                [button, button, composedPath],
                [nodes['child_div'], button, composedPath],
                [nodes['x-child'].shadowRoot, button, composedPath],
                [nodes['x-child'], button, composedPath],
                [nodes['container_div'], button, composedPath],
                [nodes['x-container'].shadowRoot, button, composedPath],
                [nodes['x-container'], button, composedPath],
                [document.body, button, composedPath],
                [document.documentElement, button, composedPath],
                [document, button, composedPath],
                [window, button, composedPath],
            ]);
        });
    });
}
