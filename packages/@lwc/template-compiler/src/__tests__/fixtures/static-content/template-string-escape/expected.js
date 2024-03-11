import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Escape \`me\`</div>`;
const $fragment2 = parseFragment`<div data-message="Escape \`me\`"${3}></div>`;
const $fragment3 = parseFragment`<div${3}><!-- Escape \`me\` --></div>`;
const $fragment4 = parseFragment`<xmp${3}>Escape \`me\`</xmp>`;
const $fragment5 = parseFragment`<div${3}>Escape \\\`me\`</div>`;
const $fragment6 = parseFragment`<div data-message="Escape \\\`me\`"${3}></div>`;
const $fragment7 = parseFragment`<div${3}><!-- Escape \\\`me\` --></div>`;
const $fragment8 = parseFragment`<xmp${3}>Escape \\\`me\`</xmp>`;
const $fragment9 = parseFragment`<div data-message="Escape \${me}"${3}></div>`;
const $fragment10 = parseFragment`<div${3}><!-- Escape \${me} --></div>`;
const stc0 = {
  key: 8,
};
const stc1 = {
  key: 11,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  return [
    api_static_fragment($fragment1(), 0),
    api_static_fragment($fragment2(), 1),
    api_static_fragment($fragment3(), 2),
    api_static_fragment($fragment4(), 3),
    api_static_fragment($fragment5(), 4),
    api_static_fragment($fragment6(), 5),
    api_static_fragment($fragment7(), 6),
    api_static_fragment($fragment8(), 7),
    api_element("div", stc0, [
      api_text("Escape $" + api_dynamic_text($cmp.me)),
    ]),
    api_static_fragment($fragment9(), 9),
    api_static_fragment($fragment10(), 10),
    api_element("xmp", stc1, [
      api_text("Escape $" + api_dynamic_text($cmp.me)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
