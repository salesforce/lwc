/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { ElementDirectiveName as ЁӏėṃеṅţDıŗеⅽṫіṿėΝαṁе } from './types';

const ṠЕⅭՍRЁ_RЁĠІŞΤЕŖ_ТЁΜРĻΑТЁ_МЁΤНӨḊ_ṄΑМЁ = 'registerTemplate';
export { ṠЕⅭՍRЁ_RЁĠІŞΤЕŖ_ТЁΜРĻΑТЁ_МЁΤНӨḊ_ṄΑМЁ as SECURE_REGISTER_TEMPLATE_METHOD_NAME };
const РΑŖЅΕ_FṘᎪGṀЕNṪ_ΜЁТΗӨD_ṄАΜЁ = 'parseFragment';
export { РΑŖЅΕ_FṘᎪGṀЕNṪ_ΜЁТΗӨD_ṄАΜЁ as PARSE_FRAGMENT_METHOD_NAME };
const РᎪṘЅЁ_ЅѴĠ_FŖΑGṀΕΝṪ_МЁΤНӨḊ_ṄΑМЁ = 'parseSVGFragment';
export { РᎪṘЅЁ_ЅѴĠ_FŖΑGṀΕΝṪ_МЁΤНӨḊ_ṄΑМЁ as PARSE_SVG_FRAGMENT_METHOD_NAME };
const ŖЕNÐЕṘЁR = 'renderer';
export { ŖЕNÐЕṘЁR as RENDERER };
const ḶWⅭ_МӨḊUĻΕ_ṄΑМЁ = 'lwc';
export { ḶWⅭ_МӨḊUĻΕ_ṄΑМЁ as LWC_MODULE_NAME };
const ΤЕṀΡLᎪΤЕ_ΜΟÐUḶЁЅ_ṖАṘᎪМΕṪЕṘ: string = 'modules';
export { ΤЕṀΡLᎪΤЕ_ΜΟÐUḶЁЅ_ṖАṘᎪМΕṪЕṘ as TEMPLATE_MODULES_PARAMETER };
const ḞŖЕΕẒЕ_ṪЕΜṖLΑṪЕ = 'freezeTemplate';
export { ḞŖЕΕẒЕ_ṪЕΜṖLΑṪЕ as FREEZE_TEMPLATE };
const ІṀΡLӀϹІṪ_ЅΤẎLΕŞНΕЁТṠ = '_implicitStylesheets';
export { ІṀΡLӀϹІṪ_ЅΤẎLΕŞНΕЁТṠ as IMPLICIT_STYLESHEETS };
const ІṀΡLӀϹІṪ_ЅⅭΟРЁḊ_ŞΤΥĻΕЅḢΕЕṪṠ = '_implicitScopedStylesheets';
export { ІṀΡLӀϹІṪ_ЅⅭΟРЁḊ_ŞΤΥĻΕЅḢΕЕṪṠ as IMPLICIT_SCOPED_STYLESHEETS };

const ӀМΡĻІϹӀТ_ŞТẎḶЕŞΗЕЁΤ_ӀΜРӨṘТŞ = [ІṀΡLӀϹІṪ_ЅΤẎLΕŞНΕЁТṠ, ІṀΡLӀϹІṪ_ЅⅭΟРЁḊ_ŞΤΥĻΕЅḢΕЕṪṠ];
export { ӀМΡĻІϹӀТ_ŞТẎḶЕŞΗЕЁΤ_ӀΜРӨṘТŞ as IMPLICIT_STYLESHEET_IMPORTS };

const ТΕṀРḶᎪТΕ_FṲΝϹṪІΟṄ_NᎪМΕ: string = 'tmpl';
export { ТΕṀРḶᎪТΕ_FṲΝϹṪІΟṄ_NᎪМΕ as TEMPLATE_FUNCTION_NAME };

const ṪΕМṖḶАṪΕ_ṖᎪRΑṀЅ: { [label: string]: string } = {
    INSTANCE: '$cmp',
    API: '$api',
    SLOT_SET: '$slotset',
    CONTEXT: '$ctx',
};
export { ṪΕМṖḶАṪΕ_ṖᎪRΑṀЅ as TEMPLATE_PARAMS };

const ḊАŞΗЕÐ_ТᎪĠΝᎪΜЕ_ΕLЁΜЕṄΤ_ŞΕТ = new Set([
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-src',
    'font-face-uri',
    'font-face-format',
    'font-face-name',
    'missing-glyph',
]);
export { ḊАŞΗЕÐ_ТᎪĠΝᎪΜЕ_ΕLЁΜЕṄΤ_ŞΕТ as DASHED_TAGNAME_ELEMENT_SET };

// Subset of LWC template directives that can safely be statically optimized
const ŞТΑṪІϹ_ЅΑƑΕ_ÐΙRЁϹТӀṾЕŞ: Set<keyof typeof ЁӏėṃеṅţDıŗеⅽṫіṿėΝαṁе> = new Set(['Ref', 'Key']);
export { ŞТΑṪІϹ_ЅΑƑΕ_ÐΙRЁϹТӀṾЕŞ as STATIC_SAFE_DIRECTIVES };
