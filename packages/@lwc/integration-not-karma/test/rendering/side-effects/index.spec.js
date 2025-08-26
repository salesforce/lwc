import { createElement } from 'lwc';
import { spyConsole } from 'test-utils';

import SideEffectDuringRender from 'x/sideEffectDuringRender';
import SideEffectDuringTemplate from 'x/sideEffectDuringTemplate';
import SideEffectDuringRenderExternal from 'x/sideEffectDuringRenderExternal';
import SideEffectDuringTemplateExternal from 'x/sideEffectDuringTemplateExternal';

describe('side effects', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('logs error for side effect during render', async () => {
        const elm = createElement('x-side-effect-during-render', { is: SideEffectDuringRender });
        document.body.appendChild(elm);

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy.calls.error.length).toEqual(0);
        } else {
            expect(consoleSpy.calls.error.length).toEqual(1);
            expect(consoleSpy.calls.error[0][0].message).toContain(
                'render() method has side effects on the state of property "foo"'
            );
        }
    });

    it('logs error for side effect during template updating', async () => {
        const elm = createElement('x-side-effect-during-template', {
            is: SideEffectDuringTemplate,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy.calls.error.length).toEqual(0);
        } else {
            expect(consoleSpy.calls.error.length).toEqual(1);
            expect(consoleSpy.calls.error[0][0].message).toContain(
                'Updating the template has side effects on the state of property "foo"'
            );
        }
    });

    it('logs error for side effect on external component during render', async () => {
        const elm = createElement('x-side-effect-during-render-external', {
            is: SideEffectDuringRenderExternal,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        expect(consoleSpy.calls.error.length).toEqual(0);

        elm.bar = 1; // force re-render

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy.calls.error.length).toEqual(0);
        } else {
            expect(consoleSpy.calls.error.length).toEqual(1);
            expect(consoleSpy.calls.error[0][0].message).toContain(
                'render() method has side effects on the state of property "baz"'
            );
        }
    });

    it('logs error for side effect on external component during template updating', async () => {
        const elm = createElement('x-side-effect-during-template-external', {
            is: SideEffectDuringTemplateExternal,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        expect(consoleSpy.calls.error.length).toEqual(0);

        elm.bar = 1; // force re-render

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy.calls.error.length).toEqual(0);
        } else {
            expect(consoleSpy.calls.error.length).toEqual(1);
            expect(consoleSpy.calls.error[0][0].message).toContain(
                'Updating the template has side effects on the state of property "baz"'
            );
        }
    });
});
