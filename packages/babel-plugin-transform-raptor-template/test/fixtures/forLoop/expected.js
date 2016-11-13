h(
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
