const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        [$api.h(
            "p",
            null,
            [$api.s($cmp.obj.sub)]
        )]
    )];
}
export const templateUsedIds = ["obj"];
