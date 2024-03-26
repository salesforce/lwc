import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Escape \`me\`</div>`;
const $fragment2 = parseFragment`<div data-message="Escape \`me\`"${3}></div>`;
const $fragment3 = parseFragment`<div${3}><!-- Escape \`me\` --></div>`;
const $fragment4 = parseFragment`<xmp${3}>Escape \`me\`</xmp>`;
const $fragment5 = parseFragment`<div${3}>Escape \\\`me\`</div>`;
const $fragment6 = parseFragment`<div data-message="Escape \\\`me\`"${3}></div>`;
const $fragment7 = parseFragment`<div${3}><!-- Escape \\\`me\` --></div>`;
const $fragment8 = parseFragment`<xmp${3}>Escape \\\`me\`</xmp>`;
const $fragment9 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment10 = parseFragment`<div data-message="Escape \${me}"${3}></div>`;
const $fragment11 = parseFragment`<div${3}><!-- Escape \${me} --></div>`;
const $fragment12 = parseFragment`<xmp${3}>${"t1"}</xmp>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    d: api_dynamic_text,
    sp: api_static_part,
  } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
    api_static_fragment($fragment4, 7),
    api_static_fragment($fragment5, 9),
    api_static_fragment($fragment6, 11),
    api_static_fragment($fragment7, 13),
    api_static_fragment($fragment8, 15),
    api_static_fragment($fragment9, 17, [
      api_static_part(1, null, "Escape $" + api_dynamic_text($cmp.me)),
    ]),
    api_static_fragment($fragment10, 19),
    api_static_fragment($fragment11, 21),
    api_static_fragment($fragment12, 23, [
      api_static_part(1, null, "Escape $" + api_dynamic_text($cmp.me)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
