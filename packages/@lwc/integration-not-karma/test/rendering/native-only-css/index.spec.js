import { createElement } from 'lwc';
import Light from 'c/light';
import Shadow from 'c/shadow';

function getRelevantStyles(node) {
    const props = [
        '--chic',
        '--implicit',
        '--implicit-scoped',
        '--glamorous',
        '--hip',
        '--snazzy',
        '--bar',
        '--foo',
        '--style-library',
    ];

    const style = getComputedStyle(node);
    return Object.fromEntries(
        props.map((prop) => {
            // The browsers disagree on whether this should be a single quote or double quote
            // Safari 17 uses a double quote, Chrome 130 and Firefox 132 use a single quote
            // Safari 14 also adds whitespace around it
            const value = style.getPropertyValue(prop).replace(/"/g, "'").trim();
            return [prop, value];
        })
    );
}

const expectedSyntheticStyles = {
    '--chic': '',
    '--implicit': "'default'",
    '--implicit-scoped': "'default'",
    '--glamorous': "'default'",
    '--hip': "'default'",
    '--snazzy': '',
    '--bar': "'default'",
    '--foo': '',
    '--style-library': "'default'",
};

const expectedNativeOrLightStyles = {
    ...expectedSyntheticStyles,
    '--chic': "'native'",
    '--snazzy': "'native'",
    '--foo': "'native'",
};

describe('skips native-only css in synthetic mode only', () => {
    it('shadow', async () => {
        const elm = createElement('c-shadow', { is: Shadow });
        document.body.appendChild(elm);
        await Promise.resolve();

        const div = elm.shadowRoot.querySelector('div');
        expect(getRelevantStyles(div)).toEqual(
            process.env.NATIVE_SHADOW ? expectedNativeOrLightStyles : expectedSyntheticStyles
        );
    });

    it('light', async () => {
        const elm = createElement('c-light', { is: Light });
        document.body.appendChild(elm);
        await Promise.resolve();

        const div = elm.querySelector('div');
        expect(getRelevantStyles(div)).toEqual(expectedNativeOrLightStyles);
    });
});
