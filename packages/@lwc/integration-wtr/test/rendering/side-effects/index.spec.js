import { createElement } from 'lwc';

import SideEffectDuringRender from 'x/sideEffectDuringRender';
import SideEffectDuringTemplate from 'x/sideEffectDuringTemplate';
import SideEffectDuringRenderExternal from 'x/sideEffectDuringRenderExternal';
import SideEffectDuringTemplateExternal from 'x/sideEffectDuringTemplateExternal';
import { spyOn } from '@vitest/spy';

describe('side effects', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyOn(console, 'error');
    });
    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('logs error for side effect during render', async () => {
        const elm = createElement('x-side-effect-during-render', { is: SideEffectDuringRender });
        document.body.appendChild(elm);

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy).not.toHaveBeenCalled();
        } else {
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'render() method has side effects on the state of property "foo"'
                    ),
                })
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
            expect(consoleSpy).not.toHaveBeenCalled();
        } else {
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'Updating the template has side effects on the state of property "foo"'
                    ),
                })
            );
        }
    });

    it('logs error for side effect on external component during render', async () => {
        const elm = createElement('x-side-effect-during-render-external', {
            is: SideEffectDuringRenderExternal,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        expect(consoleSpy).not.toHaveBeenCalled();

        elm.bar = 1; // force re-render

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy).not.toHaveBeenCalled();
        } else {
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'render() method has side effects on the state of property "baz"'
                    ),
                })
            );
        }
    });

    it('logs error for side effect on external component during template updating', async () => {
        const elm = createElement('x-side-effect-during-template-external', {
            is: SideEffectDuringTemplateExternal,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        expect(consoleSpy).not.toHaveBeenCalled();

        elm.bar = 1; // force re-render

        await Promise.resolve();

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy).not.toHaveBeenCalled();
        } else {
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
            expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'Updating the template has side effects on the state of property "baz"'
                    ),
                })
            );
        }
    });
});
