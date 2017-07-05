export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {
            styleMap: {
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
