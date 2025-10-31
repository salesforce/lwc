import { createElement, setFeatureFlagForTest } from 'lwc';

import Component from 'c/component';
import Parent from 'c/parent';
import LogsWhenConnected from 'c/logsWhenConnected';
import { fn as mockFn, spyOn } from '@vitest/spy';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';

let logger;
let dispatcher;

beforeEach(() => {
    dispatcher = mockFn();
    attachReportingControlDispatcher(dispatcher, ['ConnectedCallbackWhileDisconnected']);
    logger = spyOn(console, 'warn');
});

afterEach(() => {
    detachReportingControlDispatcher();
});

const expectLogs = (regexes) => {
    if (process.env.NODE_ENV === 'production') {
        expect(logger).not.toHaveBeenCalled();
    } else {
        const args = logger.mock.calls;
        expect(args.length).toBe(regexes.length);
        for (let i = 0; i < args.length; i++) {
            expect(args[i][0]).toBeInstanceOf(Error);
            expect(args[i][0].message).toMatch(regexes[i]);
        }
    }
};

// synthetic lifecycle mode
describe.runIf(lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE)(
    'ConnectedCallbackWhileDisconnected reporting',
    () => {
        it('disconnected DOM', () => {
            const div = document.createElement('div');
            const elm = createElement('c-component', { is: Component });

            div.appendChild(elm);

            expectLogs([
                /Element <c-component> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.mock.calls).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'c-component' }],
            ]);
        });

        it('disconnected DOM - parent and child', () => {
            const div = document.createElement('div');
            const elm = createElement('c-parent', { is: Parent });

            div.appendChild(elm);

            expectLogs([
                /Element <c-parent> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
                /Element <c-child> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.mock.calls).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'c-parent' }],
                ['ConnectedCallbackWhileDisconnected', { tagName: 'c-child' }],
            ]);
        });

        // This only applies to synthetic custom element lifecycle, because that's the case
        // where we monkey-patch the global `Element.prototype.insertBefore`.
        it('should log a warning when insertBefore is called with fewer than 2 arguments', () => {
            const div = document.createElement('div');
            const span = document.createElement('span');

            expect(() => {
                div.insertBefore(span);
            }).toLogWarningDev(
                /insertBefore should be called with 2 arguments. Calling with only 1 argument is not supported./
            );
        });
    }
);

// native lifecycle mode
describe.skipIf(lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE)(
    'Lazily setting lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE to true',
    () => {
        beforeEach(() => {
            setFeatureFlagForTest('DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE', true);
            window.timingBuffer = [];
        });
        afterEach(() => {
            setFeatureFlagForTest('DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE', false);
            delete window.timingBuffer;
        });

        it('component runs in synthetic lifecycle after flag is lazily set', () => {
            const div = document.createElement('div');
            const elm = createElement('c-logs-when-connected', { is: LogsWhenConnected });

            div.appendChild(elm);

            expect(window.timingBuffer).toEqual(['<c-logs-when-connected>: connectedCallback']);
            expectLogs([
                /Element <c-logs-when-connected> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.mock.calls).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'c-logs-when-connected' }],
            ]);
        });
    }
);
