import { createElement } from 'lwc';
import Light from 'x/light';
import Shadow from 'x/shadow';

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
    return Object.fromEntries(props.map((prop) => [prop, style.getPropertyValue(prop)]));
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
        const elm = createElement('x-shadow', { is: Shadow });
        document.body.appendChild(elm);
        await Promise.resolve();

        const div = elm.shadowRoot.querySelector('div');
        expect(getRelevantStyles(div)).toEqual(
            process.env.NATIVE_SHADOW ? expectedNativeOrLightStyles : expectedSyntheticStyles
        );
    });

    it('light', async () => {
        const elm = createElement('x-light', { is: Light });
        document.body.appendChild(elm);
        await Promise.resolve();

        const div = elm.querySelector('div');
        expect(getRelevantStyles(div)).toEqual(expectedNativeOrLightStyles);
    });
});
