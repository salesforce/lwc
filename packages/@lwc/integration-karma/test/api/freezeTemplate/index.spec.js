import { registerTemplate, freezeTemplate, setFeatureFlagForTest } from 'lwc';

describe('freezeTemplate', () => {
    it('should warn when setting tmpl.stylesheetToken', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        expect(template.stylesheetToken).toEqual('myToken');

        expect(() => {
            template.stylesheetToken = 'newToken';
        }).toLogErrorDev(
            /Dynamically setting the "stylesheetToken" property on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.stylesheetToken).toEqual('newToken');
    });

    it('should warn when setting tmpl.stylesheetTokens', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        expect(template.stylesheetTokens).toEqual({
            hostAttribute: 'myToken-host',
            shadowAttribute: 'myToken',
        });

        expect(() => {
            template.stylesheetTokens = {
                hostAttribute: 'newToken-host',
                shadowAttribute: 'newToken',
            };
        }).toLogErrorDev(
            /Dynamically setting the "stylesheetTokens" property on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.stylesheetTokens).toEqual({
            hostAttribute: 'newToken-host',
            shadowAttribute: 'newToken',
        });
    });

    it('should warn when setting tmpl.stylesheets', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        expect(template.stylesheets.length).toEqual(1);
        expect(template.stylesheets[0]).toBe(stylesheet);

        const newStylesheet = () => 'div { color: blue }';

        expect(() => {
            template.stylesheets = [newStylesheet];
        }).toLogErrorDev(
            /Dynamically setting the "stylesheets" property on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.stylesheets.length).toEqual(1);
        expect(template.stylesheets[0]).toBe(newStylesheet);
    });

    it('should warn when mutating tmpl.stylesheets array', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        expect(template.stylesheets.length).toEqual(1);
        expect(template.stylesheets[0]).toBe(stylesheet);

        const newStylesheet = () => 'div { color: blue }';

        expect(() => {
            template.stylesheets.push(newStylesheet);
        }).toLogErrorDev(
            /Mutating the "stylesheets" array on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.stylesheets.length).toEqual(2);
        expect(template.stylesheets[0]).toBe(stylesheet);
        expect(template.stylesheets[1]).toBe(newStylesheet);

        expect(() => {
            template.stylesheets.pop();
        }).toLogErrorDev(
            /Mutating the "stylesheets" array on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.stylesheets.length).toEqual(1);
        expect(template.stylesheets[0]).toBe(stylesheet);
    });

    it('should warn when mutating a deep tmpl.stylesheets array', () => {
        const template = registerTemplate(() => []);
        const stylesheet1 = () => 'div { color: red }';
        const stylesheet2 = () => 'div { color: blue }';
        template.stylesheets = [stylesheet1, [stylesheet2]];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        const newStylesheet = () => 'div { color: yellow }';

        expect(() => {
            template.stylesheets[1].push(newStylesheet);
        }).toLogErrorDev(
            /Mutating the "stylesheets" array on a template function is deprecated and may be removed in a future version of LWC./
        );
    });

    it('should warn when setting tmpl.slots', () => {
        const template = registerTemplate(() => []);
        const originalSlots = [];
        template.slots = originalSlots;
        freezeTemplate(template);

        expect(template.slots).toBe(originalSlots);

        const newSlots = [];
        expect(() => {
            template.slots = newSlots;
        }).toLogErrorDev(
            /Dynamically setting the "slots" property on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.slots).toBe(newSlots);
    });

    it('should warn when setting tmpl.renderMOde', () => {
        const template = registerTemplate(() => []);
        template.renderMode = 'light';
        freezeTemplate(template);

        expect(template.renderMode).toBe('light');

        expect(() => {
            template.renderMode = undefined;
        }).toLogErrorDev(
            /Dynamically setting the "renderMode" property on a template function is deprecated and may be removed in a future version of LWC./
        );

        expect(template.renderMode).toBe(undefined);
    });

    it('should warn when setting stylesheet.$scoped$', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        freezeTemplate(template);

        expect(() => {
            stylesheet.$scoped$ = true;
        }).toLogErrorDev(
            /Dynamically setting the "\$scoped\$" property on a stylesheet function is deprecated and may be removed in a future version of LWC\./
        );
    });

    it('tmpl expando props are enumerable and configurable', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
        template.renderMode = undefined;
        template.slots = undefined;
        freezeTemplate(template);

        for (const prop of [
            'stylesheets',
            'stylesheetToken',
            'stylesheetTokens',
            'renderMode',
            'slots',
        ]) {
            const descriptor = Object.getOwnPropertyDescriptor(template, prop);
            expect(descriptor.enumerable).toEqual(true);
            expect(descriptor.configurable).toEqual(true);
        }
    });

    describe('ENABLE_FROZEN_TEMPLATE set to true', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_FROZEN_TEMPLATE', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('ENABLE_FROZEN_TEMPLATE', false);
        });

        it('deep-freezes the template', () => {
            const template = registerTemplate(() => []);
            const stylesheet = () => 'div { color: red }';
            template.stylesheets = [stylesheet];
            template.stylesheetToken = 'myToken';
            freezeTemplate(template);

            expect(Object.isFrozen(template)).toEqual(true);
            expect(Object.isFrozen(template.stylesheets)).toEqual(true);
        });

        it('freezes a template with no stylesheets', () => {
            const template = registerTemplate(() => []);
            freezeTemplate(template);

            expect(Object.isFrozen(template)).toEqual(true);
            expect(template.stylesheets).toEqual(undefined);
        });

        it('deep-freezes the stylesheets', () => {
            const template = registerTemplate(() => []);
            const stylesheet1 = () => 'div { color: red }';
            const stylesheet2 = () => 'div { color: blue }';
            const stylesheets = [stylesheet1, [stylesheet2]];
            template.stylesheets = stylesheets;
            template.stylesheetToken = 'myToken';
            freezeTemplate(template);

            expect(Object.isFrozen(template)).toEqual(true);
            expect(Object.isFrozen(stylesheets)).toEqual(true);
            expect(Object.isFrozen(stylesheets[0])).toEqual(true);
            expect(Object.isFrozen(stylesheets[1])).toEqual(true);
            expect(Object.isFrozen(stylesheets[1][0])).toEqual(true);
        });
    });
});
