(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  var __setKey = Proxy.setKey;

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
    Object.compatDefineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
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

    Object.compatDefineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
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
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var stc0$2 = {
    key: 0
  };
  var stc1$2 = {
    key: 1
  };
  var stc2$2 = {
    "placeholder": "child"
  };

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("h1", stc0$2, [api_text("child")]), api_element("ol", stc1$2, api_iterator($cmp._ES5ProxyType ? $cmp.get("formattedEvents") : $cmp.formattedEvents, function (event) {
      return api_element("li", {
        key: api_key(2, event)
      }, [api_text(api_dynamic_text(event))]);
    })), api_element("input", {
      attrs: stc2$2,
      key: 3,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur)),
        "blur": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur))
      }
    })];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$2() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Child = /*#__PURE__*/function (_LightningElement) {
    _inherits(Child, _LightningElement);

    var _super = _createSuper$2(Child);

    function Child() {
      var _this;

      _classCallCheck(this, Child);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "events", []);

      return _this;
    }

    _createClass(Child, [{
      key: "getEvents",
      value: function getEvents() {
        return this._ES5ProxyType ? this.get("events") : this.events;
      }
    }, {
      key: "handleFocusOrBlur",
      value: function handleFocusOrBlur(event) {
        var type = event._ES5ProxyType ? event.get("type") : event.type,
            relatedTarget = event._ES5ProxyType ? event.get("relatedTarget") : event.relatedTarget;
        (this._ES5ProxyType ? this.get("events") : this.events).push({
          type: type,
          relatedTarget: relatedTarget ? relatedTarget._ES5ProxyType ? relatedTarget.get("tagName") : relatedTarget.tagName : 'NULL'
        });
      }
    }, {
      key: "formattedEvents",
      get: function get() {
        return __callKey1(this._ES5ProxyType ? this.get("events") : this.events, "map", JSON.stringify);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Child;
  }(lwc.LightningElement);

  lwc.registerDecorators(Child, {
    publicMethods: ["getEvents"],
    track: {
      events: 1
    }
  });

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl$2
  });

  var stc0$1 = {
    key: 0
  };
  var stc1$1 = {
    key: 1
  };
  var stc2$1 = {
    "placeholder": "parent"
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3;

    return [api_element("h1", stc0$1, [api_text("parent")]), api_element("ol", stc1$1, api_iterator($cmp._ES5ProxyType ? $cmp.get("formattedEvents") : $cmp.formattedEvents, function (event) {
      return api_element("li", {
        key: api_key(2, event)
      }, [api_text(api_dynamic_text(event))]);
    })), api_element("input", {
      attrs: stc2$1,
      key: 3,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur)),
        "blur": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur))
      }
    }), api_custom_element("integration-child", _integrationChild, {
      key: 4,
      on: {
        "focus": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur)),
        "blur": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur))
      }
    })];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Parent = /*#__PURE__*/function (_LightningElement) {
    _inherits(Parent, _LightningElement);

    var _super = _createSuper$1(Parent);

    function Parent() {
      var _this;

      _classCallCheck(this, Parent);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "events", []);

      return _this;
    }

    _createClass(Parent, [{
      key: "getEvents",
      value: function getEvents() {
        return this._ES5ProxyType ? this.get("events") : this.events;
      }
    }, {
      key: "handleFocusOrBlur",
      value: function handleFocusOrBlur(event) {
        var type = event._ES5ProxyType ? event.get("type") : event.type,
            relatedTarget = event._ES5ProxyType ? event.get("relatedTarget") : event.relatedTarget;
        (this._ES5ProxyType ? this.get("events") : this.events).push({
          type: type,
          relatedTarget: relatedTarget ? relatedTarget._ES5ProxyType ? relatedTarget.get("tagName") : relatedTarget.tagName : 'NULL'
        });
      }
    }, {
      key: "formattedEvents",
      get: function get() {
        return __callKey1(this._ES5ProxyType ? this.get("events") : this.events, "map", JSON.stringify);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Parent;
  }(lwc.LightningElement);

  lwc.registerDecorators(Parent, {
    publicMethods: ["getEvents"],
    track: {
      events: 1
    }
  });

  var _integrationParent = lwc.registerComponent(Parent, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    key: 0
  };
  var stc1 = {
    key: 1
  };
  var stc2 = {
    "placeholder": "container"
  };
  var stc3 = {
    key: 4
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("h1", stc0, [api_text("container")]), api_element("ol", stc1, api_iterator($cmp._ES5ProxyType ? $cmp.get("formattedEvents") : $cmp.formattedEvents, function (event) {
      return api_element("li", {
        key: api_key(2, event)
      }, [api_text(api_dynamic_text(event))]);
    })), api_element("input", {
      attrs: stc2,
      key: 3,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur)),
        "blur": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOrBlur") : $cmp.handleFocusOrBlur))
      }
    }), api_custom_element("integration-parent", _integrationParent, stc3)];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Container = /*#__PURE__*/function (_LightningElement) {
    _inherits(Container, _LightningElement);

    var _super = _createSuper(Container);

    function Container() {
      var _this;

      _classCallCheck(this, Container);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "events", []);

      return _this;
    }

    _createClass(Container, [{
      key: "getEvents",
      value: function getEvents() {
        return this._ES5ProxyType ? this.get("events") : this.events;
      }
    }, {
      key: "handleFocusOrBlur",
      value: function handleFocusOrBlur(event) {
        var type = event._ES5ProxyType ? event.get("type") : event.type,
            relatedTarget = event._ES5ProxyType ? event.get("relatedTarget") : event.relatedTarget;
        (this._ES5ProxyType ? this.get("events") : this.events).push({
          type: type,
          relatedTarget: relatedTarget ? relatedTarget._ES5ProxyType ? relatedTarget.get("tagName") : relatedTarget.tagName : 'NULL'
        });
      }
    }, {
      key: "formattedEvents",
      get: function get() {
        return __callKey1(this._ES5ProxyType ? this.get("events") : this.events, "map", JSON.stringify);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Container;
  }(lwc.LightningElement);

  lwc.registerDecorators(Container, {
    publicMethods: ["getEvents"],
    track: {
      events: 1
    }
  });

  var Cmp = lwc.registerComponent(Container, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-related-target', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
