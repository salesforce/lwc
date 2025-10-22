import { api, LightningElement } from 'lwc';

import anchorHref from './anchorHref.html';
import areaHref from './areaHref.html';
import audioControls from './audioControls.html';
import button from './button.html';
import checkbox from './checkbox.html';
import detailsEmpty from './detailsEmpty.html';
import divOverflow from './divOverflow.html';
import embedSrc from './embedSrc.html';
import iframe from './iframe.html';
import iframeSrc from './iframeSrc.html';
import img from './img.html';
import imgSrc from './imgSrc.html';
import input from './input.html';
import inputTime from './inputTime.html';
import objectData from './objectData.html';
import select from './select.html';
import selectMultiple from './selectMultiple.html';
import selectOptgroup from './selectOptgroup.html';
import spanContenteditable from './spanContenteditable.html';
import spanTabindexNegativeOne from './spanTabindexNegativeOne.html';
import spanTabindexZero from './spanTabindexZero.html';
import summary from './summary.html';
import summaryInsideDetails from './summaryInsideDetails.html';
import summaryInsideDetailsMultiple from './summaryInsideDetailsMultiple.html';
import svgAnchorHref from './svgAnchorHref.html';
import svgAnchorXlinkHref from './svgAnchorXlinkHref.html';
import textarea from './textarea.html';
import videoControls from './videoControls.html';

const map = Object.assign(Object.create(null), {
    anchorHref,
    areaHref,
    audioControls,
    button,
    checkbox,
    detailsEmpty,
    divOverflow,
    embedSrc,
    iframe,
    iframeSrc,
    img,
    imgSrc,
    input,
    inputTime,
    objectData,
    select,
    selectMultiple,
    selectOptgroup,
    spanContenteditable,
    spanTabindexNegativeOne,
    spanTabindexZero,
    summary,
    summaryInsideDetails,
    summaryInsideDetailsMultiple,
    svgAnchorHref,
    svgAnchorXlinkHref,
    textarea,
    videoControls,
});

export default class Child extends LightningElement {
    static delegatesFocus = true;

    @api type;

    render() {
        const html = map[this.type];
        if (!html) {
            throw new TypeError(`Unknown type: "${this.type}"`);
        }
        return html;
    }
}
