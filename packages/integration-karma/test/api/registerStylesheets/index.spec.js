import { registerTemplate, registerStylesheets } from 'lwc';

describe('registerStylesheets', () => {
    it('should warn when setting tmpl.stylesheetToken', () => {
        const template = registerTemplate(() => []);
        const stylesheet = () => 'div { color: red }';
        registerStylesheets(template, 'myToken', [stylesheet]);

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
        registerStylesheets(template, 'myToken', [stylesheet]);

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
        registerStylesheets(template, 'myToken', [stylesheet]);

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
        registerStylesheets(template, 'myToken', [stylesheet]);

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
});
