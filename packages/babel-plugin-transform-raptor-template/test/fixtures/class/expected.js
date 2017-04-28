export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {
            classMap: {
                foo: true,
                bar: true,
                "baz-fiz": true
            }
        },
        []
    )];
}
