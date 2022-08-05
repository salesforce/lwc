import { createElement } from 'lwc';

import XHooks from 'x/hooks';

const { register } = LWC;

describe('Service hooks', () => {
    let entries = [];

    register({
        connected(...args) {
            entries.push(['service-connected', args]);
        },
        disconnected(...args) {
            entries.push(['service-disconnected', args]);
        },
        rendered(...args) {
            entries.push(['service-rendered', args]);
        },
    });

    function resetEntries() {
        entries = [];
    }

    beforeEach(() => {
        resetEntries();
    });

    it('invokes the service life-cycle hooks with the right parameters', () => {
        function assertHookEntry(i, expectedName) {
            const [actualName, args] = entries[i];

            expect(actualName).toBe(expectedName);

            expect(Array.isArray(args)).toBe(true);
            expect(args.length).toBe(4);

            expect(args[0]).toBeInstanceOf(XHooks); // Component
            expect(args[1]).toEqual({}); // Data
            expect(args[2].ctor).toBe(XHooks); // Def
            expect(typeof args[3]).toBe('object'); // Context
        }

        const elm = createElement('x-hooks', { is: XHooks });

        document.body.appendChild(elm);
        document.body.removeChild(elm);

        assertHookEntry(0, 'service-connected');
        assertHookEntry(1, 'service-rendered');
        assertHookEntry(2, 'service-disconnected');
    });

    it('invokes the service hooks before the component hooks', () => {
        const elm = createElement('x-hooks', { is: XHooks });

        elm.cb = (entry) => entries.push([entry, []]);

        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expect(entries.map((entry) => entry[0])).toEqual([
            'service-connected',
            'component-connected',
            'service-rendered',
            'component-rendered',
            'service-disconnected',
            'component-disconnected',
        ]);
    });
});
