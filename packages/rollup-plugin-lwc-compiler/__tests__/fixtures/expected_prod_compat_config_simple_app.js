(function(a) {
"use strict";
function b(a, b) {
    if (!(a instanceof b))
    throw new TypeError("Cannot call a class as a function");
}
function c(a, b) {
    for (var c, d = 0; d < j(b, "length"); d++)
    (c = j(b, d)),
        k(c, "enumerable", j(c, "enumerable") || !1),
        k(c, "configurable", !0),
        l(c, "value") && k(c, "writable", !0),
        Object.compatDefineProperty(a, j(c, "key"), c);
}
function d(a, b, d) {
    return b && c(j(a, "prototype"), b), d && c(a, d), a;
}
function e(a) {
    if (void 0 === a)
    throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
    );
    return a;
}
function f(a, b) {
    return b && ("object" == typeof b || "function" == typeof b) ? b : e(a);
}
function g(a, b) {
    if ("function" != typeof b && null !== b)
    throw new TypeError("Super expression must either be null or a function");
    m(
    a,
    "prototype",
    Object.create(b && n(b, "prototype"), {
        constructor: {
        value: a,
        enumerable: !1,
        writable: !0,
        configurable: !0
        }
    })
    ),
    b &&
        (Object.setPrototypeOf
        ? Object.setPrototypeOf(a, b)
        : m(a, "__proto__", b));
}
function h(a, b) {
    var c = q(a, "d"),
    d = q(a, "h");
    return [d("div", { key: 1 }, [c(q(b, "x"))])];
}
function i(a) {
    var b = y(a, "c"),
    c = y(a, "h");
    return [
    c("div", { classMap: { container: !0 }, key: 2 }, [
        b("x-foo", x, { props: { x: "1" }, key: 1 })
    ])
    ];
}
var j = Proxy.getKey,
    k = Proxy.setKey,
    l = Proxy.inKey,
    m = Proxy.setKey,
    n = Proxy.getKey,
    o = void 0,
    p = void 0,
    q = Proxy.getKey,
    r = Proxy.setKey;
if (p) {
    var s = "x-foo_foo";
    r(h, "token", s), r(h, "style", p("x-foo", s));
}
var t = Proxy.setKey,
    u = Proxy.callKey2,
    v = Proxy.getKey,
    w = Proxy.concat,
    x = (function(a) {
    function c() {
        var a, d;
        b(this, c);
        for (var e, g = arguments.length, h = Array(g), i = 0; i < g; i++)
        t(h, i, arguments[i]);
        return f(
        d,
        ((e = d = f(
            this,
            u(
            v((a = v(c, "__proto__") || Object.getPrototypeOf(c)), "call"),
            "apply",
            a,
            w([this], h)
            )
        )),
        t(d, "x", void 0),
        e)
        );
    }
    return (
        g(c, a),
        d(c, [
        {
            key: "render",
            value: function() {
            return h;
            }
        }
        ]),
        c
    );
    })(a.Element);
t(x, "publicProps", { x: { config: 0 } });
var y = Proxy.getKey,
    z = Proxy.setKey;
if (o) {
    var A = "x-app_app";
    z(i, "token", A), z(i, "style", o("x-app", A));
}
var B = Proxy.callKey1,
    C = Proxy.getKey,
    D = Proxy.setKey,
    E = (function(a) {
    function c() {
        var a;
        return (
        b(this, c),
        (a = f(
            this,
            B(C(c, "__proto__") || Object.getPrototypeOf(c), "call", this)
        )),
        D(a, "list", []),
        a
        );
    }
    return (
        g(c, a),
        d(c, [
        {
            key: "render",
            value: function() {
            return i;
            }
        }
        ]),
        c
    );
    })(a.Element),
    F = Proxy.callKey1,
    G = F(document, "getElementById", "main"),
    H = a.createElement("x-app", { is: E });
F(G, "appendChild", H);
})(engine);
