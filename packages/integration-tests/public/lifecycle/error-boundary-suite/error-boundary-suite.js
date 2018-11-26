(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  var __inKey = Proxy.inKey;

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
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm child that throws in the constructor. You should not see me!")];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-childConstructorThrow_childConstructorThrow-host",
    shadowAttribute: "integration-childConstructorThrow_childConstructorThrow"
  });

  var ChildConstructorThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildConstructorThrow, _LightningElement);

    function ChildConstructorThrow() {
      var _this;

      _classCallCheck(this, ChildConstructorThrow);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(ChildConstructorThrow), "call", this));
      throw new Error('child-constructor-throw: triggered error');
      return _this;
    }

    return ChildConstructorThrow;
  }(lwc.LightningElement);

  var _integrationChildConstructorThrow = lwc.registerComponent(ChildConstructorThrow, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_text("I'm child 's wrapper"), api_custom_element("integration-child-constructor-throw", _integrationChildConstructorThrow, {
      key: 2
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-childConstructorWrapper_childConstructorWrapper-host",
    shadowAttribute: "integration-childConstructorWrapper_childConstructorWrapper"
  });

  var ChildConstructorThrow$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildConstructorThrow, _LightningElement);

    function ChildConstructorThrow() {
      _classCallCheck(this, ChildConstructorThrow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ChildConstructorThrow), "apply", this, arguments));
    }

    return ChildConstructorThrow;
  }(lwc.LightningElement);

  var _integrationChildConstructorWrapper = lwc.registerComponent(ChildConstructorThrow$1, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "constructor-altenative": true
      },
      key: 3
    }, [api_text("constructor alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-child-constructor-wrapper", _integrationChildConstructorWrapper, {
      key: 5
    }, []) : null];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildConstructorThrow_boundaryChildConstructorThrow-host",
    shadowAttribute: "integration-boundaryChildConstructorThrow_boundaryChildConstructorThrow"
  });

  var BoundaryChildConstructorThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildConstructorThrow, _LightningElement);

    function BoundaryChildConstructorThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildConstructorThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildConstructorThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildConstructorThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildConstructorThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildConstructorThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildConstructorThrow = lwc.registerComponent(BoundaryChildConstructorThrow, {
    tmpl: _tmpl$2
  });

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I throw in render method. You should not see me!")];
  }

  var _tmpl$3 = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "stylesheets", []);

  __setKey(tmpl$3, "stylesheetTokens", {
    hostAttribute: "integration-childRenderThrow_childRenderThrow-host",
    shadowAttribute: "integration-childRenderThrow_childRenderThrow"
  });

  var ChildRenderThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildRenderThrow, _LightningElement);

    function ChildRenderThrow() {
      _classCallCheck(this, ChildRenderThrow);

      return _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(ChildRenderThrow), "call", this));
    }

    _createClass(ChildRenderThrow, [{
      key: "render",
      value: function render() {
        throw new Error("Child thew an error during rendering");
      }
    }]);

    return ChildRenderThrow;
  }(lwc.LightningElement);

  var _integrationChildRenderThrow = lwc.registerComponent(ChildRenderThrow, {
    tmpl: _tmpl$3
  });

  function tmpl$4($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "render-altenative": true
      },
      key: 3
    }, [api_text("render alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_element("div", {
      key: 5
    }, [api_custom_element("integration-child-render-throw", _integrationChildRenderThrow, {
      key: 6
    }, [])]) : null];
  }

  var _tmpl$4 = lwc.registerTemplate(tmpl$4);

  __setKey(tmpl$4, "stylesheets", []);

  __setKey(tmpl$4, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildRenderThrow_boundaryChildRenderThrow-host",
    shadowAttribute: "integration-boundaryChildRenderThrow_boundaryChildRenderThrow"
  });

  var BoundaryChildRenderThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildRenderThrow, _LightningElement);

    function BoundaryChildRenderThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildRenderThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildRenderThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildRenderThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildRenderThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildRenderThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildRenderThrow = lwc.registerComponent(BoundaryChildRenderThrow, {
    tmpl: _tmpl$4
  });

  function tmpl$5($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm child that throws inside rendered callback. You should not see me!")];
  }

  var _tmpl$5 = lwc.registerTemplate(tmpl$5);

  __setKey(tmpl$5, "stylesheets", []);

  __setKey(tmpl$5, "stylesheetTokens", {
    hostAttribute: "integration-childRenderedThrow_childRenderedThrow-host",
    shadowAttribute: "integration-childRenderedThrow_childRenderedThrow"
  });

  var ChildRenderedThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildRenderedThrow, _LightningElement);

    function ChildRenderedThrow() {
      _classCallCheck(this, ChildRenderedThrow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ChildRenderedThrow), "apply", this, arguments));
    }

    _createClass(ChildRenderedThrow, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Child threw in renderedCallback");
      }
    }]);

    return ChildRenderedThrow;
  }(lwc.LightningElement);

  var _integrationChildRenderedThrow = lwc.registerComponent(ChildRenderedThrow, {
    tmpl: _tmpl$5
  });

  function tmpl$6($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "rendered-calback-altenative": true
      },
      key: 3
    }, [api_text("renderedCallback alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-child-rendered-throw", _integrationChildRenderedThrow, {
      key: 5
    }, []) : null];
  }

  var _tmpl$6 = lwc.registerTemplate(tmpl$6);

  __setKey(tmpl$6, "stylesheets", []);

  __setKey(tmpl$6, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildRenderedThrow_boundaryChildRenderedThrow-host",
    shadowAttribute: "integration-boundaryChildRenderedThrow_boundaryChildRenderedThrow"
  });

  var BoundaryChildRenderedThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildRenderedThrow, _LightningElement);

    function BoundaryChildRenderedThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildRenderedThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildRenderedThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildRenderedThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildRenderedThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildRenderedThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildRenderedThrow = lwc.registerComponent(BoundaryChildRenderedThrow, {
    tmpl: _tmpl$6
  });

  function tmpl$7($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm child that throws inside connected callback. You should not see me!")];
  }

  var _tmpl$7 = lwc.registerTemplate(tmpl$7);

  __setKey(tmpl$7, "stylesheets", []);

  __setKey(tmpl$7, "stylesheetTokens", {
    hostAttribute: "integration-childConnectedThrow_childConnectedThrow-host",
    shadowAttribute: "integration-childConnectedThrow_childConnectedThrow"
  });

  var ChildConnectedThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildConnectedThrow, _LightningElement);

    function ChildConnectedThrow() {
      _classCallCheck(this, ChildConnectedThrow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ChildConnectedThrow), "apply", this, arguments));
    }

    _createClass(ChildConnectedThrow, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        throw new Error("Child threw in connectedCallback");
      }
    }]);

    return ChildConnectedThrow;
  }(lwc.LightningElement);

  var _integrationChildConnectedThrow = lwc.registerComponent(ChildConnectedThrow, {
    tmpl: _tmpl$7
  });

  function tmpl$8($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "connected-callback-altenative": true
      },
      key: 3
    }, [api_text("connectedCallback alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-child-connected-throw", _integrationChildConnectedThrow, {
      key: 5
    }, []) : null];
  }

  var _tmpl$8 = lwc.registerTemplate(tmpl$8);

  __setKey(tmpl$8, "stylesheets", []);

  __setKey(tmpl$8, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildConnectedThrow_boundaryChildConnectedThrow-host",
    shadowAttribute: "integration-boundaryChildConnectedThrow_boundaryChildConnectedThrow"
  });

  var BoundaryChildConnectedThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildConnectedThrow, _LightningElement);

    function BoundaryChildConnectedThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildConnectedThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildConnectedThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildConnectedThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildConnectedThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildConnectedThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildConnectedThrow = lwc.registerComponent(BoundaryChildConnectedThrow, {
    tmpl: _tmpl$8
  });

  function tmpl$9($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_slot("offender", {
      attrs: {
        "name": "offender"
      },
      key: 2
    }, [], $slotset)];
  }

  var _tmpl$9 = lwc.registerTemplate(tmpl$9);

  __setKey(tmpl$9, "slots", ["offender"]);

  __setKey(tmpl$9, "stylesheets", []);

  __setKey(tmpl$9, "stylesheetTokens", {
    hostAttribute: "integration-childSlotHost_childSlotHost-host",
    shadowAttribute: "integration-childSlotHost_childSlotHost"
  });

  var ChildSlotThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildSlotThrow, _LightningElement);

    function ChildSlotThrow() {
      _classCallCheck(this, ChildSlotThrow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ChildSlotThrow), "apply", this, arguments));
    }

    return ChildSlotThrow;
  }(lwc.LightningElement);

  var _integrationChildSlotHost = lwc.registerComponent(ChildSlotThrow, {
    tmpl: _tmpl$9
  });

  function tmpl$a($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm a slot and i throw during rendereing")];
  }

  var _tmpl$a = lwc.registerTemplate(tmpl$a);

  __setKey(tmpl$a, "stylesheets", []);

  __setKey(tmpl$a, "stylesheetTokens", {
    hostAttribute: "integration-childSlotThrow_childSlotThrow-host",
    shadowAttribute: "integration-childSlotThrow_childSlotThrow"
  });

  var ChildSlotThrow$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildSlotThrow, _LightningElement);

    function ChildSlotThrow() {
      _classCallCheck(this, ChildSlotThrow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ChildSlotThrow), "apply", this, arguments));
    }

    _createClass(ChildSlotThrow, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Slot thew an error during rendering");
      }
    }]);

    return ChildSlotThrow;
  }(lwc.LightningElement);

  var _integrationChildSlotThrow = lwc.registerComponent(ChildSlotThrow$1, {
    tmpl: _tmpl$a
  });

  function tmpl$b($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "slot-altenative": true
      },
      key: 3
    }, [api_text("slot alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-child-slot-host", _integrationChildSlotHost, {
      key: 5
    }, [api_custom_element("integration-child-slot-throw", _integrationChildSlotThrow, {
      attrs: {
        "slot": "offender"
      },
      key: 6
    }, [])]) : null];
  }

  var _tmpl$b = lwc.registerTemplate(tmpl$b);

  __setKey(tmpl$b, "stylesheets", []);

  __setKey(tmpl$b, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildSlotThrow_boundaryChildSlotThrow-host",
    shadowAttribute: "integration-boundaryChildSlotThrow_boundaryChildSlotThrow"
  });

  var BoundaryChildSlotThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildSlotThrow, _LightningElement);

    function BoundaryChildSlotThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildSlotThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildSlotThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildSlotThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildSlotThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildSlotThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildSlotThrow = lwc.registerComponent(BoundaryChildSlotThrow, {
    tmpl: _tmpl$b
  });

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

  function tmpl$c($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("button", {
      classMap: {
        "self-rehydrate-trigger": true
      },
      key: 2,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Click")]), api_dynamic($cmp._ES5ProxyType ? $cmp.get("getCounter") : $cmp.getCounter)];
  }

  var _tmpl$c = lwc.registerTemplate(tmpl$c);

  __setKey(tmpl$c, "stylesheets", []);

  __setKey(tmpl$c, "stylesheetTokens", {
    hostAttribute: "integration-childSelfRehydrateThrow_childSelfRehydrateThrow-host",
    shadowAttribute: "integration-childSelfRehydrateThrow_childSelfRehydrateThrow"
  });

  var ChildRenderThrow$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ChildRenderThrow, _LightningElement);

    function ChildRenderThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, ChildRenderThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(ChildRenderThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "counter", 1);

      return _this;
    }

    _createClass(ChildRenderThrow, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        if ((this._ES5ProxyType ? this.get("counter") : this.counter) === 2) {
          throw new Error("Child thew an error during rendered callback");
        }
      }
    }, {
      key: "handleClick",
      value: function handleClick() {
        __setKeyPostfixIncrement(this, "counter");
      }
    }, {
      key: "getCounter",
      get: function get() {
        return this._ES5ProxyType ? this.get("counter") : this.counter;
      }
    }]);

    return ChildRenderThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(ChildRenderThrow$1, {
    track: {
      counter: 1
    }
  });

  var _integrationChildSelfRehydrateThrow = lwc.registerComponent(ChildRenderThrow$1, {
    tmpl: _tmpl$c
  });

  function tmpl$d($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "self-rehydrate-altenative": true
      },
      key: 3
    }, [api_text("self rehydrate alternative view")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_element("div", {
      key: 5
    }, [api_element("div", {
      key: 6
    }, [api_custom_element("integration-child-self-rehydrate-throw", _integrationChildSelfRehydrateThrow, {
      key: 7
    }, [])])]) : null];
  }

  var _tmpl$d = lwc.registerTemplate(tmpl$d);

  __setKey(tmpl$d, "stylesheets", []);

  __setKey(tmpl$d, "stylesheetTokens", {
    hostAttribute: "integration-boundaryChildSelfRehydrateThrow_boundaryChildSelfRehydrateThrow-host",
    shadowAttribute: "integration-boundaryChildSelfRehydrateThrow_boundaryChildSelfRehydrateThrow"
  });

  var BoundaryChildSelfRehydrateThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildSelfRehydrateThrow, _LightningElement);

    function BoundaryChildSelfRehydrateThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildSelfRehydrateThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildSelfRehydrateThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {});

      return _this;
    }

    _createClass(BoundaryChildSelfRehydrateThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }]);

    return BoundaryChildSelfRehydrateThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildSelfRehydrateThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryChildSelfRehydrateThrow = lwc.registerComponent(BoundaryChildSelfRehydrateThrow, {
    tmpl: _tmpl$d
  });

  function tmpl$e($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "boundary-alt-view-child": true
      },
      key: 2
    }, [api_text("First Error: I'm an alterntaive offender child! You should not see me either!")])];
  }

  var _tmpl$e = lwc.registerTemplate(tmpl$e);

  __setKey(tmpl$e, "stylesheets", []);

  __setKey(tmpl$e, "stylesheetTokens", {
    hostAttribute: "integration-nestedPostErrorChildView_nestedPostErrorChildView-host",
    shadowAttribute: "integration-nestedPostErrorChildView_nestedPostErrorChildView"
  });

  var PostErrorChildView =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(PostErrorChildView, _LightningElement);

    function PostErrorChildView() {
      _classCallCheck(this, PostErrorChildView);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(PostErrorChildView), "apply", this, arguments));
    }

    _createClass(PostErrorChildView, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Boundary Alternative Child Offender Throws");
      }
    }]);

    return PostErrorChildView;
  }(lwc.LightningElement);

  var _integrationNestedPostErrorChildView = lwc.registerComponent(PostErrorChildView, {
    tmpl: _tmpl$e
  });

  function tmpl$f($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm healthy child, but i throw in render method and am suppose to be unmounted. You should not see me")];
  }

  var _tmpl$f = lwc.registerTemplate(tmpl$f);

  __setKey(tmpl$f, "stylesheets", []);

  __setKey(tmpl$f, "stylesheetTokens", {
    hostAttribute: "integration-nestedPreErrorChildView_nestedPreErrorChildView-host",
    shadowAttribute: "integration-nestedPreErrorChildView_nestedPreErrorChildView"
  });

  var PreErrorChildView =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(PreErrorChildView, _LightningElement);

    function PreErrorChildView() {
      _classCallCheck(this, PreErrorChildView);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(PreErrorChildView), "apply", this, arguments));
    }

    _createClass(PreErrorChildView, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Boundary Initial Child Offender Throws");
      }
    }]);

    return PreErrorChildView;
  }(lwc.LightningElement);

  var _integrationNestedPreErrorChildView = lwc.registerComponent(PreErrorChildView, {
    tmpl: _tmpl$f
  });

  function tmpl$g($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2, _state3, _error3;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("p", {
      key: 2
    }, [api_text("Child Error: "), api_dynamic((_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error)), api_text(" ")]), (_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-nested-post-error-child-view", _integrationNestedPostErrorChildView, {
      key: 4
    }, []) : null, !(_state3 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error3 = _state3._ES5ProxyType ? _state3.get("error") : _state3.error) ? api_custom_element("integration-nested-pre-error-child-view", _integrationNestedPreErrorChildView, {
      key: 6
    }, []) : null];
  }

  var _tmpl$g = lwc.registerTemplate(tmpl$g);

  __setKey(tmpl$g, "stylesheets", []);

  __setKey(tmpl$g, "stylesheetTokens", {
    hostAttribute: "integration-nestedChildBoundaryViewThrow_nestedChildBoundaryViewThrow-host",
    shadowAttribute: "integration-nestedChildBoundaryViewThrow_nestedChildBoundaryViewThrow"
  });

  var BoundaryChildBoundaryAltViewThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildBoundaryAltViewThrow, _LightningElement);

    function BoundaryChildBoundaryAltViewThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildBoundaryAltViewThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildBoundaryAltViewThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        error: false,
        title: "initial"
      });

      return _this;
    }

    _createClass(BoundaryChildBoundaryAltViewThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", true);
      }
    }]);

    return BoundaryChildBoundaryAltViewThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildBoundaryAltViewThrow, {
    track: {
      state: 1
    }
  });

  var _integrationNestedChildBoundaryViewThrow = lwc.registerComponent(BoundaryChildBoundaryAltViewThrow, {
    tmpl: _tmpl$g
  });

  function tmpl$h($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "boundary-alt-view": true
      },
      key: 3
    }, [api_text("Host Boundary Alternative View")]) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-nested-child-boundary-view-throw", _integrationNestedChildBoundaryViewThrow, {
      key: 5
    }, []) : null];
  }

  var _tmpl$h = lwc.registerTemplate(tmpl$h);

  __setKey(tmpl$h, "stylesheets", []);

  __setKey(tmpl$h, "stylesheetTokens", {
    hostAttribute: "integration-nestedBoundaryChildAltViewThrow_nestedBoundaryChildAltViewThrow-host",
    shadowAttribute: "integration-nestedBoundaryChildAltViewThrow_nestedBoundaryChildAltViewThrow"
  });

  var NestedBoundaryHost =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(NestedBoundaryHost, _LightningElement);

    function NestedBoundaryHost() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, NestedBoundaryHost);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(NestedBoundaryHost), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        error: false,
        title: "initial"
      });

      return _this;
    }

    _createClass(NestedBoundaryHost, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", error);
      }
    }, {
      key: "renderedCallback",
      value: function renderedCallback() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "title", "post initial");
      }
    }]);

    return NestedBoundaryHost;
  }(lwc.LightningElement);

  lwc.registerDecorators(NestedBoundaryHost, {
    track: {
      state: 1
    }
  });

  var _integrationNestedBoundaryChildAltViewThrow = lwc.registerComponent(NestedBoundaryHost, {
    tmpl: _tmpl$h
  });

  function tmpl$i($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "boundary-alt-view-child": true
      },
      key: 2
    }, [api_text("I'm an alterntaive offender child! You SHOULD see me because i cause boundary error that can't recover!")])];
  }

  var _tmpl$i = lwc.registerTemplate(tmpl$i);

  __setKey(tmpl$i, "stylesheets", []);

  __setKey(tmpl$i, "stylesheetTokens", {
    hostAttribute: "integration-postErrorChildView_postErrorChildView-host",
    shadowAttribute: "integration-postErrorChildView_postErrorChildView"
  });

  var PostErrorChildView$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(PostErrorChildView, _LightningElement);

    function PostErrorChildView() {
      _classCallCheck(this, PostErrorChildView);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(PostErrorChildView), "apply", this, arguments));
    }

    _createClass(PostErrorChildView, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Boundary Alternative Child Offender Throws");
      }
    }]);

    return PostErrorChildView;
  }(lwc.LightningElement);

  var _integrationPostErrorChildView = lwc.registerComponent(PostErrorChildView$1, {
    tmpl: _tmpl$i
  });

  function tmpl$j($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("I'm offender child, will throw in rende method. You should not see me")];
  }

  var _tmpl$j = lwc.registerTemplate(tmpl$j);

  __setKey(tmpl$j, "stylesheets", []);

  __setKey(tmpl$j, "stylesheetTokens", {
    hostAttribute: "integration-preErrorChildView_preErrorChildView-host",
    shadowAttribute: "integration-preErrorChildView_preErrorChildView"
  });

  var PreErrorChildView$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(PreErrorChildView, _LightningElement);

    function PreErrorChildView() {
      _classCallCheck(this, PreErrorChildView);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(PreErrorChildView), "apply", this, arguments));
    }

    _createClass(PreErrorChildView, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        throw new Error("Boundary Initial Child Offender Throws");
      }
    }]);

    return PreErrorChildView;
  }(lwc.LightningElement);

  var _integrationPreErrorChildView = lwc.registerComponent(PreErrorChildView$1, {
    tmpl: _tmpl$j
  });

  function tmpl$k($api, $cmp, $slotset, $ctx) {
    var _state, _error, _state2, _error2;

    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_custom_element("integration-post-error-child-view", _integrationPostErrorChildView, {
      key: 3
    }, []) : null, !(_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error) ? api_custom_element("integration-pre-error-child-view", _integrationPreErrorChildView, {
      key: 5
    }, []) : null];
  }

  var _tmpl$k = lwc.registerTemplate(tmpl$k);

  __setKey(tmpl$k, "stylesheets", []);

  __setKey(tmpl$k, "stylesheetTokens", {
    hostAttribute: "integration-altChildBoundaryViewThrow_altChildBoundaryViewThrow-host",
    shadowAttribute: "integration-altChildBoundaryViewThrow_altChildBoundaryViewThrow"
  });

  var BoundaryChildBoundaryAltViewThrow$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryChildBoundaryAltViewThrow, _LightningElement);

    function BoundaryChildBoundaryAltViewThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryChildBoundaryAltViewThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryChildBoundaryAltViewThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        error: false,
        title: "initial"
      });

      return _this;
    }

    _createClass(BoundaryChildBoundaryAltViewThrow, [{
      key: "errorCallback",
      value: function errorCallback(error) {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", true);
      }
    }]);

    return BoundaryChildBoundaryAltViewThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryChildBoundaryAltViewThrow$1, {
    track: {
      state: 1
    }
  });

  var _integrationAltChildBoundaryViewThrow = lwc.registerComponent(BoundaryChildBoundaryAltViewThrow$1, {
    tmpl: _tmpl$k
  });

  function tmpl$l($api, $cmp, $slotset, $ctx) {
    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_custom_element("integration-alt-child-boundary-view-throw", _integrationAltChildBoundaryViewThrow, {
      key: 2
    }, [])];
  }

  var _tmpl$l = lwc.registerTemplate(tmpl$l);

  __setKey(tmpl$l, "stylesheets", []);

  __setKey(tmpl$l, "stylesheetTokens", {
    hostAttribute: "integration-boundaryAlternativeViewThrow_boundaryAlternativeViewThrow-host",
    shadowAttribute: "integration-boundaryAlternativeViewThrow_boundaryAlternativeViewThrow"
  });

  var BoundaryAltViewThrow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(BoundaryAltViewThrow, _LightningElement);

    function BoundaryAltViewThrow() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, BoundaryAltViewThrow);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(BoundaryAltViewThrow), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        error: false,
        title: "initial"
      });

      return _this;
    }

    return BoundaryAltViewThrow;
  }(lwc.LightningElement);

  lwc.registerDecorators(BoundaryAltViewThrow, {
    track: {
      state: 1
    }
  });

  var _integrationBoundaryAlternativeViewThrow = lwc.registerComponent(BoundaryAltViewThrow, {
    tmpl: _tmpl$l
  });

  function tmpl$m($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3,
        _m4 = $ctx._ES5ProxyType ? $ctx.get("_m4") : $ctx._m4,
        _m5 = $ctx._ES5ProxyType ? $ctx.get("_m5") : $ctx._m5,
        _m6 = $ctx._ES5ProxyType ? $ctx.get("_m6") : $ctx._m6,
        _m7 = $ctx._ES5ProxyType ? $ctx.get("_m7") : $ctx._m7;

    return [api_element("button", {
      classMap: {
        "boundary-child-constructor-throw": true
      },
      attrs: {
        "value": "boundary-child-constructor-throw"
      },
      key: 2,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child with cosntructor throw")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildConstructorThrow") : $cmp.getBoundaryChildConstructorThrow) ? api_custom_element("integration-boundary-child-constructor-throw", _integrationBoundaryChildConstructorThrow, {
      key: 3
    }, []) : null, api_element("br", {
      key: 4
    }, []), api_element("button", {
      classMap: {
        "boundary-child-render-throw": true
      },
      attrs: {
        "value": "boundary-child-render-throw"
      },
      key: 5,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child with render throw")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildRenderThrow") : $cmp.getBoundaryChildRenderThrow) ? api_custom_element("integration-boundary-child-render-throw", _integrationBoundaryChildRenderThrow, {
      key: 6
    }, []) : null, api_element("br", {
      key: 7
    }, []), api_element("button", {
      classMap: {
        "boundary-child-rendered-throw": true
      },
      attrs: {
        "value": "boundary-child-rendered-throw"
      },
      key: 8,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child with renderedCallback throw")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildRenderedThrow") : $cmp.getBoundaryChildRenderedThrow) ? api_custom_element("integration-boundary-child-rendered-throw", _integrationBoundaryChildRenderedThrow, {
      key: 9
    }, []) : null, api_element("br", {
      key: 10
    }, []), api_element("button", {
      classMap: {
        "boundary-child-connected-throw": true
      },
      attrs: {
        "value": "boundary-child-connected-throw"
      },
      key: 11,
      on: {
        "click": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child with connectedCallback throw")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildConnectedThrow") : $cmp.getBoundaryChildConnectedThrow) ? api_custom_element("integration-boundary-child-connected-throw", _integrationBoundaryChildConnectedThrow, {
      key: 12
    }, []) : null, api_element("br", {
      key: 13
    }, []), api_element("button", {
      classMap: {
        "boundary-child-slot-throw": true
      },
      attrs: {
        "value": "boundary-child-slot-throw"
      },
      key: 14,
      on: {
        "click": _m4 || __setKey($ctx, "_m4", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child with a slot that throws")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildSlotThrow") : $cmp.getBoundaryChildSlotThrow) ? api_custom_element("integration-boundary-child-slot-throw", _integrationBoundaryChildSlotThrow, {
      key: 15
    }, []) : null, api_element("br", {
      key: 16
    }, []), api_element("button", {
      classMap: {
        "boundary-child-self-rehydrate-throw": true
      },
      attrs: {
        "value": "boundary-child-self-rehydrate-throw"
      },
      key: 17,
      on: {
        "click": _m5 || __setKey($ctx, "_m5", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render child that throws during self rehydration")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryChildSelfRehydrateThrow") : $cmp.getBoundaryChildSelfRehydrateThrow) ? api_custom_element("integration-boundary-child-self-rehydrate-throw", _integrationBoundaryChildSelfRehydrateThrow, {
      key: 18
    }, []) : null, api_element("br", {
      key: 19
    }, []), api_element("button", {
      classMap: {
        "nested-boundary-child-alt-view-throw": true
      },
      attrs: {
        "value": "nested-boundary-child-alt-view-throw"
      },
      key: 20,
      on: {
        "click": _m6 || __setKey($ctx, "_m6", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render nested boundary. Inner boundary rethrows its failure to parent boundary recover")]), ($cmp._ES5ProxyType ? $cmp.get("getNestedBoundaryChildAltViewThrow") : $cmp.getNestedBoundaryChildAltViewThrow) ? api_custom_element("integration-nested-boundary-child-alt-view-throw", _integrationNestedBoundaryChildAltViewThrow, {
      key: 21
    }, []) : null, api_element("br", {
      key: 22
    }, []), api_element("button", {
      classMap: {
        "boundary-alternative-view-throw": true
      },
      attrs: {
        "value": "boundary-alternative-view-throw"
      },
      key: 23,
      on: {
        "click": _m7 || __setKey($ctx, "_m7", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Render boundary that fails to catch an error thrown while rendering its alternative view")]), ($cmp._ES5ProxyType ? $cmp.get("getBoundaryAltViewThrow") : $cmp.getBoundaryAltViewThrow) ? api_custom_element("integration-boundary-alternative-view-throw", _integrationBoundaryAlternativeViewThrow, {
      key: 24
    }, []) : null];
  }

  var _tmpl$m = lwc.registerTemplate(tmpl$m);

  __setKey(tmpl$m, "stylesheets", []);

  __setKey(tmpl$m, "stylesheetTokens", {
    hostAttribute: "integration-error-boundary-suite_error-boundary-suite-host",
    shadowAttribute: "integration-error-boundary-suite_error-boundary-suite"
  });

  var RootParent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RootParent, _LightningElement);

    function RootParent() {
      var _getPrototypeOf2, _this$state, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RootParent);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RootParent), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", (_this$state = {
        'boundary-child-constructor-throw': false,
        'boundary-child-render-throw': false,
        'boundary-child-rendered-throw': false,
        'boundary-child-connected-throw': false,
        'boundary-child-attr-changed-throw': false,
        'boundary-child-slot-throw': false
      }, _defineProperty(_this$state, "boundary-child-slot-throw", false), _defineProperty(_this$state, 'boundary-child-self-rehydrate-throw', false), _defineProperty(_this$state, 'boundary-alternative-view-throw', false), _this$state));

      return _this;
    }

    _createClass(RootParent, [{
      key: "handleClick",
      value: function handleClick(event) {
        var _currentTarget, _value;

        var value = (_currentTarget = event._ES5ProxyType ? event.get("currentTarget") : event.currentTarget, _value = _currentTarget._ES5ProxyType ? _currentTarget.get("value") : _currentTarget.value);

        __setKey(this._ES5ProxyType ? this.get("state") : this.state, value, true);
      }
    }, {
      key: "getBoundaryChildConstructorThrow",
      get: function get() {
        var _state, _boundaryChildConst;

        return _state = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildConst = _state._ES5ProxyType ? _state.get('boundary-child-constructor-throw') : _state['boundary-child-constructor-throw'];
      }
    }, {
      key: "getBoundaryChildRenderThrow",
      get: function get() {
        var _state2, _boundaryChildRende;

        return _state2 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildRende = _state2._ES5ProxyType ? _state2.get('boundary-child-render-throw') : _state2['boundary-child-render-throw'];
      }
    }, {
      key: "getBoundaryChildRenderedThrow",
      get: function get() {
        var _state3, _boundaryChildRende2;

        return _state3 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildRende2 = _state3._ES5ProxyType ? _state3.get('boundary-child-rendered-throw') : _state3['boundary-child-rendered-throw'];
      }
    }, {
      key: "getBoundaryChildConnectedThrow",
      get: function get() {
        var _state4, _boundaryChildConne;

        return _state4 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildConne = _state4._ES5ProxyType ? _state4.get('boundary-child-connected-throw') : _state4['boundary-child-connected-throw'];
      }
    }, {
      key: "getBoundaryChildAttrChangedThrow",
      get: function get() {
        var _state5, _boundaryChildAttr;

        return _state5 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildAttr = _state5._ES5ProxyType ? _state5.get('boundary-child-attr-changed-throw') : _state5['boundary-child-attr-changed-throw'];
      }
    }, {
      key: "getBoundaryChildSlotThrow",
      get: function get() {
        var _state6, _boundaryChildSlot;

        return _state6 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildSlot = _state6._ES5ProxyType ? _state6.get('boundary-child-slot-throw') : _state6['boundary-child-slot-throw'];
      }
    }, {
      key: "getBoundaryChildSelfRehydrateThrow",
      get: function get() {
        var _state7, _boundaryChildSelf;

        return _state7 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryChildSelf = _state7._ES5ProxyType ? _state7.get('boundary-child-self-rehydrate-throw') : _state7['boundary-child-self-rehydrate-throw'];
      }
    }, {
      key: "getBoundaryAltViewThrow",
      get: function get() {
        var _state8, _boundaryAlternative;

        return _state8 = this._ES5ProxyType ? this.get("state") : this.state, _boundaryAlternative = _state8._ES5ProxyType ? _state8.get('boundary-alternative-view-throw') : _state8['boundary-alternative-view-throw'];
      }
    }, {
      key: "getNestedBoundaryChildAltViewThrow",
      get: function get() {
        var _state9, _nestedBoundaryChil;

        return _state9 = this._ES5ProxyType ? this.get("state") : this.state, _nestedBoundaryChil = _state9._ES5ProxyType ? _state9.get('nested-boundary-child-alt-view-throw') : _state9['nested-boundary-child-alt-view-throw'];
      }
    }]);

    return RootParent;
  }(lwc.LightningElement);

  lwc.registerDecorators(RootParent, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(RootParent, {
    tmpl: _tmpl$m
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-error-boundary-suite', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
