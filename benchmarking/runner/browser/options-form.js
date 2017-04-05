const FORM_SELECTOR = '#runner-options';
const FORM_SUBMIT_SELECTOR = 'input[type="submit"]';
const FORM_INPUT_SELECTORS = {
    base: '#base-url',
    compare: '#compare-url',
    grep: '#grep',
    maxDuration: '#max-duration',
    minSampleCount: '#mim-sample-count',
};

const formElement = document.querySelector(FORM_SELECTOR);
const submitElement = formElement.querySelector(FORM_SUBMIT_SELECTOR);

const optionInputs = {};
for (let key of Object.keys(FORM_INPUT_SELECTORS)) {
    optionInputs[key] = formElement.querySelector(FORM_INPUT_SELECTORS[key]);
}

export function setFormValues(config) {
    const {
        base = '',
        compare = '',
        grep = '',
        maxDuration,
        minSampleCount
    } = config;

    optionInputs.base.value = base;
    optionInputs.compare.value = compare;
    optionInputs.grep.value = grep;
    optionInputs.maxDuration.value = maxDuration;
    optionInputs.minSampleCount.value = minSampleCount;
}

export function onFormSubmit(callback) {
    formElement.addEventListener('submit', evt => {
        evt.preventDefault();

        const options = {};
        for (let key of Object.keys(optionInputs)) {
            const { type, value } = optionInputs[key];
            options[key] = type === 'number' ? parseInt(value) : value;
        }

        callback(options);
    });
}

export function setFromState({ running }) {
    submitElement.disabled = running;
}
