export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {
            style: {
                fontSize: "12px",
                color: "red",
                marginLeft: "5px",
                marginRight: "5px",
                marginTop: "10px",
                marginBottom: "10px"
            }
        },
        []
    )];
}
