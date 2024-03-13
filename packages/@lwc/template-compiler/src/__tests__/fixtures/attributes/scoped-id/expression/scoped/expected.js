import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element } = $api;
  return [
    api_element("div", {
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
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
