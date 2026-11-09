import { createElement } from 'lwc';

import Component from 'x/component';
import Parent from 'x/parent';
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
    logger.mockRestore();
});

const expectLogs = (regexes) => {
    if (process.env.NODE_ENV === 'production') {
        expect(logger).not.toHaveBeenCalled();
    } else {
        expect(logger).toHaveBeenCalledTimes(regexes.length);
        const args = logger.mock.calls;
        for (let i = 0; i < args.length; i++) {
            expect(args[i][0]).toBeInstanceOf(Error);
            expect(args[i][0].message).toMatch(regexes[i]);
        }
    }
};

describe('ConnectedCallbackWhileDisconnected reporting', () => {
    it('disconnected DOM', () => {
        const div = document.createElement('div');
        const elm = createElement('x-component', { is: Component });

        div.appendChild(elm);

        expectLogs([
            /Element <x-component> fired a `connectedCallback` and rendered, but was not connected to the DOM/,
        ]);
        expect(dispatcher.mock.calls).toEqual([
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
        expect(dispatcher.mock.calls).toEqual([
            ['ConnectedCallbackWhileDisconnected', { tagName: 'x-parent' }],
            ['ConnectedCallbackWhileDisconnected', { tagName: 'x-child' }],
        ]);
    });
});
