import { api, LightningElement } from 'lwc';

import anchor from './anchor.html';
import anchorHref from './anchorHref.html';
import areaHref from './areaHref.html';
import audio from './audio.html';
import audioControls from './audioControls.html';
import button from './button.html';
import buttonDisabled from './buttonDisabled.html';
import checkbox from './checkbox.html';
import checkboxDisabled from './checkboxDisabled.html';
import detailsEmpty from './detailsEmpty.html';
import divOverflow from './divOverflow.html';
import embed from './embed.html';
import embedSrc from './embedSrc.html';
import iframe from './iframe.html';
import iframeSrc from './iframeSrc.html';
import img from './img.html';
import imgSrc from './imgSrc.html';
import input from './input.html';
import inputDisabled from './inputDisabled.html';
import inputTime from './inputTime.html';
import object from './object.html';
import objectData from './objectData.html';
import select from './select.html';
import selectDisabled from './selectDisabled.html';
import selectMultiple from './selectMultiple.html';
import selectOptgroup from './selectOptgroup.html';
import span from './span.html';
import spanContenteditable from './spanContenteditable.html';
import spanTabindexNegativeOne from './spanTabindexNegativeOne.html';
import spanTabindexZero from './spanTabindexZero.html';
import summary from './summary.html';
import summaryInsideDetails from './summaryInsideDetails.html';
import summaryInsideDetailsMultiple from './summaryInsideDetailsMultiple.html';
import svgAnchor from './svgAnchor.html';
import svgAnchorHref from './svgAnchorHref.html';
import svgAnchorXlinkHref from './svgAnchorXlinkHref.html';
import textarea from './textarea.html';
import textareaDisabled from './textareaDisabled.html';
import video from './video.html';
import videoControls from './videoControls.html';

const map = {
    anchor,
    anchorHref,
    areaHref,
    audio,
    audioControls,
    button,
    buttonDisabled,
    checkbox,
    checkboxDisabled,
    detailsEmpty,
    divOverflow,
    embed,
    embedSrc,
    iframe,
    iframeSrc,
    img,
    imgSrc,
    input,
    inputDisabled,
    inputTime,
    object,
    objectData,
    select,
    selectDisabled,
    selectMultiple,
    selectOptgroup,
    span,
    spanContenteditable,
    spanTabindexNegativeOne,
    spanTabindexZero,
    summary,
    summaryInsideDetails,
    summaryInsideDetailsMultiple,
    svgAnchor,
    svgAnchorHref,
    svgAnchorXlinkHref,
    textarea,
    textareaDisabled,
    video,
    videoControls,
};

export default class Child extends LightningElement {
    static delegatesFocus = true;

    @api type;

    render() {
        return map[this.type];
    }
}
