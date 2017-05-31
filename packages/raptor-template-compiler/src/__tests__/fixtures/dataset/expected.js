export default function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h(
    "section",
    {},
    [$api.h(
      "p",
      {
        attrs: {
          "data-foo": "1",
          "data-bar-baz": "xyz"
        }
      },
      []
    )]
  )];
}
