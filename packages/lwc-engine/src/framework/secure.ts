const DEFAULT_SECURE_ENABLEMENT = false;
const VERIFIED_TEMPLATES = new Set();

const SECURE_OBJECT = {
    enabled: DEFAULT_SECURE_ENABLEMENT,
    registerTemplate,
    verifyTemplate
};

function registerTemplate(tmpl) {
    if (SECURE_OBJECT.enabled) {
        VERIFIED_TEMPLATES.add(tmpl);
    }
}

function verifyTemplate(tmpl) {
    if (SECURE_OBJECT.enabled && !VERIFIED_TEMPLATES.has(tmpl)) {
        throw new TypeError('Unknown template');
    }
    return tmpl;
}

export const secure = SECURE_OBJECT;
