import { createElement, setFeatureFlagForTest } from 'lwc';
import { attachReportingControlDispatcher, detachReportingControlDispatcher } from 'test-utils';

import Component from 'x/component';
import Parent from 'x/parent';
import LogsWhenConnected from 'x/logsWhenConnected';

let logger;
let dispatcher;

beforeEach(() => {
    dispatcher = jasmine.createSpy();
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
        const args = logger.calls.allArgs();
        expect(args.length).toBe(regexes.length);
        for (let i = 0; i < args.length; i++) {
            expect(args[i][0]).toMatch(regexes[i]);
        }
    }
};

if (lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
    // synthetic lifecycle mode
    describe('ConnectedCallbackWhileDisconnected reporting', () => {
        it('disconnected DOM', () => {
            const div = document.createElement('div');
            const elm = createElement('x-component', { is: Component });

            div.appendChild(elm);

            expectLogs([
                /Element <x-component> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.calls.allArgs()).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'x-component' }],
            ]);
        });

        it('disconnected DOM - parent and child', () => {
            const div = document.createElement('div');
            const elm = createElement('x-parent', { is: Parent });

            div.appendChild(elm);

            expectLogs([
                /Element <x-parent> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
                /Element <x-child> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.calls.allArgs()).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'x-parent' }],
                ['ConnectedCallbackWhileDisconnected', { tagName: 'x-child' }],
            ]);
        });
    });
} else {
    // native lifecycle mode
    describe('Lazily setting lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE to true', () => {
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
            const elm = createElement('x-logs-when-connected', { is: LogsWhenConnected });

            div.appendChild(elm);

            expect(window.timingBuffer).toEqual(['<x-logs-when-connected>: connectedCallback']);
            expectLogs([
                /Element <x-logs-when-connected> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
            ]);
            expect(dispatcher.calls.allArgs()).toEqual([
                ['ConnectedCallbackWhileDisconnected', { tagName: 'x-logs-when-connected' }],
            ]);
        });
    });
}
