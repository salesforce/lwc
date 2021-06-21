import { isNull } from '@lwc/shared';
import { retarget } from '../3rdparty/polymer/retarget';
import { pathComposer } from '../3rdparty/polymer/path-composer';
import { elementFromPoint as nativeElementFromPoint } from '../env/document';

export function elementFromPoint(
    context: Node,
    doc: Document,
    left: number,
    top: number
): Element | null {
    const element = nativeElementFromPoint.call(doc, left, top);
    if (isNull(element)) {
        return element;
    }
    return retarget(context, pathComposer(element, true)) as Element | null;
}
