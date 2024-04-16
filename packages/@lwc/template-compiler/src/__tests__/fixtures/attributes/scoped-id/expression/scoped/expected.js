import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:aria-describedby"}${"a0:aria-activedescendant"}${"a0:aria-errormessage"}${"a0:aria-flowto"}${"a0:aria-labelledby"}${"a0:aria-controls"}${"a0:aria-details"}${"a0:aria-owns"}${"a0:for"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            "aria-describedby": api_scoped_id($cmp.foo),
            "aria-activedescendant": api_scoped_id($cmp.foo),
            "aria-errormessage": api_scoped_id($cmp.foo),
            "aria-flowto": api_scoped_id($cmp.foo),
            "aria-labelledby": api_scoped_id($cmp.foo),
            "aria-controls": api_scoped_id($cmp.foo),
            "aria-details": api_scoped_id($cmp.foo),
            "aria-owns": api_scoped_id($cmp.foo),
            for: api_scoped_id($cmp.foo),
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
