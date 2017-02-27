const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
  const m = $cmp[memoized] || ($cmp[memoized] = {});
  return [$api.h(
    "section",
    {},
    [$api.h(
      "p",
      {
        dataset: {
          "foo": "1",
          "barBaz": "xyz"
        }
      },
      []
    )]
  )];
}
export const templateUsedIds = [];
