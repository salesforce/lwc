import _implicitStylesheets from "./filter.css";
import _implicitScopedStylesheets from "./filter.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"${3}><defs${3}><filter${"a2:id"} x="0" y="0" width="100%" height="100%" primitiveUnits="objectBoundingBox"${3}><feFlood x="25%" y="25%" width="50%" height="50%" flood-color="green" flood-opacity="0.75"${3}/></filter><filter${"a4:id"} primitiveUnits="objectBoundingBox"${3}><feBlend x="25%" y="25%" width="50%" height="50%" in2="SourceGraphic" mode="multiply"${3}/></filter><filter${"a6:id"} primitiveUnits="objectBoundingBox"${3}><feMerge x="25%" y="25%" width="50%" height="50%"${3}><feMergeNode in="SourceGraphic"${3}/><feMergeNode in="FillPaint"${3}/></feMerge></filter></defs><g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g><circle fill="green" filter="url(#flood)" cx="100" cy="100" r="90"${3}/><g transform="translate(200 0)"${3}><g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g><circle fill="green" filter="url(#blend)" cx="100" cy="100" r="90"${3}/></g><g transform="translate(0 200)"${3}><g fill="none" stroke="blue" stroke-width="4"${3}><rect width="200" height="200"${3}/><line x2="200" y2="200"${3}/><line x1="200" y2="200"${3}/></g><circle fill="green" fill-opacity="0.5" filter="url(#merge)" cx="100" cy="100" r="90"${3}/></g></svg>`;
const $fragment2 = parseFragment`<svg width="600" height="250" viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${3}><rect fill="none" stroke="blue" x="1" y="1" width="598" height="248"${3}/><g${3}><rect x="50" y="25" width="100" height="200" filter="url(#Default)"${3}/><rect x="50" y="25" width="100" height="200" fill="none" stroke="green"${3}/><rect x="250" y="25" width="100" height="200" filter="url(#Fitted)"${3}/><rect x="250" y="25" width="100" height="200" fill="none" stroke="green"${3}/><rect x="450" y="25" width="100" height="200" filter="url(#Shifted)"${3}/><rect x="450" y="25" width="100" height="200" fill="none" stroke="green"${3}/></g><filter${"a9:id"} filterUnits="userSpaceOnUse" x="0" y="0" width="200" height="120"${3}><desc${3}>Produces a 3D lighting effect.</desc><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"${3}/><feOffset in="blur" dx="4" dy="4" result="offsetBlur"${3}/><feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lighting-color="#bbbbbb" result="specOut"${3}><fePointLight x="-5000" y="-10000" z="20000"${3}/></feSpecularLighting><feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"${3}/><feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"${3}/><feMerge${3}><feMergeNode in="offsetBlur"${3}/><feMergeNode in="litPaint"${3}/></feMerge></filter></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        2,
        {
          attrs: {
            id: api_scoped_id("flood"),
          },
        },
        null
      ),
      api_static_part(
        4,
        {
          attrs: {
            id: api_scoped_id("blend"),
          },
        },
        null
      ),
      api_static_part(
        6,
        {
          attrs: {
            id: api_scoped_id("merge"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        9,
        {
          attrs: {
            id: api_scoped_id("MyFilter"),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3thc4kq8dg9";
tmpl.legacyStylesheetToken = "x-filter_filter";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
