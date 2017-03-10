import * as CONST from './constants';

export function validateTemplateRootFormat(path: Path) {
    const rootChildrens = path.get('body');

    if (!rootChildrens.length) {
        throw path.buildCodeFrameError('Missing root template tag');
    } else if (rootChildrens.length > 1) {
        throw rootChildrens.pop().buildCodeFrameError('Unexpected token');
    }

    const templateTagName = path.get('body.0.expression.openingElement.name');
    if (templateTagName.node.name !== CONST.TEMPLATE_TAG) {
        throw path.buildCodeFrameError('Root tag should be a template');
    }
}
