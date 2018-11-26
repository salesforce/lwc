(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __inKey = Proxy.inKey;

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
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("button", {
      classMap: {
        "child": true
      },
      key: 2,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick)),
        "childbuttonclick": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChildButtonClick") : $cmp.handleChildButtonClick))
      }
    }, [api_text("child button")]), api_slot("", {
      key: 3
    }, [], $slotset)];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
  });

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

  function guid() {
    __setKey(guid, "count", (guid._ES5ProxyType ? guid.get("count") : guid.count) || 1);

    return __setKeyPostfixIncrement(guid, "count");
  }

  var EVENT = {
    // event-flow.js
    SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT: guid(),
    // parent.js
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOTTED_BUTTON: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_SLOTTED_BUTTON: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD: guid(),
    // child.js
    SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD: guid(),
    SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_BUTTON: guid(),
    CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_TEMPLATE_LISTENER__BOUND_TO_CHILD_BUTTON: guid()
  };
  var GUID_TO_NAME_MAP = __callKey2(Object.compatKeys(EVENT), "reduce", function (map, key) {
    __setKey(map, EVENT._ES5ProxyType ? EVENT.get(key) : EVENT[key], key);

    return map;
  }, {});

  var Child =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Child, _LightningElement);

    _createClass(Child, [{
      key: "log",
      value: function log(guid) {
        __callKey1(this, "dispatchEvent", new CustomEvent('log', {
          bubbles: true,
          composed: true,
          detail: {
            guid: guid
          }
        }));
      }
    }]);

    function Child() {
      var _this;

      _classCallCheck(this, Child);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(Child), "call", this)); // Custom element

      __callKey2(_this, "addEventListener", 'slottedbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
      });

      __callKey2(_this, "addEventListener", 'childbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD);
      }); // Shadow root


      __callKey2(_this._ES5ProxyType ? _this.get("template") : _this.template, "addEventListener", 'slottedbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
      });

      __callKey2(_this._ES5ProxyType ? _this.get("template") : _this.template, "addEventListener", 'childbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_CONSTRUCTOR_LISTENER__BOUND_TO_CHILD_ROOT);
      });

      return _this;
    }

    _createClass(Child, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var _this2 = this;

        if (!(this._ES5ProxyType ? this.get("rendered") : this.rendered)) {
          __setKey(this, "rendered", true); // Custom element


          __callKey2(this, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
          });

          __callKey2(this, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
          }); // Shadow root


          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
          });

          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_ROOT);
          }); // Button


          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'button.child'), "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_BUTTON") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD_BUTTON);
          }); // Slot


          var slot = __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'slot');

          if (slot) {
            __callKey2(slot, "addEventListener", 'slottedbuttonclick', function (event) {
              __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_CHILD_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOT);
            });
          }
        }
      }
    }, {
      key: "handleChildButtonClick",
      value: function handleChildButtonClick(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_TEMPLATE_LISTENER__BOUND_TO_CHILD_BUTTON") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_CHILD_TEMPLATE_LISTENER__BOUND_TO_CHILD_BUTTON);
      }
    }, {
      key: "handleClick",
      value: function handleClick(event) {
        __callKey1(event._ES5ProxyType ? event.get("target") : event.target, "dispatchEvent", new CustomEvent('childbuttonclick', {
          bubbles: true,
          composed: true
        }));
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3,
        _m4 = $ctx._ES5ProxyType ? $ctx.get("_m4") : $ctx._m4,
        _m5 = $ctx._ES5ProxyType ? $ctx.get("_m5") : $ctx._m5;

    return [api_element("div", {
      key: 2,
      on: {
        "slottedbuttonclick": _m4 || __setKey($ctx, "_m4", api_bind($cmp._ES5ProxyType ? $cmp.get("handleSlottedButtonClickOnDiv") : $cmp.handleSlottedButtonClickOnDiv)),
        "childbuttonclick": _m5 || __setKey($ctx, "_m5", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChildButtonClickOnDiv") : $cmp.handleChildButtonClickOnDiv))
      }
    }, [api_custom_element("integration-child", _integrationChild, {
      key: 3,
      on: {
        "slottedbuttonclick": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleSlottedButtonClickOnChild") : $cmp.handleSlottedButtonClickOnChild)),
        "childbuttonclick": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChildButtonClickOnChild") : $cmp.handleChildButtonClickOnChild))
      }
    }, [api_element("button", {
      classMap: {
        "slotted": true
      },
      key: 4,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleSlottedClick") : $cmp.handleSlottedClick)),
        "slottedbuttonclick": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleSlottedButtonClickOnSlottedButton") : $cmp.handleSlottedButtonClickOnSlottedButton))
      }
    }, [api_text("slotted button")])])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-parent_parent-host",
    shadowAttribute: "integration-parent_parent"
  });

  var Parent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Parent, _LightningElement);

    _createClass(Parent, [{
      key: "log",
      value: function log(guid) {
        __callKey1(this, "dispatchEvent", new CustomEvent('log', {
          bubbles: true,
          composed: true,
          detail: {
            guid: guid
          }
        }));
      }
    }]);

    function Parent() {
      var _this;

      _classCallCheck(this, Parent);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(Parent), "call", this)); // Custom element

      __callKey2(_this, "addEventListener", 'slottedbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT);
      });

      __callKey2(_this, "addEventListener", 'childbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT);
      }); // Shadow root


      __callKey2(_this._ES5ProxyType ? _this.get("template") : _this.template, "addEventListener", 'slottedbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT);
      });

      __callKey2(_this._ES5ProxyType ? _this.get("template") : _this.template, "addEventListener", 'childbuttonclick', function (event) {
        __callKey1(_this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_CONSTRUCTOR_LISTENER__BOUND_TO_PARENT_ROOT);
      });

      return _this;
    }

    _createClass(Parent, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var _this2 = this;

        if (!(this._ES5ProxyType ? this.get("rendered") : this.rendered)) {
          __setKey(this, "rendered", true); // Custom element


          __callKey2(this, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
          });

          __callKey2(this, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
          }); // Shadow root


          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT);
          });

          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT_ROOT);
          }); // Child


          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-child'), "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
          });

          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-child'), "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_CHILD);
          }); // Buttons


          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'button.slotted'), "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOTTED_BUTTON") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_SLOTTED_BUTTON);
          }); // Wrapping div


          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'div'), "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV);
          });

          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'div'), "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this2, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_RENDEREDCALLBACK_LISTENER__BOUND_TO_DIV);
          });
        }
      }
    }, {
      key: "handleSlottedButtonClickOnDiv",
      value: function handleSlottedButtonClickOnDiv(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV);
      }
    }, {
      key: "handleChildButtonClickOnDiv",
      value: function handleChildButtonClickOnDiv(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_DIV);
      }
    }, {
      key: "handleSlottedButtonClickOnChild",
      value: function handleSlottedButtonClickOnChild(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD);
      }
    }, {
      key: "handleChildButtonClickOnChild",
      value: function handleChildButtonClickOnChild(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_CHILD);
      }
    }, {
      key: "handleSlottedButtonClickOnSlottedButton",
      value: function handleSlottedButtonClickOnSlottedButton(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_SLOTTED_BUTTON") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_PARENT_TEMPLATE_LISTENER__BOUND_TO_SLOTTED_BUTTON);
      }
    }, {
      key: "handleSlottedClick",
      value: function handleSlottedClick(event) {
        __callKey1(event._ES5ProxyType ? event.get("target") : event.target, "dispatchEvent", new CustomEvent('slottedbuttonclick', {
          bubbles: true,
          composed: true
        }));
      }
    }]);

    return Parent;
  }(lwc.LightningElement);

  var _integrationParent = lwc.registerComponent(Parent, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2;

    return [api_custom_element("integration-parent", _integrationParent, {
      key: 2,
      on: {
        "slottedbuttonclick": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleSlottedButtonClick") : $cmp.handleSlottedButtonClick)),
        "childbuttonclick": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChildButtonClick") : $cmp.handleChildButtonClick))
      }
    }, []), api_element("button", {
      classMap: {
        "clear": true
      },
      key: 3,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClearButtonClick") : $cmp.handleClearButtonClick))
      }
    }, [api_text("clear logs")]), api_element("ol", {
      classMap: {
        "logs": true
      },
      key: 4
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("_logs") : $cmp._logs, function (log) {
      return api_element("li", {
        key: api_key(6, log._ES5ProxyType ? log.get("eventName") : log.eventName)
      }, [api_element("pre", {
        key: 7
      }, [api_dynamic(log._ES5ProxyType ? log.get("eventName") : log.eventName)])]);
    }))];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-event-flow_event-flow-host",
    shadowAttribute: "integration-event-flow_event-flow"
  });

  var EventFlow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(EventFlow, _LightningElement);

    function EventFlow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, EventFlow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(EventFlow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "_logs", []);

      return _this;
    } // Expose these "constants" to the test suite


    _createClass(EventFlow, [{
      key: "log",
      value: function log(guid) {
        if (!guid || !(GUID_TO_NAME_MAP._ES5ProxyType ? GUID_TO_NAME_MAP.get(guid) : GUID_TO_NAME_MAP[guid])) {
          throw new Event(__concat("The guid \"", guid, "\" does not exist."));
        }

        (this._ES5ProxyType ? this.get("_logs") : this._logs).push({
          guid: guid,
          eventName: GUID_TO_NAME_MAP._ES5ProxyType ? GUID_TO_NAME_MAP.get(guid) : GUID_TO_NAME_MAP[guid]
        });
      }
    }, {
      key: "connectedCallback",
      value: function connectedCallback() {
        var _this2 = this;

        __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'log', function (event) {
          var _detail, _guid;

          __callKey1(_this2, "log", (_detail = event._ES5ProxyType ? event.get("detail") : event.detail, _guid = _detail._ES5ProxyType ? _detail.get("guid") : _detail.guid));
        });
      }
    }, {
      key: "renderedCallback",
      value: function renderedCallback() {
        var _this3 = this;

        if (!(this._ES5ProxyType ? this.get("rendered") : this.rendered)) {
          __setKey(this, "rendered", true);

          __callKey2(this, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
          });

          __callKey2(this, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW);
          });

          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
          });

          __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_EVENT_FLOW_ROOT);
          });

          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-parent'), "addEventListener", 'slottedbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
          });

          __callKey2(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-parent'), "addEventListener", 'childbuttonclick', function (event) {
            __callKey1(_this3, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_RENDEREDCALLBACK_LISTENER__BOUND_TO_PARENT);
          });
        }
      }
    }, {
      key: "handleSlottedButtonClick",
      value: function handleSlottedButtonClick(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT") : EVENT.SLOTTED_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
      }
    }, {
      key: "handleChildButtonClick",
      value: function handleChildButtonClick(event) {
        __callKey1(this, "log", EVENT._ES5ProxyType ? EVENT.get("CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT") : EVENT.CHILD_BUTTON_CLICK__HANDLED_BY_EVENT_FLOW_TEMPLATE_LISTENER__BOUND_TO_PARENT);
      }
    }, {
      key: "handleClearButtonClick",
      value: function handleClearButtonClick(event) {
        __setKey(this._ES5ProxyType ? this.get("_logs") : this._logs, "length", 0);
      }
    }, {
      key: "EVENT",
      get: function get() {
        return {
          EVENT: EVENT,
          GUID_TO_NAME_MAP: GUID_TO_NAME_MAP
        };
      }
    }, {
      key: "logs",
      get: function get() {
        return lwc.unwrap(this._ES5ProxyType ? this.get("_logs") : this._logs);
      }
    }]);

    return EventFlow;
  }(lwc.LightningElement);

  lwc.registerDecorators(EventFlow, {
    publicProps: {
      EVENT: {
        config: 1
      },
      logs: {
        config: 1
      }
    },
    track: {
      _logs: 1
    }
  });

  var Cmp = lwc.registerComponent(EventFlow, {
    tmpl: _tmpl$2
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-event-flow', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
