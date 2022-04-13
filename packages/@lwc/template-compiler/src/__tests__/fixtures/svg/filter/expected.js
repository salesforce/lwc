import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<feFlood x="25%" y="25%" width="50%" height="50%" flood-color="green" flood-opacity="0.75"${1}${2}>`;
let $fragment2;
const $hoisted2 = parseFragment`<feBlend x="25%" y="25%" width="50%" height="50%" in2="SourceGraphic" mode="multiply"${1}${2}>`;
let $fragment3;
const $hoisted3 = parseFragment`<feMerge x="25%" y="25%" width="50%" height="50%"${1}${2}><feMergeNode in="SourceGraphic"${1}${2}><feMergeNode in="FillPaint"${1}${2}></feMerge>`;
let $fragment4;
const $hoisted4 = parseFragment`<g fill="none" stroke="blue" stroke-width="4"${1}${2}><rect width="200" height="200"${1}${2}><line x2="200" y2="200"${1}${2}><line x1="200" y2="200"${1}${2}></g>`;
let $fragment5;
const $hoisted5 = parseFragment`<circle fill="green" filter="url(#flood)" cx="100" cy="100" r="90"${1}${2}>`;
let $fragment6;
const $hoisted6 = parseFragment`<g transform="translate(200 0)"${1}${2}><g fill="none" stroke="blue" stroke-width="4"${1}${2}><rect width="200" height="200"${1}${2}><line x2="200" y2="200"${1}${2}><line x1="200" y2="200"${1}${2}></g><circle fill="green" filter="url(#blend)" cx="100" cy="100" r="90"${1}${2}></g>`;
let $fragment7;
const $hoisted7 = parseFragment`<g transform="translate(0 200)"${1}${2}><g fill="none" stroke="blue" stroke-width="4"${1}${2}><rect width="200" height="200"${1}${2}><line x2="200" y2="200"${1}${2}><line x1="200" y2="200"${1}${2}></g><circle fill="green" fill-opacity="0.5" filter="url(#merge)" cx="100" cy="100" r="90"${1}${2}></g>`;
let $fragment8;
const $hoisted8 = parseFragment`<rect fill="none" stroke="blue" x="1" y="1" width="598" height="248"${1}${2}>`;
let $fragment9;
const $hoisted9 = parseFragment`<g${1}${2}><rect x="50" y="25" width="100" height="200" filter="url(#Default)"${1}${2}><rect x="50" y="25" width="100" height="200" fill="none" stroke="green"${1}${2}><rect x="250" y="25" width="100" height="200" filter="url(#Fitted)"${1}${2}><rect x="250" y="25" width="100" height="200" fill="none" stroke="green"${1}${2}><rect x="450" y="25" width="100" height="200" filter="url(#Shifted)"${1}${2}><rect x="450" y="25" width="100" height="200" fill="none" stroke="green"${1}${2}></g>`;
let $fragment10;
const $hoisted10 = parseFragment`<desc${1}${2}>Produces a 3D lighting effect.</desc>`;
let $fragment11;
const $hoisted11 = parseFragment`<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"${1}${2}>`;
let $fragment12;
const $hoisted12 = parseFragment`<feOffset in="blur" dx="4" dy="4" result="offsetBlur"${1}${2}>`;
let $fragment13;
const $hoisted13 = parseFragment`<feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lighting-color="#bbbbbb" result="specOut"${1}${2}><fePointLight x="-5000" y="-10000" z="20000"${1}${2}></feSpecularLighting>`;
let $fragment14;
const $hoisted14 = parseFragment`<feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"${1}${2}>`;
let $fragment15;
const $hoisted15 = parseFragment`<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"${1}${2}>`;
let $fragment16;
const $hoisted16 = parseFragment`<feMerge${1}${2}><feMergeNode in="offsetBlur"${1}${2}><feMergeNode in="litPaint"${1}${2}></feMerge>`;
const stc0 = {
  attrs: {
    width: "400",
    height: "400",
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  key: 1,
  svg: true,
};
const stc2 = {
  attrs: {
    width: "600",
    height: "250",
    viewBox: "0 0 600 250",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
  },
  key: 19,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("defs", stc1, [
        api_element(
          "filter",
          {
            attrs: {
              id: api_scoped_id("flood"),
              x: "0",
              y: "0",
              width: "100%",
              height: "100%",
              primitiveUnits: "objectBoundingBox",
            },
            key: 2,
            svg: true,
          },
          [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 4)]
        ),
        api_element(
          "filter",
          {
            attrs: {
              id: api_scoped_id("blend"),
              primitiveUnits: "objectBoundingBox",
            },
            key: 5,
            svg: true,
          },
          [api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 7)]
        ),
        api_element(
          "filter",
          {
            attrs: {
              id: api_scoped_id("merge"),
              primitiveUnits: "objectBoundingBox",
            },
            key: 8,
            svg: true,
          },
          [api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 10)]
        ),
      ]),
      api_static_fragment($fragment4 || ($fragment4 = $hoisted4()), 12),
      api_static_fragment($fragment5 || ($fragment5 = $hoisted5()), 14),
      api_static_fragment($fragment6 || ($fragment6 = $hoisted6()), 16),
      api_static_fragment($fragment7 || ($fragment7 = $hoisted7()), 18),
    ]),
    api_element("svg", stc2, [
      api_static_fragment($fragment8 || ($fragment8 = $hoisted8()), 21),
      api_static_fragment($fragment9 || ($fragment9 = $hoisted9()), 23),
      api_element(
        "filter",
        {
          attrs: {
            id: api_scoped_id("MyFilter"),
            filterUnits: "userSpaceOnUse",
            x: "0",
            y: "0",
            width: "200",
            height: "120",
          },
          key: 24,
          svg: true,
        },
        [
          api_static_fragment($fragment10 || ($fragment10 = $hoisted10()), 26),
          api_static_fragment($fragment11 || ($fragment11 = $hoisted11()), 28),
          api_static_fragment($fragment12 || ($fragment12 = $hoisted12()), 30),
          api_static_fragment($fragment13 || ($fragment13 = $hoisted13()), 32),
          api_static_fragment($fragment14 || ($fragment14 = $hoisted14()), 34),
          api_static_fragment($fragment15 || ($fragment15 = $hoisted15()), 36),
          api_static_fragment($fragment16 || ($fragment16 = $hoisted16()), 38),
        ]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
