import { createElement } from 'lwc';
import ConditionalList from 'x/conditionalList';
import { extractDataIds } from '../../../helpers/utils.js';
import { spyConsole } from '../../../helpers/console.js';

it('W-15885661 - renders list when key is invalid (preserve backwards compat)', async () => {
    const elm = createElement('x-conditional-list', { is: ConditionalList });
    document.body.appendChild(elm);
    await Promise.resolve();

    const { ul } = extractDataIds(elm);
    // Empty fragment
    expect(ul.children.length).toBe(0);

    const spy = spyConsole();
    elm.items = [{ value: 1 }];
    await Promise.resolve();

    const errorCalls = spy.calls.error;
    expect(errorCalls.length).toBe(process.env.NODE_ENV === 'production' ? 0 : 2);
    errorCalls.forEach(([error]) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toMatch(/(Invalid key value.*|Invalid "key" attribute.*)/);
    });

    spy.reset();

    // Still renders list with invalid keys
    expect(ul.children.length).toBe(1);
});
