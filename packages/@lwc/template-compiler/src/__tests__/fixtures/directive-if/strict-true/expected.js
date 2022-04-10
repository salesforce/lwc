import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>1</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue === true
        ? api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)
        : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
