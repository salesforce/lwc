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
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      key: 2
    }, [])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
  });

  lwc.register({
    piercing: function piercing(component, data, def, context, target, key, value, callback) {
      var _prototype, _dispatchEvent;

      if (value === (_prototype = EventTarget._ES5ProxyType ? EventTarget.get("prototype") : EventTarget.prototype, _dispatchEvent = _prototype._ES5ProxyType ? _prototype.get("dispatchEvent") : _prototype.dispatchEvent)) {
        callback(function (event) {
          var _prototype2, _dispatchEvent2;

          var realEvent = new CustomEvent(event._ES5ProxyType ? event.get("type") : event.type, {
            bubbles: true,
            composed: true
          });

          __callKey2((_prototype2 = EventTarget._ES5ProxyType ? EventTarget.get("prototype") : EventTarget.prototype, _dispatchEvent2 = _prototype2._ES5ProxyType ? _prototype2.get("dispatchEvent") : _prototype2.dispatchEvent), "call", this, realEvent);
        });
      }
    }
  });

  var Child =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Child, _LightningElement);

    function Child() {
      _classCallCheck(this, Child);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(Child), "apply", this, arguments));
    }

    _createClass(Child, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var event = {
          type: 'custom'
        };

        __callKey1(this, "dispatchEvent", event);
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", {
      key: 2
    }, [api_custom_element("integration-child", _integrationChild, {
      key: 3,
      on: {
        "custom": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleCustom") : $cmp.handleCustom))
      }
    }, []), api_element("div", {
      classMap: {
        "event-count": true
      },
      key: 4
    }, [api_text("Event Count: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("eventCount") : $cmp.eventCount)])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-pierce-dispatch-event_pierce-dispatch-event-host",
    shadowAttribute: "integration-pierce-dispatch-event_pierce-dispatch-event"
  });

  var PierceDispatchEvent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(PierceDispatchEvent, _LightningElement);

    function PierceDispatchEvent() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, PierceDispatchEvent);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(PierceDispatchEvent), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "eventCount", 0);

      return _this;
    }

    _createClass(PierceDispatchEvent, [{
      key: "handleCustom",
      value: function handleCustom(evt) {
        __setKey(this, "eventCount", (this._ES5ProxyType ? this.get("eventCount") : this.eventCount) + 1);
      }
    }]);

    return PierceDispatchEvent;
  }(lwc.LightningElement);

  lwc.registerDecorators(PierceDispatchEvent, {
    track: {
      eventCount: 1
    }
  });

  var Cmp = lwc.registerComponent(PierceDispatchEvent, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-pierce-dispatch-event', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
