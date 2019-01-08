var TestUtils = (function (lwc) {
    function createElement(name, config) {
        config = Object.assign({}, config, {
            fallback: false,
        });

        return lwc.createElement(name, config);
    }

    return {
        createElement,
    };
})(Engine);

