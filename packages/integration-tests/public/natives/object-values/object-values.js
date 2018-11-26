(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __inKey = Proxy.inKey;

  var __setKey = Proxy.setKey;

  function _defineProperty(obj, key, value) {
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey(obj, key, value);
    }

    return obj;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < (props._ES5ProxyType ? props.get("length") : props.length); i++) {
      var descriptor = props._ES5ProxyType ? props.get(i) : props[i];

      __setKey(descriptor, "enumerable", (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) || false);

      __setKey(descriptor, "configurable", true);

      if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
      Object.compatDefineProperty(target, descriptor._ES5ProxyType ? descriptor.get("key") : descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor._ES5ProxyType ? Constructor.get("prototype") : Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      __setKey(o, "__proto__", p);

      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    __setKey(subClass, "prototype", Object.create(superClass && (superClass._ES5ProxyType ? superClass.get("prototype") : superClass.prototype), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));

    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d;
    return [api_element("h1", {
      key: 2
    }, [api_text("Plain Object")]), api_element("div", {
      classMap: {
        "simple": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("simple") : $cmp.simple)]), api_element("div", {
      classMap: {
        "array-like": true
      },
      key: 4
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayLike") : $cmp.arrayLike)]), api_element("div", {
      classMap: {
        "unordered": true
      },
      key: 5
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("unordered") : $cmp.unordered)]), api_element("div", {
      classMap: {
        "not-enumerable": true
      },
      key: 6
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("notEnumerable") : $cmp.notEnumerable)]), api_element("div", {
      classMap: {
        "non-object": true
      },
      key: 7
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("nonObject") : $cmp.nonObject)]), api_element("div", {
      classMap: {
        "symbol": true
      },
      key: 8
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("symbol") : $cmp.symbol)]), api_element("hr", {
      key: 9
    }, []), api_element("h1", {
      key: 10
    }, [api_text("Proxy Object")]), api_element("div", {
      classMap: {
        "simple-proxy": true
      },
      key: 11
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("simpleProxy") : $cmp.simpleProxy)]), api_element("div", {
      classMap: {
        "array-like-proxy": true
      },
      key: 12
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayLikeProxy") : $cmp.arrayLikeProxy)]), api_element("div", {
      classMap: {
        "unordered-proxy": true
      },
      key: 13
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("unorderedProxy") : $cmp.unorderedProxy)]), api_element("div", {
      classMap: {
        "not-enumerable-proxy": true
      },
      key: 14
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("notEnumerableProxy") : $cmp.notEnumerableProxy)]), api_element("div", {
      classMap: {
        "symbol-proxy": true
      },
      key: 15
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("symbolProxy") : $cmp.symbolProxy)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-object-values_object-values-host",
    shadowAttribute: "integration-object-values_object-values"
  });

  var ObjectValues =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ObjectValues, _LightningElement);

    function ObjectValues() {
      _classCallCheck(this, ObjectValues);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ObjectValues), "apply", this, arguments));
    }

    _createClass(ObjectValues, [{
      key: "simple",
      // Plain Object
      // ============
      get: function get() {
        return __callKey1(Object.compatValues({
          x: 'x',
          y: 42
        }), "join", '|');
      }
    }, {
      key: "arrayLike",
      get: function get() {
        return __callKey1(Object.compatValues({
          0: 'a',
          1: 'b',
          2: 'c'
        }), "join", '|');
      }
    }, {
      key: "unordered",
      get: function get() {
        return __callKey1(Object.compatValues({
          100: 'a',
          2: 'b',
          7: 'c'
        }), "join", '|');
      }
    }, {
      key: "notEnumerable",
      get: function get() {
        var myObj = Object.create({}, {
          x: {
            value: function value() {
              return this._ES5ProxyType ? this.get("z") : this.z;
            },
            enumerable: false
          },
          y: {
            value: 'y',
            enumerable: false
          },
          z: {
            value: 'z',
            enumerable: true
          }
        });
        return __callKey1(Object.compatValues(myObj), "join", '|');
      }
    }, {
      key: "nonObject",
      get: function get() {
        return __callKey1(Object.compatValues('foo'), "join", '|');
      }
    }, {
      key: "symbol",
      get: function get() {
        return __callKey1(Object.compatValues(_defineProperty({
          x: 'x',
          y: 42
        }, Symbol('z'), 'z')), "join", '|');
      } // Proxy Object
      // ============

    }, {
      key: "simpleProxy",
      get: function get() {
        var proxy = new Proxy({
          x: 'x',
          y: 42
        }, {});
        return __callKey1(Object.compatValues(proxy), "join", '|');
      }
    }, {
      key: "arrayLikeProxy",
      get: function get() {
        var proxy = new Proxy({
          0: 'a',
          1: 'b',
          2: 'c'
        }, {});
        return __callKey1(Object.compatValues(proxy), "join", '|');
      }
    }, {
      key: "unorderedProxy",
      get: function get() {
        var proxy = new Proxy({
          100: 'a',
          2: 'b',
          7: 'c'
        }, {});
        return __callKey1(Object.compatValues(proxy), "join", '|');
      }
    }, {
      key: "notEnumerableProxy",
      get: function get() {
        var obj = Object.create({}, {
          x: {
            value: function value() {
              return this._ES5ProxyType ? this.get("z") : this.z;
            },
            enumerable: false
          },
          y: {
            value: 'y',
            enumerable: false
          },
          z: {
            value: 'z',
            enumerable: true
          }
        });
        var proxy = new Proxy(obj, {});
        return __callKey1(Object.compatValues(proxy), "join", '|');
      }
    }, {
      key: "symbolProxy",
      get: function get() {
        var proxy = new Proxy(_defineProperty({
          x: 'x',
          y: 42
        }, Symbol('z'), 'z'), {});
        return __callKey1(Object.compatValues(proxy), "join", '|');
      }
    }]);

    return ObjectValues;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(ObjectValues, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-object-values', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
