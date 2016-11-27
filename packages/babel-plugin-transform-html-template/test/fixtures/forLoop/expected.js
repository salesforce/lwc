export default function ({
    i,
    f,
    e,
    h
}) {
    return h(
        "section",
        null,
        [i(this.items, (item, index) => {
            return h(
                "div",
                { "class": "my-list" },
                [h(
                    "p",
                    null,
                    ["items"]
                )]
            );
        })]
    );
}
