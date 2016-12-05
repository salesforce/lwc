export default function ({
    i,
    f,
    e,
    h,
    v,
    s
}) {
    return h(
        "section",
        {},
        f([i(this.items, (item, index) => {
            return h(
                "div",
                {
                    "class": "my-list"
                },
                [h(
                    "p",
                    {},
                    ["items"]
                )]
            );
        })])
    );
}
export const usedIdentifiers = ["items"];
