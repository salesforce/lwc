import * as CONST from './constants';
import { isValidHTMLAttribute } from './html-attrs';

export function validateTemplateRootFormat(path: Path) {
    const rootChildrens = path.get('body');

    if (!rootChildrens.length) {
        throw path.buildCodeFrameError('Missing root template tag');
        // $FlowFixMe: not sure how to typecast to the array type
    } else if (rootChildrens.length > 1) {
        // $FlowFixMe: not sure how to typecast to the array type
        throw rootChildrens.pop().buildCodeFrameError('Unexpected token');
    }

    // $FlowFixMe: not sure how to typecast to the non-array type
    const templateTagName: Path = path.get('body.0.expression.openingElement.name');
    if (templateTagName.node.name !== CONST.TEMPLATE_TAG) {
        throw path.buildCodeFrameError('Root tag should be a template');
    }
}

export function validateElementMetadata(meta: any, path: Path) {
    if (meta.isSlotTag && Object.keys(meta.directives).length) {
        const usedDirectives = Object.keys(meta.directives).join(',');
        throw path.buildCodeFrameError(`You can\'t use directive "${usedDirectives}" in a slot tag`);
    }
}

export function validatePrimitiveValues(path: any) {
    path.traverse({
        enter(path: any) {
            if (!path.isJSX() && !path.isIdentifier() && !path.isMemberExpression() && !path.isLiteral()) {
                throw path.buildCodeFrameError(`Node type ${path.node.type} is not allowed inside an attribute value`);
            }
        }
    });
}

export function validateHTMLAttribute(tagName: string, attrName: string, path: Path) {
    if (!isValidHTMLAttribute(tagName, attrName)) {
        throw path.parentPath.buildCodeFrameError(`HTML Error: The attribute "${attrName}" is not defined the tag "${tagName}"`);
    }
}
