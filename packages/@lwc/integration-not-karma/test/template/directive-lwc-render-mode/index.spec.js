import { createElement } from 'lwc';
import Shadow from 'c/shadow';
import Light from 'c/light';
import { fn as mockFn } from '@vitest/spy';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';

describe('lwc:render-mode', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = mockFn();
        attachReportingControlDispatcher(dispatcher, ['RenderModeMismatch']);
    });

    afterEach(() => {
        detachReportingControlDispatcher();
    });

    it('should throw error if shadow template is passed to light component', () => {
        expect(() => {
            const root = createElement('c-test', { is: Light });
            document.body.appendChild(root);
        }).toLogErrorDev(
            /Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode="light"' directive to the root template tag of <c-test>./
        );

        expect(dispatcher.mock.calls).toEqual([
            [
                'RenderModeMismatch',
                {
                    tagName: 'c-test',
                    mode: 0, // RenderMode.Light
                },
            ],
        ]);
    });
    it('should throw error if light template is passed to shadow component', () => {
        expect(() => {
            const root = createElement('c-test', { is: Shadow });
            document.body.appendChild(root);
        }).toLogErrorDev(
            /Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive from <c-test> or set it to 'lwc:render-mode="shadow"/
        );

        expect(dispatcher.mock.calls).toEqual([
            [
                'RenderModeMismatch',
                {
                    tagName: 'c-test',
                    mode: 1, // RenderMode.Shadow
                },
            ],
        ]);
    });
});
