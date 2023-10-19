import { __unstable__ReportingControl as reportingControl, createElement } from 'lwc';
import Component from 'x/component';
import Parent from 'x/parent';

describe('lifecycle reporting', () => {
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
        const args = logger.calls.allArgs();
        expect(args.length).toBe(regexes.length);
        for (let i = 0; i < args.length; i++) {
            expect(args[i][0]).toMatch(regexes[i]);
        }
    }

    it('disconnected DOM', async () => {
        const div = document.createElement('div');

        const elm = createElement('x-component', { is: Component });

        div.appendChild(elm);
        await Promise.resolve();
        div.removeChild(elm);
        await Promise.resolve();

        expectLogs([
            /fired a connectedCallback when it should not have/,
            /fired a disconnectedCallback when it should not have/,
        ]);
        expect(dispatcher.calls.allArgs()).toEqual([
            ['SyntheticConnectedWithoutNative', { tagName: 'x-component' }],
            ['SyntheticDisconnectedWithoutNative', { tagName: 'x-component' }],
        ]);
    });

    it('disconnected DOM - parent and child', async () => {
        const div = document.createElement('div');

        const elm = createElement('x-parent', { is: Parent });

        div.appendChild(elm);
        await Promise.resolve();
        div.removeChild(elm);
        await Promise.resolve();

        expectLogs([
            /fired a connectedCallback when it should not have/,
            /fired a connectedCallback when it should not have/,
            /fired a disconnectedCallback when it should not have/,
            /fired a disconnectedCallback when it should not have/,
        ]);
        expect(dispatcher.calls.allArgs()).toEqual([
            ['SyntheticConnectedWithoutNative', { tagName: 'x-parent' }],
            ['SyntheticConnectedWithoutNative', { tagName: 'x-child' }],
            ['SyntheticDisconnectedWithoutNative', { tagName: 'x-parent' }],
            ['SyntheticDisconnectedWithoutNative', { tagName: 'x-child' }],
        ]);
    });
});
