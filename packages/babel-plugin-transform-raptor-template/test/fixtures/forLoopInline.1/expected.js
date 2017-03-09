const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "div",
                {
                    props: {
                        className: "my-list"
                    }
                },
                [$api.h(
                    "p",
                    {},
                    [$api.s(item)]
                )]
            );
        })
    )];
}
export const templateUsedIds = ["items"];
