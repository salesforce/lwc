export default function tmpl($api, $cmp, $slotset, $ctx) {
  const m = $ctx.memoized || ($ctx.memoized = {});
  return [$api.h(
    "section",
    {},
    [$api.h(
      "p",
      {
        attrs: {
          "data--bar-baz": "xyz"
        }
      },
      []
    )]
  )];
}
