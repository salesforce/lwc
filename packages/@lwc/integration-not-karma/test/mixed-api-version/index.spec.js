import { createElement } from 'lwc';
import Container from 'x/container';
import UseApiVersion60 from 'x/useApiVersion60';
import { extractDataIds } from '../../helpers/utils.js';

describe('mixed API versions', () => {
    it('should trigger connected callback for v60 component rendered late inside non-portal <div>', async () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        await Promise.resolve();

        const div = extractDataIds(elm).div;
        expect(div.childNodes.length).toBe(0);

        const apiVersion60Elm = createElement('x-use-api-version-60', { is: UseApiVersion60 });

        const doAppend = () => {
            // insert manually without a portal
            div.appendChild(apiVersion60Elm);
        };

        if (process.env.NATIVE_SHADOW) {
            doAppend();
        } else {
            expect(doAppend).toLogWarningDev(
                /The `appendChild` method is available only on elements that use the `lwc:dom="manual"` directive/
            );
        }

        await Promise.resolve();

        // It should render even though it's inserted manually
        expect(extractDataIds(apiVersion60Elm).h1.textContent).toEqual('API version 60!');
    });
});
