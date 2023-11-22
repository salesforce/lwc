import { __unstable__ReportingControl as reportingControl, createElement } from 'lwc';
import Component from 'x/component';
import Parent from 'x/parent';

if (!window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
    describe('ConnectedCallbackWhileDisconnected reporting', () => {
        let logger;
        let dispatcher;

        beforeEach(() => {
            dispatcher = jasmine.createSpy();
            reportingControl.attachDispatcher(dispatcher);
            logger = spyOn(console, 'warn');
        });

        afterEach(() => {
            reportingControl.detachDispatcher();
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
            expect(dispatcher.calls.allArgs()).toContain([
                'ConnectedCallbackWhileDisconnected',
                { tagName: 'x-component' },
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
            expect(dispatcher.calls.allArgs()).toContain([
                'ConnectedCallbackWhileDisconnected',
                { tagName: 'x-parent' },
            ]);

            expect(dispatcher.calls.allArgs()).toContain([
                'ConnectedCallbackWhileDisconnected',
                { tagName: 'x-child' },
            ]);
        });
    });
}
