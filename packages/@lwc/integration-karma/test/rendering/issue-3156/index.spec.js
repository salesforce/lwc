import { createElement, __unstable__ReportingControl as reportingControl } from 'lwc';
import Test from 'x/test';

describe('issue-3156', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        reportingControl.attachDispatcher(dispatcher);
    });

    afterEach(() => {
        reportingControl.detachDispatcher();
    });

    it('logs a warning and reports when the engine attempts to evaluate an invalid function as a stylesheet', () => {
        const element = createElement('x-test', { is: Test });
        expect(() => {
            document.body.appendChild(element);
        }).toLogWarningDev(
            /\[LWC warn]: TypeError: Unexpected LWC stylesheet content found for component <x-test>./
        );

        expect(dispatcher).toHaveBeenCalled();
        expect(dispatcher.calls.argsFor(0)).toEqual([
            'UnexpectedStylesheetContent',
            {
                tagName: 'x-test',
            },
        ]);
    });
});
