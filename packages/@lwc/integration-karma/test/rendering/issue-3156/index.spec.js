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

    it('logs an error when the engine attempts to evaluate an invalid function as a stylesheet', () => {
        const element = createElement('x-test', { is: Test });
        expect(() => {
            document.body.appendChild(element);
        }).toLogError(
            /\[LWC error]: TypeError: Unexpected LWC stylesheet content found for component <x-test>./
        );
    });

    it('reports to the reporting API when invalid stylesheet content is found', () => {
        const element = createElement('x-test', { is: Test });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalled();
        expect(dispatcher.calls.argsFor(0)).toEqual([
            'UnexpectedStylesheetContent',
            {
                tagName: 'x-test',
            },
        ]);
    });
});
