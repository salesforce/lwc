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
      var b = z(a, "c"),
        c = z(a, "h");
      return [
        c("div", { classMap: { container: !0 }, key: 2 }, [
          b("x-foo", y, { props: { x: "1" }, key: 1 })
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
      r = Proxy.setKey,
      s = Proxy.callKey1;
    if (p) {
      r(h, "token", "x-foo_foo");
      var t = s(document, "createElement", "style");
      r(t, "type", "text/css"),
        r(q(t, "dataset"), "token", "x-foo_foo"),
        r(t, "textContent", p("x-foo", "x-foo_foo")),
        s(q(document, "head"), "appendChild", t);
    }
    var u = Proxy.setKey,
      v = Proxy.callKey2,
      w = Proxy.getKey,
      x = Proxy.concat,
      y = (function(a) {
        function c() {
          var a, d;
          b(this, c);
          for (var e, g = arguments.length, h = Array(g), i = 0; i < g; i++)
            u(h, i, arguments[i]);
          return f(
            d,
            ((e = d = f(
              this,
              v(
                w((a = w(c, "__proto__") || Object.getPrototypeOf(c)), "call"),
                "apply",
                a,
                x([this], h)
              )
            )),
            u(d, "x", void 0),
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
    u(y, "publicProps", { x: { config: 0 } });
    var z = Proxy.getKey,
      A = Proxy.setKey,
      B = Proxy.callKey1;
    if (o) {
      A(i, "token", "x-app_app");
      var C = B(document, "createElement", "style");
      A(C, "type", "text/css"),
        A(z(C, "dataset"), "token", "x-app_app"),
        A(C, "textContent", o("x-app", "x-app_app")),
        B(z(document, "head"), "appendChild", C);
    }
    var D = Proxy.callKey1,
      E = Proxy.getKey,
      F = Proxy.setKey,
      G = (function(a) {
        function c() {
          var a;
          return (
            b(this, c),
            (a = f(
              this,
              D(E(c, "__proto__") || Object.getPrototypeOf(c), "call", this)
            )),
            F(a, "list", []),
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
      H = Proxy.callKey1,
      I = H(document, "getElementById", "main"),
      J = a.createElement("x-app", { is: G });
    H(I, "appendChild", J);
  })(engine);
