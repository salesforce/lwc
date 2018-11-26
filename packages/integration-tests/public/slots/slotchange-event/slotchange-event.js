(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  var __callKey0 = Proxy.callKey0;

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
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3;

    return [api_slot("", {
      classMap: {
        "default": true
      },
      key: 2,
      on: {
        "slotchange": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChange") : $cmp.handleChange))
      }
    }, [], $slotset), api_slot("programmatic-listener", {
      classMap: {
        "programmatic-listener": true
      },
      attrs: {
        "name": "programmatic-listener"
      },
      key: 3
    }, [api_element("p", {
      key: 4
    }, [api_text("This slot SHOULD NOT result in any slotchange event because of the limitation we put in place where we only dispatch on slots that have direct slotchange event listeners.")])], $slotset), api_slot("full", {
      classMap: {
        "full": true
      },
      attrs: {
        "name": "full"
      },
      key: 5,
      on: {
        "slotchange": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChange") : $cmp.handleChange))
      }
    }, [api_slot("first", {
      classMap: {
        "first": true
      },
      attrs: {
        "name": "first"
      },
      key: 6,
      on: {
        "slotchange": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChange") : $cmp.handleChange))
      }
    }, [api_element("span", {
      key: 7
    }, [api_text("Awesome")])], $slotset), api_slot("last", {
      classMap: {
        "last": true
      },
      attrs: {
        "name": "last"
      },
      key: 8,
      on: {
        "slotchange": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleChange") : $cmp.handleChange))
      }
    }, [api_element("span", {
      key: 9
    }, [api_text("Possum")])], $slotset)], $slotset)];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", ["", "programmatic-listener", "full", "first", "last"]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
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
      key: "addEventListenerToSlot",
      value: function addEventListenerToSlot() {
        var _this = this;

        var slot = __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", '.programmatic-listener');

        __callKey2(slot, "addEventListener", 'slotchange', function (event) {
          __callKey1(_this, "dispatchMessage", event);
        });
      }
    }, {
      key: "handleChange",
      value: function handleChange(event) {
        __callKey1(this, "dispatchMessage", event);
      }
    }, {
      key: "dispatchMessage",
      value: function dispatchMessage(event) {
        var _currentTarget, _className;

        var elements = __callKey1(event._ES5ProxyType ? event.get("currentTarget") : event.currentTarget, "assignedNodes", {
          flatten: true
        });

        __callKey1(this, "dispatchEvent", new CustomEvent('message', {
          bubbles: true,
          composed: true,
          detail: {
            slotName: (_currentTarget = event._ES5ProxyType ? event.get("currentTarget") : event.currentTarget, _className = _currentTarget._ES5ProxyType ? _currentTarget.get("className") : _currentTarget.className),
            assignedContents: __callKey1(elements, "map", function (el) {
              return el._ES5ProxyType ? el.get("textContent") : el.textContent;
            })
          }
        }));
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  lwc.registerDecorators(Child, {
    publicMethods: ["addEventListenerToSlot"]
  });

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var _state, _toggle, _state2, _updateName;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_flatten = $api._ES5ProxyType ? $api.get("f") : $api.f,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3,
        _m4 = $ctx._ES5ProxyType ? $ctx.get("_m4") : $ctx._m4,
        _m5 = $ctx._ES5ProxyType ? $ctx.get("_m5") : $ctx._m5,
        _m6 = $ctx._ES5ProxyType ? $ctx.get("_m6") : $ctx._m6,
        _m7 = $ctx._ES5ProxyType ? $ctx.get("_m7") : $ctx._m7,
        _m8 = $ctx._ES5ProxyType ? $ctx.get("_m8") : $ctx._m8;

    return [api_element("div", {
      key: 2
    }, [api_element("button", {
      classMap: {
        "clear": true
      },
      key: 3,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickClear") : $cmp.handleClickClear))
      }
    }, [api_text("set \"\"")]), api_element("button", {
      classMap: {
        "foo": true
      },
      key: 4,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickFoo") : $cmp.handleClickFoo))
      }
    }, [api_text("set \"foo\"")]), api_element("button", {
      classMap: {
        "foo-bar": true
      },
      key: 5,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickFooBar") : $cmp.handleClickFooBar))
      }
    }, [api_text("set \"foo bar\"")]), api_element("button", {
      classMap: {
        "countries": true
      },
      key: 6,
      on: {
        "click": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickCountries") : $cmp.handleClickCountries))
      }
    }, [api_text("set countries")])]), api_element("div", {
      key: 7
    }, [api_element("button", {
      classMap: {
        "add-slotchange": true
      },
      key: 8,
      on: {
        "click": _m4 || __setKey($ctx, "_m4", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickAddSlotChange") : $cmp.handleClickAddSlotChange))
      }
    }, [api_text("add slotchange listener to \"slot.programmatic-listener\"")]), api_element("button", {
      classMap: {
        "toggle-content": true
      },
      key: 9,
      on: {
        "click": _m5 || __setKey($ctx, "_m5", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickToggle") : $cmp.handleClickToggle))
      }
    }, [api_text("toggle assigned content for \"slot.programmatic-listener\"")])]), api_element("div", {
      key: 10
    }, [api_element("button", {
      classMap: {
        "update-name": true
      },
      key: 11,
      on: {
        "click": _m6 || __setKey($ctx, "_m6", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClickUpdateName") : $cmp.handleClickUpdateName))
      }
    }, [api_text("update name")])]), api_element("p", {
      key: 12
    }, [api_text("Leaked slotchange event count: "), api_element("span", {
      classMap: {
        "leaked-slotchange-event-count": true
      },
      key: 13
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("leakedSlotChangeEventCount") : $cmp.leakedSlotChangeEventCount)])]), api_custom_element("integration-child", _integrationChild, {
      key: 14,
      on: {
        "message": _m7 || __setKey($ctx, "_m7", api_bind($cmp._ES5ProxyType ? $cmp.get("handleMessage") : $cmp.handleMessage)),
        "slotchange": _m8 || __setKey($ctx, "_m8", api_bind($cmp._ES5ProxyType ? $cmp.get("handleLeakedSlotChange") : $cmp.handleLeakedSlotChange))
      }
    }, api_flatten([api_iterator($cmp._ES5ProxyType ? $cmp.get("things") : $cmp.things, function (thing) {
      return api_element("span", {
        key: api_key(16, thing)
      }, [api_dynamic(thing)]);
    }), (_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _toggle = _state._ES5ProxyType ? _state.get("toggle") : _state.toggle) ? api_element("div", {
      attrs: {
        "slot": "programmatic-listener"
      },
      key: 18
    }, [api_text("assigned by programmatic toggle")]) : null, (_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _updateName = _state2._ES5ProxyType ? _state2.get("updateName") : _state2.updateName) ? api_element("span", {
      attrs: {
        "slot": "last"
      },
      key: 20
    }, [api_text("Eugene")]) : null])), api_element("ol", {
      key: 21
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("messages") : $cmp.messages, function (message) {
      return api_element("li", {
        classMap: {
          "message": true
        },
        key: api_key(23, message)
      }, [api_dynamic(message)]);
    }))];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-slotchange-event_slotchange-event-host",
    shadowAttribute: "integration-slotchange-event_slotchange-event"
  });

  var SlotChangeEvent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(SlotChangeEvent, _LightningElement);

    function SlotChangeEvent() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, SlotChangeEvent);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(SlotChangeEvent), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        events: [],
        leakedEvents: [],
        things: ['foo'],
        toggle: false,
        updateName: false
      });

      return _this;
    }

    _createClass(SlotChangeEvent, [{
      key: "addEventListenerToSlot",
      value: function addEventListenerToSlot() {
        var child = __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-child');

        __callKey0(child, "addEventListenerToSlot");
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _state, _toggle;

        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "toggle", !(_state = this._ES5ProxyType ? this.get("state") : this.state, _toggle = _state._ES5ProxyType ? _state.get("toggle") : _state.toggle));
      }
    }, {
      key: "handleMessage",
      value: function handleMessage(event) {
        var _state2, _events;

        var _event$detail = event._ES5ProxyType ? event.get("detail") : event.detail,
            slotName = _event$detail._ES5ProxyType ? _event$detail.get("slotName") : _event$detail.slotName,
            assignedContents = _event$detail._ES5ProxyType ? _event$detail.get("assignedContents") : _event$detail.assignedContents;

        (_state2 = this._ES5ProxyType ? this.get("state") : this.state, _events = _state2._ES5ProxyType ? _state2.get("events") : _state2.events).push({
          slotName: slotName,
          assignedContents: assignedContents
        });
      }
    }, {
      key: "handleLeakedSlotChange",
      value: function handleLeakedSlotChange(event) {
        var _state3, _leakedEvents;

        (_state3 = this._ES5ProxyType ? this.get("state") : this.state, _leakedEvents = _state3._ES5ProxyType ? _state3.get("leakedEvents") : _state3.leakedEvents).push(event);
      }
    }, {
      key: "handleClickClear",
      value: function handleClickClear() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "things", []);
      }
    }, {
      key: "handleClickFoo",
      value: function handleClickFoo() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "things", ['foo']);
      }
    }, {
      key: "handleClickFooBar",
      value: function handleClickFooBar() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "things", ['foo', 'bar']);
      }
    }, {
      key: "handleClickCountries",
      value: function handleClickCountries() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "things", ['belarus', 'china', 'cuba', 'france', 'india', 'japan', 'spain']);
      }
    }, {
      key: "handleClickAddSlotChange",
      value: function handleClickAddSlotChange() {
        __callKey0(this, "addEventListenerToSlot");
      }
    }, {
      key: "handleClickToggle",
      value: function handleClickToggle() {
        __callKey0(this, "toggle");
      }
    }, {
      key: "handleClickUpdateName",
      value: function handleClickUpdateName() {
        __setKey(this._ES5ProxyType ? this.get("state") : this.state, "updateName", true);
      }
    }, {
      key: "leakedSlotChangeEventCount",
      get: function get() {
        var _state4, _leakedEvents2, _length;

        return _state4 = this._ES5ProxyType ? this.get("state") : this.state, _leakedEvents2 = _state4._ES5ProxyType ? _state4.get("leakedEvents") : _state4.leakedEvents, _length = _leakedEvents2._ES5ProxyType ? _leakedEvents2.get("length") : _leakedEvents2.length;
      }
    }, {
      key: "things",
      get: function get() {
        var _state5, _things;

        return _state5 = this._ES5ProxyType ? this.get("state") : this.state, _things = _state5._ES5ProxyType ? _state5.get("things") : _state5.things;
      }
    }, {
      key: "messages",
      get: function get() {
        var _state6, _events2;

        return __callKey1((_state6 = this._ES5ProxyType ? this.get("state") : this.state, _events2 = _state6._ES5ProxyType ? _state6.get("events") : _state6.events), "map", function (data) {
          return JSON.stringify(data);
        });
      }
    }]);

    return SlotChangeEvent;
  }(lwc.LightningElement);

  lwc.registerDecorators(SlotChangeEvent, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(SlotChangeEvent, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-slotchange-event', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
