(function(a) {
    "use strict";
    function b(a, b) {
      if (!(a instanceof b))
        throw new TypeError("Cannot call a class as a function");
    }
    function c(a, b) {
      for (var c, d = 0; d < l(b, "length"); d++)
        (c = l(b, d)),
          m(c, "enumerable", l(c, "enumerable") || !1),
          m(c, "configurable", !0),
          n(c, "value") && m(c, "writable", !0),
          Object.compatDefineProperty(a, l(c, "key"), c);
    }
    function d(a, b, d) {
      return b && c(l(a, "prototype"), b), d && c(a, d), a;
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
    function g(a) {
      return (
        (g = Object.setPrototypeOf
          ? Object.getPrototypeOf
          : function(a) {
              return p(a, "__proto__") || Object.getPrototypeOf(a);
            }),
        g(a)
      );
    }
    function h(a, b) {
      return (
        (h =
          Object.setPrototypeOf ||
          function(a, b) {
            return q(a, "__proto__", b), a;
          }),
        h(a, b)
      );
    }
    function i(a, b) {
      if ("function" != typeof b && null !== b)
        throw new TypeError("Super expression must either be null or a function");
      o(
        a,
        "prototype",
        Object.create(b && r(b, "prototype"), {
          constructor: { value: a, writable: !0, configurable: !0 }
        })
      ),
        b && h(a, b);
    }
    function j(a, b) {
      var c = u(a, "d"),
        d = u(a, "h");
      return [d("div", { key: 1 }, [c(u(b, "x"))])];
    }
    function k(a) {
      var b = D(a, "c"),
        c = D(a, "h");
      return [
        c("div", { classMap: { container: !0 }, key: 2 }, [
          b("x-foo", C, { props: { x: "1" }, key: 1 }, [])
        ])
      ];
    }
    var l = Proxy.getKey,
      m = Proxy.setKey,
      n = Proxy.inKey,
      p = Proxy.getKey,
      q = Proxy.setKey,
      o = Proxy.setKey,
      r = Proxy.getKey,
      s = void 0,
      t = void 0,
      u = Proxy.getKey,
      v = Proxy.setKey,
      w = Proxy.callKey1;
    if (t) {
      v(j, "hostToken", "x-foo_foo-host"), v(j, "shadowToken", "x-foo_foo");
      var x = w(document, "createElement", "style");
      v(x, "type", "text/css"),
        v(u(x, "dataset"), "token", "x-foo_foo"),
        v(x, "textContent", t("x-foo_foo")),
        w(u(document, "head"), "appendChild", x);
    }
    var y = Proxy.setKey,
      z = Proxy.callKey2,
      A = Proxy.getKey,
      B = Proxy.concat,
      C = /*#__PURE__*/ (function(a) {
        function c() {
          var a, d;
          b(this, c);
          for (var e, h = arguments.length, i = Array(h), j = 0; j < h; j++)
            y(i, j, arguments[j]);
          return f(
            d,
            ((e = d = f(
              this,
              z(A((a = g(c)), "call"), "apply", a, B([this], i))
            )),
            y(d, "x", void 0),
            e)
          );
        }
        return (
          i(c, a),
          d(c, [
            {
              key: "render",
              value: function() {
                return j;
              }
            }
          ]),
          c
        );
      })(a.Element);
    y(C, "publicProps", { x: { config: 0 } });
    var D = Proxy.getKey,
      E = Proxy.setKey,
      F = Proxy.callKey1;
    if (s) {
      E(k, "hostToken", "x-app_app-host"), E(k, "shadowToken", "x-app_app");
      var G = F(document, "createElement", "style");
      E(G, "type", "text/css"),
        E(D(G, "dataset"), "token", "x-app_app"),
        E(G, "textContent", s("x-app_app")),
        F(D(document, "head"), "appendChild", G);
    }
    var H = Proxy.callKey1,
      I = Proxy.setKey,
      J = /*#__PURE__*/ (function(a) {
        function c() {
          var a;
          return (
            b(this, c), (a = f(this, H(g(c), "call", this))), I(a, "list", []), a
          );
        }
        return (
          i(c, a),
          d(c, [
            {
              key: "render",
              value: function() {
                return k;
              }
            }
          ]),
          c
        );
      })(a.Element),
      K = Proxy.callKey1,
      L = K(document, "getElementById", "main"),
      M = a.createElement("x-app", { is: J });
    K(L, "appendChild", M);
  })(engine);
