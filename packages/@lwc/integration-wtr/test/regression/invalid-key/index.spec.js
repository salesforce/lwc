import { createElement } from 'lwc';
import ConditionalList from 'x/conditionalList';
import { spyOn } from '@vitest/spy';
import { extractDataIds } from '../../../helpers/utils.js';

let consoleSpy;
beforeEach(() => {
    consoleSpy = spyOn(console, 'error');
});
afterEach(() => {
    consoleSpy.mockRestore();
});

it('W-15885661 - renders list when key is invalid (preserve backwards compat)', async () => {
    const elm = createElement('x-conditional-list', { is: ConditionalList });
    document.body.appendChild(elm);
    await Promise.resolve();

    const { ul } = extractDataIds(elm);
    // Empty fragment
    expect(ul.children.length).toBe(0);

    elm.items = [{ value: 1 }];
    await Promise.resolve();

    if (process.env.NODE_ENV === 'production') {
        expect(consoleSpy).not.toHaveBeenCalled();
    } else {
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = consoleSpy.mock.calls;
        expect(firstCall).toHaveSize(1);
        expect(firstCall[0]).toBeInstanceOf(Error);
        expect(firstCall[0].message).toContain('Invalid key value');
        expect(secondCall).toHaveSize(1);
        expect(secondCall[0]).toBeInstanceOf(Error);
        expect(secondCall[0].message).toContain('Invalid "key" attribute');
    }

    // Still renders list with invalid keys
    expect(ul.children.length).toBe(1);
});
