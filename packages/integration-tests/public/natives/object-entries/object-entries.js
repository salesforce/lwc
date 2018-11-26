(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  function _arrayWithHoles(arr) {
    if (Array.compatIsArray(arr)) return arr;
  }

  var __callKey0 = Proxy.callKey0;

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = __callKey0(arr, Symbol.iterator), _s; !(_n = (_s2 = _s = __callKey0(_i, "next"), _done = _s2._ES5ProxyType ? _s2.get("done") : _s2.done)); _n = true) {
        var _s2, _done;

        _arr.push(_s._ES5ProxyType ? _s.get("value") : _s.value);

        if (i && (_arr._ES5ProxyType ? _arr.get("length") : _arr.length) === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && (_i._ES5ProxyType ? _i.get("return") : _i["return"]) != null) __callKey0(_i, "return");
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

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
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("symbol") : $cmp.symbol)]), api_element("div", {
      classMap: {
        "iterable": true
      },
      key: 9
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("iterable") : $cmp.iterable)]), api_element("div", {
      classMap: {
        "array-operation": true
      },
      key: 10
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayOperation") : $cmp.arrayOperation)]), api_element("hr", {
      key: 11
    }, []), api_element("h1", {
      key: 12
    }, [api_text("Proxy Object")]), api_element("div", {
      classMap: {
        "simple-proxy": true
      },
      key: 13
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("simpleProxy") : $cmp.simpleProxy)]), api_element("div", {
      classMap: {
        "array-like-proxy": true
      },
      key: 14
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayLikeProxy") : $cmp.arrayLikeProxy)]), api_element("div", {
      classMap: {
        "unordered-proxy": true
      },
      key: 15
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("unorderedProxy") : $cmp.unorderedProxy)]), api_element("div", {
      classMap: {
        "not-enumerable-proxy": true
      },
      key: 16
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("notEnumerableProxy") : $cmp.notEnumerableProxy)]), api_element("div", {
      classMap: {
        "symbol-proxy": true
      },
      key: 17
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("symbolProxy") : $cmp.symbolProxy)]), api_element("div", {
      classMap: {
        "iterable-proxy": true
      },
      key: 18
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("iterableProxy") : $cmp.iterableProxy)]), api_element("div", {
      classMap: {
        "array-operation-proxy": true
      },
      key: 19
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayOperationProxy") : $cmp.arrayOperationProxy)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-object-entries_object-entries-host",
    shadowAttribute: "integration-object-entries_object-entries"
  });

  var ObjectEntries =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ObjectEntries, _LightningElement);

    function ObjectEntries() {
      _classCallCheck(this, ObjectEntries);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ObjectEntries), "apply", this, arguments));
    }

    _createClass(ObjectEntries, [{
      key: "simple",
      // Plain Object
      // ============
      get: function get() {
        return __callKey1(Object.compatEntries({
          x: 'x',
          y: 42
        }), "join", '|');
      }
    }, {
      key: "arrayLike",
      get: function get() {
        return __callKey1(Object.compatEntries({
          0: 'a',
          1: 'b',
          2: 'c'
        }), "join", '|');
      }
    }, {
      key: "unordered",
      get: function get() {
        return __callKey1(Object.compatEntries({
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
        return __callKey1(Object.compatEntries(myObj), "join", '|');
      }
    }, {
      key: "nonObject",
      get: function get() {
        return __callKey1(Object.compatEntries('foo'), "join", '|');
      }
    }, {
      key: "symbol",
      get: function get() {
        return __callKey1(Object.compatEntries(_defineProperty({
          x: 'x',
          y: 42
        }, Symbol('z'), 'z')), "join", '|');
      }
    }, {
      key: "iterable",
      get: function get() {
        var str = '';
        var obj = {
          x: 'x',
          y: 42
        };

        var _arr = Object.compatEntries(obj);

        for (var _i = 0; _i < (_arr._ES5ProxyType ? _arr.get("length") : _arr.length); _i++) {
          var _arr$_i = _slicedToArray(_arr._ES5ProxyType ? _arr.get(_i) : _arr[_i], 2),
              key = _arr$_i._ES5ProxyType ? _arr$_i.get(0) : _arr$_i[0],
              value = _arr$_i._ES5ProxyType ? _arr$_i.get(1) : _arr$_i[1];

          str += __concat(__concat("[", key, ":"), value, "]");
        }

        return str;
      }
    }, {
      key: "arrayOperation",
      get: function get() {
        return __callKey2(Object.compatEntries({
          x: 'x',
          y: 42
        }), "reduce", function (acc, _ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2._ES5ProxyType ? _ref2.get(0) : _ref2[0],
              value = _ref2._ES5ProxyType ? _ref2.get(1) : _ref2[1];

          return acc + __concat(__concat("[", key, ":"), value, "]");
        }, '');
      } // Proxy Object
      // ============

    }, {
      key: "simpleProxy",
      get: function get() {
        var proxy = new Proxy({
          x: 'x',
          y: 42
        }, {});
        return __callKey1(Object.compatEntries(proxy), "join", '|');
      }
    }, {
      key: "arrayLikeProxy",
      get: function get() {
        var proxy = new Proxy({
          0: 'a',
          1: 'b',
          2: 'c'
        }, {});
        return __callKey1(Object.compatEntries(proxy), "join", '|');
      }
    }, {
      key: "unorderedProxy",
      get: function get() {
        var proxy = new Proxy({
          100: 'a',
          2: 'b',
          7: 'c'
        }, {});
        return __callKey1(Object.compatEntries(proxy), "join", '|');
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
        return __callKey1(Object.compatEntries(proxy), "join", '|');
      }
    }, {
      key: "symbolProxy",
      get: function get() {
        var proxy = new Proxy(_defineProperty({
          x: 'x',
          y: 42
        }, Symbol('z'), 'z'), {});
        return __callKey1(Object.compatEntries(proxy), "join", '|');
      }
    }, {
      key: "iterableProxy",
      get: function get() {
        var str = '';
        var proxy = new Proxy({
          x: 'x',
          y: 42
        }, {});

        var _arr2 = Object.compatEntries(proxy);

        for (var _i2 = 0; _i2 < (_arr2._ES5ProxyType ? _arr2.get("length") : _arr2.length); _i2++) {
          var _arr2$_i = _slicedToArray(_arr2._ES5ProxyType ? _arr2.get(_i2) : _arr2[_i2], 2),
              key = _arr2$_i._ES5ProxyType ? _arr2$_i.get(0) : _arr2$_i[0],
              value = _arr2$_i._ES5ProxyType ? _arr2$_i.get(1) : _arr2$_i[1];

          str += __concat(__concat("[", key, ":"), value, "]");
        }

        return str;
      }
    }, {
      key: "arrayOperationProxy",
      get: function get() {
        var proxy = new Proxy({
          x: 'x',
          y: 42
        }, {});
        return __callKey2(Object.compatEntries(proxy), "reduce", function (acc, _ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
              key = _ref5._ES5ProxyType ? _ref5.get(0) : _ref5[0],
              value = _ref5._ES5ProxyType ? _ref5.get(1) : _ref5[1];

          return acc + __concat(__concat("[", key, ":"), value, "]");
        }, '');
      }
    }]);

    return ObjectEntries;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(ObjectEntries, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-object-entries', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
