const { LWCClassErrors } = require('lwc-errors');
const { generateError } = require("../utils");

function validateNoHTMLImports(importDeclarationPath) {
    const { node: { source : { value } } } = importDeclarationPath;
    if (value.endsWith('.html')) {
        throw generateError(importDeclarationPath, {
            errorInfo: LWCClassErrors.INVALID_HTML_IMPORT_IMPLICIT_MODE,
            messageArgs: [value]
        });
    }
}

function validateImplicitImport(programPath) {
    const body = programPath.get("body");
    for (const decl of body) {
        if (decl.isImportDeclaration()) {
            validateNoHTMLImports(decl);
        }
    }
}

function validateExplicitImport(path) {
    // WIP
}

module.exports = function validate(path, state) {
    const validateMode = state.opts.isExplicitImport ? validateExplicitImport : validateImplicitImport;
    validateMode(path, state);
}
