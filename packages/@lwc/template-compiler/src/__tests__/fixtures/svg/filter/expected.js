import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<feFlood x="25%" y="25%" width="50%" height="50%" flood-color="green" flood-opacity="0.75"${3}/>`;
const $fragment2 = parseSVGFragment`<feBlend x="25%" y="25%" width="50%" height="50%" in2="SourceGraphic" mode="multiply"${3}/>`;
const $fragment3 = parseSVGFragment`<feMerge x="25%" y="25%" width="50%" height="50%"${3}><feMergeNode in="SourceGraphic"${3}/><feMergeNode in="FillPaint"${3}/></feMerge>`;
const $fragment4 = parseSVGFragment`<g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g>`;
const $fragment5 = parseSVGFragment`<circle fill="green" filter="url(#flood)" cx="100" cy="100" r="90"${3}/>`;
const $fragment6 = parseSVGFragment`<g transform="translate(200 0)"${3}><g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g><circle fill="green" filter="url(#blend)" cx="100" cy="100" r="90"${3}/></g>`;
const $fragment7 = parseSVGFragment`<g transform="translate(0 200)"${3}><g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g><circle fill="green" fill-opacity="0.5" filter="url(#merge)" cx="100" cy="100" r="90"${3}/></g>`;
const $fragment8 = parseSVGFragment`<rect fill="none" stroke="blue" x="1" y="1" width="598" height="248"${3}/>`;
const $fragment9 = parseSVGFragment`<g${3}><rect x="50" y="25" width="100" height="200" filter="url(#Default)"${3}/><rect x="50" y="25" width="100" height="200" fill="none" stroke="green"${3}/><rect x="250" y="25" width="100" height="200" filter="url(#Fitted)"${3}/><rect x="250" y="25" width="100" height="200" fill="none" stroke="green"${3}/><rect x="450" y="25" width="100" height="200" filter="url(#Shifted)"${3}/><rect x="450" y="25" width="100" height="200" fill="none" stroke="green"${3}/></g>`;
const $fragment10 = parseSVGFragment`<desc${3}>Produces a 3D lighting effect.</desc>`;
const $fragment11 = parseSVGFragment`<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"${3}/>`;
const $fragment12 = parseSVGFragment`<feOffset in="blur" dx="4" dy="4" result="offsetBlur"${3}/>`;
const $fragment13 = parseSVGFragment`<feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lighting-color="#bbbbbb" result="specOut"${3}><fePointLight x="-5000" y="-10000" z="20000"${3}/></feSpecularLighting>`;
const $fragment14 = parseSVGFragment`<feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"${3}/>`;
const $fragment15 = parseSVGFragment`<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"${3}/>`;
const $fragment16 = parseSVGFragment`<feMerge${3}><feMergeNode in="offsetBlur"${3}/><feMergeNode in="litPaint"${3}/></feMerge>`;
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
          [api_static_fragment($fragment1(), 4)]
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
          [api_static_fragment($fragment2(), 7)]
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
          [api_static_fragment($fragment3(), 10)]
        ),
      ]),
      api_static_fragment($fragment4(), 12),
      api_static_fragment($fragment5(), 14),
      api_static_fragment($fragment6(), 16),
      api_static_fragment($fragment7(), 18),
    ]),
    api_element("svg", stc2, [
      api_static_fragment($fragment8(), 21),
      api_static_fragment($fragment9(), 23),
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
          api_static_fragment($fragment10(), 26),
          api_static_fragment($fragment11(), 28),
          api_static_fragment($fragment12(), 30),
          api_static_fragment($fragment13(), 32),
          api_static_fragment($fragment14(), 34),
          api_static_fragment($fragment15(), 36),
          api_static_fragment($fragment16(), 38),
        ]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
