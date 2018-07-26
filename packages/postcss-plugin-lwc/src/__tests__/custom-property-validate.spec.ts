import { PluginConfig } from '../config';
import { process, FILE_NAME, DEFAULT_CONFIG } from './shared';

const NO_CUSTOM_PROPERTY_CONFIG: PluginConfig = {
    ...DEFAULT_CONFIG,
    customProperties: {
        allowDefinition: false,
    },
};

it('should prevent definition of standard custom properties', () => {
    return expect(
        process('div { --bg-color: blue; }', NO_CUSTOM_PROPERTY_CONFIG),
    ).rejects.toMatchObject({
        message: expect.stringContaining(
            `Invalid definition of custom property "--bg-color"`,
        ),
        file: FILE_NAME,
        line: 1,
        column: 7,
    });
});

it('should prevent definition of lwc-prefixed custom properties', () => {
    return expect(
        process('div { --lwc-bg-color: blue; }', NO_CUSTOM_PROPERTY_CONFIG),
    ).rejects.toMatchObject({
        message: expect.stringContaining(
            `Invalid definition of custom property "--lwc-bg-color"`,
        ),
        file: FILE_NAME,
        line: 1,
        column: 7,
    });
});
