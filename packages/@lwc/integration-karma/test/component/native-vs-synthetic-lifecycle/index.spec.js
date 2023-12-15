import { createElement } from 'lwc';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
    nativeCustomElementLifecycleEnabled,
} from 'test-utils';

import Component from 'x/component';
import Parent from 'x/parent';

if (!nativeCustomElementLifecycleEnabled) {
    describe('ConnectedCallbackWhileDisconnected reporting', () => {
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

        function expectLogs(regexes) {
            if (process.env.NODE_ENV === 'production') {
                expect(logger).not.toHaveBeenCalled();
            } else {
                const args = logger.calls.allArgs();
                expect(args.length).toBe(regexes.length);
                for (let i = 0; i < args.length; i++) {
                    expect(args[i][0]).toMatch(regexes[i]);
                }
            }
        }

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
}
