import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input type="text"${3}>`;
const $fragment2 = parseFragment`<keygen name="name" challenge="some challenge" keytype="type" keyparams="some-params"${3}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_text("</input>"),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
