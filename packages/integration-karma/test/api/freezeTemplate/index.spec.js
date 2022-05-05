import { registerTemplate, freezeTemplate } from 'lwc';

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

    it('tmpl expando props are enumerable and configurable', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        template.stylesheets = [stylesheet];
        template.stylesheetToken = 'myToken';
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
});
