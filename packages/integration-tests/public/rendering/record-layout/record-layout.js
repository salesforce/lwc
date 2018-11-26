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
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("section", {
      styleMap: {
        "borderStyle": "solid",
        "borderWidth": "2px",
        "borderColor": "blue",
        "padding": "5px"
      },
      key: 2
    }, [api_element("p", {
      key: 3
    }, [api_text("Section: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("titleLabel") : $cmp.titleLabel)]), api_slot("", {
      key: 4
    }, [], $slotset)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-recordLayoutSection_recordLayoutSection-host",
    shadowAttribute: "integration-recordLayoutSection_recordLayoutSection"
  });

  var RecordLayoutSection =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RecordLayoutSection, _LightningElement);

    function RecordLayoutSection() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RecordLayoutSection);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RecordLayoutSection), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "mode", void 0);

      __setKey(_this, "titleLabel", void 0);

      __setKey(_this, "recordId", void 0);

      return _this;
    }

    return RecordLayoutSection;
  }(lwc.LightningElement);

  lwc.registerDecorators(RecordLayoutSection, {
    publicProps: {
      mode: {
        config: 0
      },
      titleLabel: {
        config: 0
      },
      recordId: {
        config: 0
      }
    }
  });

  var _integrationRecordLayoutSection = lwc.registerComponent(RecordLayoutSection, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("section", {
      styleMap: {
        "borderStyle": "solid",
        "borderWidth": "2px",
        "borderColor": "aquamarine",
        "padding": "5px"
      },
      key: 2
    }, [api_element("p", {
      key: 3
    }, [api_text("Row:")]), api_slot("", {
      key: 4
    }, [], $slotset)])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "slots", [""]);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-recordLayoutRow_recordLayoutRow-host",
    shadowAttribute: "integration-recordLayoutRow_recordLayoutRow"
  });

  var RecordLayoutRow =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RecordLayoutRow, _LightningElement);

    function RecordLayoutRow() {
      _classCallCheck(this, RecordLayoutRow);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(RecordLayoutRow), "apply", this, arguments));
    }

    return RecordLayoutRow;
  }(lwc.LightningElement);

  var _integrationRecordLayoutRow = lwc.registerComponent(RecordLayoutRow, {
    tmpl: _tmpl$1
  });

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

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("section", {
      styleMap: {
        "borderStyle": "solid",
        "borderWidth": "2px",
        "borderColor": "red",
        "padding": "5px"
      },
      key: 2
    }, [api_element("p", {
      key: 3
    }, [api_text("Item: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("fieldLabel") : $cmp.fieldLabel), api_text(" ("), api_dynamic($cmp._ES5ProxyType ? $cmp.get("fieldApiName") : $cmp.fieldApiName), api_text(")")]), api_slot("", {
      key: 4
    }, [], $slotset)])];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "slots", [""]);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-recordLayoutItem_recordLayoutItem-host",
    shadowAttribute: "integration-recordLayoutItem_recordLayoutItem"
  });

  var RecordLayoutItem =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RecordLayoutItem, _LightningElement);

    function RecordLayoutItem() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RecordLayoutItem);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RecordLayoutItem), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "mode", void 0);

      __setKey(_this, "fieldLabel", void 0);

      __setKey(_this, "fieldApiName", void 0);

      __setKey(_this, "isInlineEditable", false);

      return _this;
    }

    _createClass(RecordLayoutItem, [{
      key: "role",
      set: function set(value) {
        __callKey2(this, "setAttribute", 'role', value);
      },
      get: function get() {
        return __callKey1(this, "getAttribute", 'role');
      }
    }]);

    return RecordLayoutItem;
  }(lwc.LightningElement);

  lwc.registerDecorators(RecordLayoutItem, {
    publicProps: {
      mode: {
        config: 0
      },
      fieldLabel: {
        config: 0
      },
      fieldApiName: {
        config: 0
      },
      isInlineEditable: {
        config: 0
      },
      role: {
        config: 3
      }
    }
  });

  var _integrationRecordLayoutItem = lwc.registerComponent(RecordLayoutItem, {
    tmpl: _tmpl$2
  });

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("section", {
      styleMap: {
        "borderStyle": "solid",
        "borderWidth": "2px",
        "borderColor": "darkorange",
        "padding": "5px"
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("label") : $cmp.label), api_element("p", {
      key: 3
    }, [api_text("Value: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("value") : $cmp.value)]), api_element("p", {
      key: 4
    }, [api_text("Display value: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("displayValue") : $cmp.displayValue)]), api_element("p", {
      key: 5
    }, [api_text("Field Api Name: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("fieldApiName") : $cmp.fieldApiName)])])];
  }

  var _tmpl$3 = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "stylesheets", []);

  __setKey(tmpl$3, "stylesheetTokens", {
    hostAttribute: "integration-recordLayoutLeaf_recordLayoutLeaf-host",
    shadowAttribute: "integration-recordLayoutLeaf_recordLayoutLeaf"
  });

  var RecordLayoutLeaf =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RecordLayoutLeaf, _LightningElement);

    function RecordLayoutLeaf() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RecordLayoutLeaf);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RecordLayoutLeaf), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "label", void 0);

      __setKey(_this, "value", void 0);

      __setKey(_this, "displayValue", void 0);

      __setKey(_this, "fieldApiName", void 0);

      return _this;
    }

    return RecordLayoutLeaf;
  }(lwc.LightningElement);

  lwc.registerDecorators(RecordLayoutLeaf, {
    publicProps: {
      label: {
        config: 0
      },
      value: {
        config: 0
      },
      displayValue: {
        config: 0
      },
      fieldApiName: {
        config: 0
      }
    }
  });

  var _integrationRecordLayoutLeaf = lwc.registerComponent(RecordLayoutLeaf, {
    tmpl: _tmpl$3
  });

  function tmpl$4($api, $cmp, $slotset, $ctx) {
    var _state, _flatRecord, _values, _OwnerId, _state2, _flatRecord2, _displayValues, _CloseDate, _state3, _flatRecord3, _values2, _Name, _state4, _flatRecord4, _displayValues2, _StageName, _state5, _flatRecord5, _displayValues3, _Account, _state6, _flatRecord6, _values3, _AccountId, _state7, _flatRecord7, _values4, _Probability, _state8, _flatRecord8, _displayValues4, _Type, _state9, _flatRecord9, _displayValues5, _Amount, _state10, _flatRecord10, _displayValues6, _Campaign, _state11, _flatRecord11, _values5, _CampaignId, _state12, _flatRecord12, _values6, _n01__c, _state13, _flatRecord13, _values7, _Text1__c, _state14, _flatRecord14, _values8, _n02__c, _state15, _flatRecord15, _values9, _Text2__c, _state16, _flatRecord16, _values10, _n03__c, _state17, _flatRecord17, _values11, _Text3__c, _state18, _flatRecord18, _values12, _n04__c, _state19, _flatRecord19, _values13, _Text4__c, _state20, _flatRecord20, _values14, _n05__c, _state21, _flatRecord21, _values15, _Text5__c, _state22, _flatRecord22, _values16, _n06__c, _state23, _flatRecord23, _values17, _Checkbox1__c, _state24, _flatRecord24, _values18, _n07__c, _state25, _flatRecord25, _values19, _Checkbox2__c, _state26, _flatRecord26, _values20, _n08__c, _state27, _flatRecord27, _values21, _Checkbox3__c, _state28, _flatRecord28, _values22, _n09__c, _state29, _flatRecord29, _values23, _Checkbox4__c, _state30, _flatRecord30, _values24, _n10__c, _state31, _flatRecord31, _values25, _Checkbox15__c, _state32, _flatRecord32, _values26, _e04__c, _state33, _flatRecord33, _values27, _e04__c2, _state34, _flatRecord34, _values28, _Checkbox7__c, _state35, _flatRecord35, _values29, _e02__c, _state36, _flatRecord36, _values30, _e02__c2, _state37, _flatRecord37, _values31, _Checkbox5__c, _state38, _flatRecord38, _values32, _e03__c, _state39, _flatRecord39, _values33, _e03__c2, _state40, _flatRecord40, _values34, _Checkbox18__c, _state41, _flatRecord41, _values35, _e05__c, _state42, _flatRecord42, _values36, _e05__c2, _state43, _flatRecord43, _values37, _Checkbox19__c, _state44, _flatRecord44, _values38, _e06__c, _state45, _flatRecord45, _values39, _e06__c2, _state46, _flatRecord46, _values40, _Checkbox9__c, _state47, _flatRecord47, _values41, _e08__c, _state48, _flatRecord48, _values42, _e08__c2, _state49, _flatRecord49, _values43, _Checkbox20__c, _state50, _flatRecord50, _values44, _e10__c, _state51, _flatRecord51, _values45, _e10__c2, _state52, _flatRecord52, _values46, _Checkbox8__c, _state53, _flatRecord53, _displayValues7, _Date1__c, _state54, _flatRecord54, _values47, _Checkbox6__c, _state55, _flatRecord55, _displayValues8, _dt10__c, _state56, _flatRecord56, _values48, _Checkbox17__c, _state57, _flatRecord57, _values49, _e01__c, _state58, _flatRecord58, _values50, _e01__c2, _state59, _flatRecord59, _values51, _Checkbox16__c, _state60, _flatRecord60, _values52, _e09__c, _state61, _flatRecord61, _values53, _e09__c2, _state62, _flatRecord62, _values54, _Checkbox12__c, _state63, _flatRecord63, _values55, _rt02__c, _state64, _flatRecord64, _values56, _Checkbox14__c, _state65, _flatRecord65, _displayValues9, _c02__c, _state66, _flatRecord66, _values57, _Checkbox10__c, _state67, _flatRecord67, _displayValues10, _c04__c, _state68, _flatRecord68, _values58, _Checkbox13__c, _state69, _flatRecord69, _displayValues11, _date02__c, _state70, _flatRecord70, _values59, _Checkbox11__c, _state71, _flatRecord71, _displayValues12, _date04__c, _state72, _flatRecord72, _displayValues13, _dt01__c, _state73, _flatRecord73, _values60, _percent02__c, _state74, _flatRecord74, _displayValues14, _dt02__c, _state75, _flatRecord75, _values61, _percent04__c, _state76, _flatRecord76, _displayValues15, _dt03__c, _state77, _flatRecord77, _values62, _percent06__c, _state78, _flatRecord78, _displayValues16, _dt04__c, _state79, _flatRecord79, _values63, _percent09__c, _state80, _flatRecord80, _displayValues17, _dt05__c, _state81, _flatRecord81, _values64, _phone01__c, _state82, _flatRecord82, _displayValues18, _dt06__c, _state83, _flatRecord83, _values65, _phone03__c, _state84, _flatRecord84, _displayValues19, _dt07__c, _state85, _flatRecord85, _values66, _phone05__c, _state86, _flatRecord86, _displayValues20, _dt08__c, _state87, _flatRecord87, _values67, _phone07__c, _state88, _flatRecord88, _displayValues21, _dt09__c, _state89, _flatRecord89, _values68, _phone09__c, _state90, _flatRecord90, _values69, _e07__c, _state91, _flatRecord91, _values70, _e07__c2, _state92, _flatRecord92, _values71, _url02__c, _state93, _flatRecord93, _values72, _url02__c2, _state94, _flatRecord94, _values73, _rt01__c, _state95, _flatRecord95, _displayValues22, _picklist02__c, _state96, _flatRecord96, _displayValues23, _c01__c, _state97, _flatRecord97, _values74, _txt02__c, _state98, _flatRecord98, _displayValues24, _c03__c, _state99, _flatRecord99, _values75, _txt04__c, _state100, _flatRecord100, _displayValues25, _c05__c, _state101, _flatRecord101, _values76, _txt06__c, _state102, _flatRecord102, _displayValues26, _date01__c, _state103, _flatRecord103, _values77, _txt08__c, _state104, _flatRecord104, _displayValues27, _date03__c, _state105, _flatRecord105, _values78, _txt10__c, _state106, _flatRecord106, _values79, _percent01__c, _state107, _flatRecord107, _values80, _phone10__c, _state108, _flatRecord108, _values81, _percent03__c, _state109, _flatRecord109, _displayValues28, _Pricebook, _state110, _flatRecord110, _values82, _Pricebook2Id, _state111, _flatRecord111, _values83, _percent05__c, _state112, _flatRecord112, _displayValues29, _LeadSource, _state113, _flatRecord113, _values84, _percent07__c, _state114, _flatRecord114, _displayValues30, _CreatedBy, _state115, _flatRecord115, _values85, _CreatedById, _state116, _flatRecord116, _values86, _percent8__c, _state117, _flatRecord117, _displayValues31, _date05__c, _state118, _flatRecord118, _values87, _phone02__c, _state119, _flatRecord119, _displayValues32, _ForecastCategoryName, _state120, _flatRecord120, _values88, _phone04__c, _state121, _flatRecord121, _displayValues33, _Currency12__c, _state122, _flatRecord122, _values89, _phone06__c, _state123, _flatRecord123, _displayValues34, _Currency10__c, _state124, _flatRecord124, _values90, _phone08__c, _state125, _flatRecord125, _displayValues35, _Currency11__c, _state126, _flatRecord126, _values91, _url01__c, _state127, _flatRecord127, _values92, _url01__c2, _state128, _flatRecord128, _displayValues36, _Currency16__c, _state129, _flatRecord129, _displayValues37, _picklist__c, _state130, _flatRecord130, _displayValues38, _Currency15__c, _state131, _flatRecord131, _values93, _txt01__c, _state132, _flatRecord132, _displayValues39, _Currency14__c, _state133, _flatRecord133, _values94, _txt03__c, _state134, _flatRecord134, _displayValues40, _Currency2__c, _state135, _flatRecord135, _values95, _txt05__c, _state136, _flatRecord136, _displayValues41, _Currency18__c, _state137, _flatRecord137, _values96, _txt07__c, _state138, _flatRecord138, _displayValues42, _Currency8__c, _state139, _flatRecord139, _values97, _txt09__c, _state140, _flatRecord140, _displayValues43, _Currency5__c, _state141, _flatRecord141, _displayValues44, _picklist03__c, _state142, _flatRecord142, _displayValues45, _Currency19__c, _state143, _flatRecord143, _displayValues46, _picklist04__c, _state144, _flatRecord144, _displayValues47, _Currency7__c, _state145, _flatRecord145, _values98, _NextStep, _state146, _flatRecord146, _displayValues48, _Currency9__c, _state147, _flatRecord147, _values99, _Description, _state148, _flatRecord148, _displayValues49, _Currency20__c, _state149, _flatRecord149, _displayValues50, _LastModifiedBy, _state150, _flatRecord150, _values100, _LastModifiedById, _state151, _flatRecord151, _displayValues51, _Currency3__c, _state152, _flatRecord152, _displayValues52, _Date16__c, _state153, _flatRecord153, _displayValues53, _Currency4__c, _state154, _flatRecord154, _displayValues54, _Date14__c, _state155, _flatRecord155, _displayValues55, _Currency17__c, _state156, _flatRecord156, _displayValues56, _Date13__c, _state157, _flatRecord157, _displayValues57, _Currency13__c, _state158, _flatRecord158, _displayValues58, _Date10__c, _state159, _flatRecord159, _displayValues59, _Currency1__c, _state160, _flatRecord160, _displayValues60, _Date5__c, _state161, _flatRecord161, _displayValues61, _DateTime1__c, _state162, _flatRecord162, _displayValues62, _Date6__c, _state163, _flatRecord163, _displayValues63, _DateTime17__c, _state164, _flatRecord164, _displayValues64, _Date18__c, _state165, _flatRecord165, _displayValues65, _DateTime19__c, _state166, _flatRecord166, _displayValues66, _Date8__c, _state167, _flatRecord167, _displayValues67, _DateTime14__c, _state168, _flatRecord168, _displayValues68, _Date17__c, _state169, _flatRecord169, _displayValues69, _DateTime15__c, _state170, _flatRecord170, _displayValues70, _Date9__c, _state171, _flatRecord171, _displayValues71, _DateTime10__c, _state172, _flatRecord172, _displayValues72, _Date7__c, _state173, _flatRecord173, _displayValues73, _DateTime12__c, _state174, _flatRecord174, _displayValues74, _Date19__c, _state175, _flatRecord175, _displayValues75, _DateTime11__c, _state176, _flatRecord176, _displayValues76, _Date15__c, _state177, _flatRecord177, _displayValues77, _DateTime3__c, _state178, _flatRecord178, _displayValues78, _Date12__c, _state179, _flatRecord179, _displayValues79, _DateTime16__c, _state180, _flatRecord180, _displayValues80, _Date20__c, _state181, _flatRecord181, _displayValues81, _DateTime2__c, _state182, _flatRecord182, _displayValues82, _Date11__c, _state183, _flatRecord183, _displayValues83, _DateTime7__c, _state184, _flatRecord184, _values101, _Email10__c, _state185, _flatRecord185, _values102, _Email10__c2, _state186, _flatRecord186, _displayValues84, _DateTime13__c, _state187, _flatRecord187, _values103, _Email13__c, _state188, _flatRecord188, _values104, _Email13__c2, _state189, _flatRecord189, _displayValues85, _DateTime20__c, _state190, _flatRecord190, _values105, _Email14__c, _state191, _flatRecord191, _values106, _Email14__c2, _state192, _flatRecord192, _displayValues86, _DateTime18__c, _state193, _flatRecord193, _values107, _Email9__c, _state194, _flatRecord194, _values108, _Email9__c2, _state195, _flatRecord195, _displayValues87, _DateTime5__c, _state196, _flatRecord196, _values109, _Email20__c, _state197, _flatRecord197, _values110, _Email20__c2, _state198, _flatRecord198, _displayValues88, _DateTime9__c, _state199, _flatRecord199, _values111, _Email8__c, _state200, _flatRecord200, _values112, _Email8__c2, _state201, _flatRecord201, _displayValues89, _DateTime6__c, _state202, _flatRecord202, _values113, _Email11__c, _state203, _flatRecord203, _values114, _Email11__c2, _state204, _flatRecord204, _displayValues90, _DateTime8__c, _state205, _flatRecord205, _values115, _Email2__c, _state206, _flatRecord206, _values116, _Email2__c2, _state207, _flatRecord207, _displayValues91, _DateTime4__c, _state208, _flatRecord208, _values117, _Email15__c, _state209, _flatRecord209, _values118, _Email15__c2, _state210, _flatRecord210, _values119, _Num19__c, _state211, _flatRecord211, _values120, _Email3__c, _state212, _flatRecord212, _values121, _Email3__c2, _state213, _flatRecord213, _values122, _Num18__c, _state214, _flatRecord214, _values123, _Email18__c, _state215, _flatRecord215, _values124, _Email18__c2, _state216, _flatRecord216, _values125, _Num15__c, _state217, _flatRecord217, _values126, _Email6__c, _state218, _flatRecord218, _values127, _Email6__c2, _state219, _flatRecord219, _values128, _Num12__c, _state220, _flatRecord220, _values129, _Email7__c, _state221, _flatRecord221, _values130, _Email7__c2, _state222, _flatRecord222, _values131, _Num14__c, _state223, _flatRecord223, _values132, _Email12__c, _state224, _flatRecord224, _values133, _Email12__c2, _state225, _flatRecord225, _values134, _Num11__c, _state226, _flatRecord226, _values135, _Email4__c, _state227, _flatRecord227, _values136, _Email4__c2, _state228, _flatRecord228, _values137, _Num13__c, _state229, _flatRecord229, _values138, _Email1__c, _state230, _flatRecord230, _values139, _Email1__c2, _state231, _flatRecord231, _values140, _Num1__c, _state232, _flatRecord232, _values141, _Email5__c, _state233, _flatRecord233, _values142, _Email5__c2, _state234, _flatRecord234, _values143, _Num10__c, _state235, _flatRecord235, _values144, _Email17__c, _state236, _flatRecord236, _values145, _Email17__c2, _state237, _flatRecord237, _values146, _Num9__c, _state238, _flatRecord238, _values147, _Email16__c, _state239, _flatRecord239, _values148, _Email16__c2, _state240, _flatRecord240, _values149, _Num20__c, _state241, _flatRecord241, _values150, _Email19__c, _state242, _flatRecord242, _values151, _Email19__c2, _state243, _flatRecord243, _values152, _Num16__c, _state244, _flatRecord244, _values153, _Perc12__c, _state245, _flatRecord245, _values154, _Num2__c, _state246, _flatRecord246, _values155, _Perc17__c, _state247, _flatRecord247, _values156, _Num17__c, _state248, _flatRecord248, _values157, _Perc13__c, _state249, _flatRecord249, _values158, _Num4__c, _state250, _flatRecord250, _values159, _Perc1__c, _state251, _flatRecord251, _values160, _Num6__c, _state252, _flatRecord252, _values161, _Perc16__c, _state253, _flatRecord253, _values162, _Num8__c, _state254, _flatRecord254, _values163, _Perc10__c, _state255, _flatRecord255, _values164, _Num3__c, _state256, _flatRecord256, _values165, _Perc5__c, _state257, _flatRecord257, _values166, _Num5__c, _state258, _flatRecord258, _values167, _Perc11__c, _state259, _flatRecord259, _values168, _Num7__c, _state260, _flatRecord260, _values169, _Perc6__c, _state261, _flatRecord261, _values170, _Phone20__c, _state262, _flatRecord262, _values171, _Perc18__c, _state263, _flatRecord263, _values172, _Phone15__c, _state264, _flatRecord264, _values173, _Perc3__c, _state265, _flatRecord265, _values174, _Phone3__c, _state266, _flatRecord266, _values175, _Perc8__c, _state267, _flatRecord267, _values176, _Phone19__c, _state268, _flatRecord268, _values177, _Perc14__c, _state269, _flatRecord269, _values178, _Phone2__c, _state270, _flatRecord270, _values179, _Perc9__c, _state271, _flatRecord271, _values180, _Phone16__c, _state272, _flatRecord272, _values181, _Perc4__c, _state273, _flatRecord273, _values182, _Phone18__c, _state274, _flatRecord274, _values183, _Perc19__c, _state275, _flatRecord275, _values184, _Phone12__c, _state276, _flatRecord276, _values185, _Perc7__c, _state277, _flatRecord277, _values186, _Phone11__c, _state278, _flatRecord278, _values187, _Perc15__c, _state279, _flatRecord279, _values188, _Phone13__c, _state280, _flatRecord280, _values189, _Perc20__c, _state281, _flatRecord281, _values190, _Phone5__c, _state282, _flatRecord282, _values191, _Perc2__c, _state283, _flatRecord283, _values192, _Phone8__c, _state284, _flatRecord284, _values193, _Text18__c, _state285, _flatRecord285, _values194, _Phone6__c, _state286, _flatRecord286, _values195, _TextArea1__c, _state287, _flatRecord287, _values196, _Phone4__c, _state288, _flatRecord288, _values197, _Text20__c, _state289, _flatRecord289, _values198, _Phone7__c, _state290, _flatRecord290, _values199, _TextArea13__c, _state291, _flatRecord291, _values200, _Phone9__c, _state292, _flatRecord292, _values201, _Text19__c, _state293, _flatRecord293, _values202, _Phone14__c, _state294, _flatRecord294, _values203, _Text9__c, _state295, _flatRecord295, _values204, _Phone17__c, _state296, _flatRecord296, _values205, _Text8__c, _state297, _flatRecord297, _values206, _TextArea15__c, _state298, _flatRecord298, _values207, _TextArea11__c, _state299, _flatRecord299, _values208, _TextArea18__c, _state300, _flatRecord300, _values209, _TextArea12__c, _state301, _flatRecord301, _values210, _TextArea19__c, _state302, _flatRecord302, _values211, _TextArea3__c, _state303, _flatRecord303, _values212, _TextArea8__c, _state304, _flatRecord304, _values213, _TextArea5__c, _state305, _flatRecord305, _values214, _TextArea20__c, _state306, _flatRecord306, _values215, _TextArea16__c, _state307, _flatRecord307, _values216, _TextArea6__c, _state308, _flatRecord308, _values217, _TextArea14__c, _state309, _flatRecord309, _values218, _TextArea7__c, _state310, _flatRecord310, _values219, _TextArea2__c, _state311, _flatRecord311, _values220, _TextArea9__c, _state312, _flatRecord312, _values221, _TextArea17__c, _state313, _flatRecord313, _values222, _TextArea4__c, _state314, _flatRecord314, _values223, _TextArea10__c;

    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_custom_element("integration-record-layout-section", _integrationRecordLayoutSection, {
      props: {
        "mode": "VIEW",
        "titleLabel": "Opportunity Information",
        "recordId": "01Bxx0000029W6VEAU"
      },
      key: 2
    }, [api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 3
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Opportunity Owner",
        "fieldApiName": "OwnerId"
      },
      key: 4
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord = _state._ES5ProxyType ? _state.get("flatRecord") : _state.flatRecord, _values = _flatRecord._ES5ProxyType ? _flatRecord.get("values") : _flatRecord.values, _OwnerId = _values._ES5ProxyType ? _values.get("OwnerId") : _values.OwnerId)
      },
      key: 5
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Close Date",
        "fieldApiName": "CloseDate",
        "isInlineEditable": true
      },
      key: 6
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord2 = _state2._ES5ProxyType ? _state2.get("flatRecord") : _state2.flatRecord, _displayValues = _flatRecord2._ES5ProxyType ? _flatRecord2.get("displayValues") : _flatRecord2.displayValues, _CloseDate = _displayValues._ES5ProxyType ? _displayValues.get("CloseDate") : _displayValues.CloseDate)
      },
      key: 7
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 8
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Opportunity Name",
        "fieldApiName": "Name",
        "isInlineEditable": true
      },
      key: 9
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state3 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord3 = _state3._ES5ProxyType ? _state3.get("flatRecord") : _state3.flatRecord, _values2 = _flatRecord3._ES5ProxyType ? _flatRecord3.get("values") : _flatRecord3.values, _Name = _values2._ES5ProxyType ? _values2.get("Name") : _values2.Name)
      },
      key: 10
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Stage",
        "fieldApiName": "StageName",
        "isInlineEditable": true
      },
      key: 11
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state4 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord4 = _state4._ES5ProxyType ? _state4.get("flatRecord") : _state4.flatRecord, _displayValues2 = _flatRecord4._ES5ProxyType ? _flatRecord4.get("displayValues") : _flatRecord4.displayValues, _StageName = _displayValues2._ES5ProxyType ? _displayValues2.get("StageName") : _displayValues2.StageName)
      },
      key: 12
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 13
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Account Name",
        "fieldApiName": "AccountId",
        "isInlineEditable": true
      },
      key: 14
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "displayValue": (_state5 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord5 = _state5._ES5ProxyType ? _state5.get("flatRecord") : _state5.flatRecord, _displayValues3 = _flatRecord5._ES5ProxyType ? _flatRecord5.get("displayValues") : _flatRecord5.displayValues, _Account = _displayValues3._ES5ProxyType ? _displayValues3.get("Account") : _displayValues3.Account),
        "fieldApiName": "AccountId",
        "value": (_state6 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord6 = _state6._ES5ProxyType ? _state6.get("flatRecord") : _state6.flatRecord, _values3 = _flatRecord6._ES5ProxyType ? _flatRecord6.get("values") : _flatRecord6.values, _AccountId = _values3._ES5ProxyType ? _values3.get("AccountId") : _values3.AccountId)
      },
      key: 15
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Probability (%)",
        "fieldApiName": "Probability",
        "isInlineEditable": true
      },
      key: 16
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state7 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord7 = _state7._ES5ProxyType ? _state7.get("flatRecord") : _state7.flatRecord, _values4 = _flatRecord7._ES5ProxyType ? _flatRecord7.get("values") : _flatRecord7.values, _Probability = _values4._ES5ProxyType ? _values4.get("Probability") : _values4.Probability)
      },
      key: 17
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 18
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Type",
        "fieldApiName": "Type",
        "isInlineEditable": true
      },
      key: 19
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state8 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord8 = _state8._ES5ProxyType ? _state8.get("flatRecord") : _state8.flatRecord, _displayValues4 = _flatRecord8._ES5ProxyType ? _flatRecord8.get("displayValues") : _flatRecord8.displayValues, _Type = _displayValues4._ES5ProxyType ? _displayValues4.get("Type") : _displayValues4.Type)
      },
      key: 20
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Amount",
        "fieldApiName": "Amount",
        "isInlineEditable": true
      },
      key: 21
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state9 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord9 = _state9._ES5ProxyType ? _state9.get("flatRecord") : _state9.flatRecord, _displayValues5 = _flatRecord9._ES5ProxyType ? _flatRecord9.get("displayValues") : _flatRecord9.displayValues, _Amount = _displayValues5._ES5ProxyType ? _displayValues5.get("Amount") : _displayValues5.Amount)
      },
      key: 22
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 23
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Primary Campaign Source",
        "fieldApiName": "CampaignId",
        "isInlineEditable": true
      },
      key: 24
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "displayValue": (_state10 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord10 = _state10._ES5ProxyType ? _state10.get("flatRecord") : _state10.flatRecord, _displayValues6 = _flatRecord10._ES5ProxyType ? _flatRecord10.get("displayValues") : _flatRecord10.displayValues, _Campaign = _displayValues6._ES5ProxyType ? _displayValues6.get("Campaign") : _displayValues6.Campaign),
        "fieldApiName": "CampaignId",
        "value": (_state11 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord11 = _state11._ES5ProxyType ? _state11.get("flatRecord") : _state11.flatRecord, _values5 = _flatRecord11._ES5ProxyType ? _flatRecord11.get("values") : _flatRecord11.values, _CampaignId = _values5._ES5ProxyType ? _values5.get("CampaignId") : _values5.CampaignId)
      },
      key: 25
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n01",
        "fieldApiName": "n01__c",
        "isInlineEditable": true
      },
      key: 26
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state12 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord12 = _state12._ES5ProxyType ? _state12.get("flatRecord") : _state12.flatRecord, _values6 = _flatRecord12._ES5ProxyType ? _flatRecord12.get("values") : _flatRecord12.values, _n01__c = _values6._ES5ProxyType ? _values6.get("n01__c") : _values6.n01__c)
      },
      key: 27
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 28
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text1",
        "fieldApiName": "Text1__c",
        "isInlineEditable": true
      },
      key: 29
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state13 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord13 = _state13._ES5ProxyType ? _state13.get("flatRecord") : _state13.flatRecord, _values7 = _flatRecord13._ES5ProxyType ? _flatRecord13.get("values") : _flatRecord13.values, _Text1__c = _values7._ES5ProxyType ? _values7.get("Text1__c") : _values7.Text1__c)
      },
      key: 30
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n02",
        "fieldApiName": "n02__c",
        "isInlineEditable": true
      },
      key: 31
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state14 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord14 = _state14._ES5ProxyType ? _state14.get("flatRecord") : _state14.flatRecord, _values8 = _flatRecord14._ES5ProxyType ? _flatRecord14.get("values") : _flatRecord14.values, _n02__c = _values8._ES5ProxyType ? _values8.get("n02__c") : _values8.n02__c)
      },
      key: 32
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 33
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text2",
        "fieldApiName": "Text2__c",
        "isInlineEditable": true
      },
      key: 34
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state15 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord15 = _state15._ES5ProxyType ? _state15.get("flatRecord") : _state15.flatRecord, _values9 = _flatRecord15._ES5ProxyType ? _flatRecord15.get("values") : _flatRecord15.values, _Text2__c = _values9._ES5ProxyType ? _values9.get("Text2__c") : _values9.Text2__c)
      },
      key: 35
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n03",
        "fieldApiName": "n03__c",
        "isInlineEditable": true
      },
      key: 36
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state16 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord16 = _state16._ES5ProxyType ? _state16.get("flatRecord") : _state16.flatRecord, _values10 = _flatRecord16._ES5ProxyType ? _flatRecord16.get("values") : _flatRecord16.values, _n03__c = _values10._ES5ProxyType ? _values10.get("n03__c") : _values10.n03__c)
      },
      key: 37
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 38
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text3",
        "fieldApiName": "Text3__c",
        "isInlineEditable": true
      },
      key: 39
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state17 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord17 = _state17._ES5ProxyType ? _state17.get("flatRecord") : _state17.flatRecord, _values11 = _flatRecord17._ES5ProxyType ? _flatRecord17.get("values") : _flatRecord17.values, _Text3__c = _values11._ES5ProxyType ? _values11.get("Text3__c") : _values11.Text3__c)
      },
      key: 40
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n04",
        "fieldApiName": "n04__c",
        "isInlineEditable": true
      },
      key: 41
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state18 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord18 = _state18._ES5ProxyType ? _state18.get("flatRecord") : _state18.flatRecord, _values12 = _flatRecord18._ES5ProxyType ? _flatRecord18.get("values") : _flatRecord18.values, _n04__c = _values12._ES5ProxyType ? _values12.get("n04__c") : _values12.n04__c)
      },
      key: 42
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 43
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text4",
        "fieldApiName": "Text4__c",
        "isInlineEditable": true
      },
      key: 44
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state19 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord19 = _state19._ES5ProxyType ? _state19.get("flatRecord") : _state19.flatRecord, _values13 = _flatRecord19._ES5ProxyType ? _flatRecord19.get("values") : _flatRecord19.values, _Text4__c = _values13._ES5ProxyType ? _values13.get("Text4__c") : _values13.Text4__c)
      },
      key: 45
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n05",
        "fieldApiName": "n05__c",
        "isInlineEditable": true
      },
      key: 46
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state20 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord20 = _state20._ES5ProxyType ? _state20.get("flatRecord") : _state20.flatRecord, _values14 = _flatRecord20._ES5ProxyType ? _flatRecord20.get("values") : _flatRecord20.values, _n05__c = _values14._ES5ProxyType ? _values14.get("n05__c") : _values14.n05__c)
      },
      key: 47
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 48
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text5",
        "fieldApiName": "Text5__c",
        "isInlineEditable": true
      },
      key: 49
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state21 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord21 = _state21._ES5ProxyType ? _state21.get("flatRecord") : _state21.flatRecord, _values15 = _flatRecord21._ES5ProxyType ? _flatRecord21.get("values") : _flatRecord21.values, _Text5__c = _values15._ES5ProxyType ? _values15.get("Text5__c") : _values15.Text5__c)
      },
      key: 50
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n06",
        "fieldApiName": "n06__c",
        "isInlineEditable": true
      },
      key: 51
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state22 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord22 = _state22._ES5ProxyType ? _state22.get("flatRecord") : _state22.flatRecord, _values16 = _flatRecord22._ES5ProxyType ? _flatRecord22.get("values") : _flatRecord22.values, _n06__c = _values16._ES5ProxyType ? _values16.get("n06__c") : _values16.n06__c)
      },
      key: 52
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 53
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox1",
        "fieldApiName": "Checkbox1__c",
        "isInlineEditable": true
      },
      key: 54
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state23 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord23 = _state23._ES5ProxyType ? _state23.get("flatRecord") : _state23.flatRecord, _values17 = _flatRecord23._ES5ProxyType ? _flatRecord23.get("values") : _flatRecord23.values, _Checkbox1__c = _values17._ES5ProxyType ? _values17.get("Checkbox1__c") : _values17.Checkbox1__c)
      },
      key: 55
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n07",
        "fieldApiName": "n07__c",
        "isInlineEditable": true
      },
      key: 56
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state24 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord24 = _state24._ES5ProxyType ? _state24.get("flatRecord") : _state24.flatRecord, _values18 = _flatRecord24._ES5ProxyType ? _flatRecord24.get("values") : _flatRecord24.values, _n07__c = _values18._ES5ProxyType ? _values18.get("n07__c") : _values18.n07__c)
      },
      key: 57
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 58
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox2",
        "fieldApiName": "Checkbox2__c",
        "isInlineEditable": true
      },
      key: 59
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state25 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord25 = _state25._ES5ProxyType ? _state25.get("flatRecord") : _state25.flatRecord, _values19 = _flatRecord25._ES5ProxyType ? _flatRecord25.get("values") : _flatRecord25.values, _Checkbox2__c = _values19._ES5ProxyType ? _values19.get("Checkbox2__c") : _values19.Checkbox2__c)
      },
      key: 60
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n08",
        "fieldApiName": "n08__c",
        "isInlineEditable": true
      },
      key: 61
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state26 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord26 = _state26._ES5ProxyType ? _state26.get("flatRecord") : _state26.flatRecord, _values20 = _flatRecord26._ES5ProxyType ? _flatRecord26.get("values") : _flatRecord26.values, _n08__c = _values20._ES5ProxyType ? _values20.get("n08__c") : _values20.n08__c)
      },
      key: 62
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 63
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox3",
        "fieldApiName": "Checkbox3__c",
        "isInlineEditable": true
      },
      key: 64
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state27 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord27 = _state27._ES5ProxyType ? _state27.get("flatRecord") : _state27.flatRecord, _values21 = _flatRecord27._ES5ProxyType ? _flatRecord27.get("values") : _flatRecord27.values, _Checkbox3__c = _values21._ES5ProxyType ? _values21.get("Checkbox3__c") : _values21.Checkbox3__c)
      },
      key: 65
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n09",
        "fieldApiName": "n09__c",
        "isInlineEditable": true
      },
      key: 66
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state28 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord28 = _state28._ES5ProxyType ? _state28.get("flatRecord") : _state28.flatRecord, _values22 = _flatRecord28._ES5ProxyType ? _flatRecord28.get("values") : _flatRecord28.values, _n09__c = _values22._ES5ProxyType ? _values22.get("n09__c") : _values22.n09__c)
      },
      key: 67
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 68
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox4",
        "fieldApiName": "Checkbox4__c",
        "isInlineEditable": true
      },
      key: 69
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state29 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord29 = _state29._ES5ProxyType ? _state29.get("flatRecord") : _state29.flatRecord, _values23 = _flatRecord29._ES5ProxyType ? _flatRecord29.get("values") : _flatRecord29.values, _Checkbox4__c = _values23._ES5ProxyType ? _values23.get("Checkbox4__c") : _values23.Checkbox4__c)
      },
      key: 70
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "n10",
        "fieldApiName": "n10__c",
        "isInlineEditable": true
      },
      key: 71
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state30 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord30 = _state30._ES5ProxyType ? _state30.get("flatRecord") : _state30.flatRecord, _values24 = _flatRecord30._ES5ProxyType ? _flatRecord30.get("values") : _flatRecord30.values, _n10__c = _values24._ES5ProxyType ? _values24.get("n10__c") : _values24.n10__c)
      },
      key: 72
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 73
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox15",
        "fieldApiName": "Checkbox15__c",
        "isInlineEditable": true
      },
      key: 74
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state31 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord31 = _state31._ES5ProxyType ? _state31.get("flatRecord") : _state31.flatRecord, _values25 = _flatRecord31._ES5ProxyType ? _flatRecord31.get("values") : _flatRecord31.values, _Checkbox15__c = _values25._ES5ProxyType ? _values25.get("Checkbox15__c") : _values25.Checkbox15__c)
      },
      key: 75
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e04",
        "fieldApiName": "e04__c",
        "isInlineEditable": true
      },
      key: 76
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state32 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord32 = _state32._ES5ProxyType ? _state32.get("flatRecord") : _state32.flatRecord, _values26 = _flatRecord32._ES5ProxyType ? _flatRecord32.get("values") : _flatRecord32.values, _e04__c = _values26._ES5ProxyType ? _values26.get("e04__c") : _values26.e04__c),
        "value": (_state33 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord33 = _state33._ES5ProxyType ? _state33.get("flatRecord") : _state33.flatRecord, _values27 = _flatRecord33._ES5ProxyType ? _flatRecord33.get("values") : _flatRecord33.values, _e04__c2 = _values27._ES5ProxyType ? _values27.get("e04__c") : _values27.e04__c)
      },
      key: 77
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 78
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox7",
        "fieldApiName": "Checkbox7__c",
        "isInlineEditable": true
      },
      key: 79
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state34 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord34 = _state34._ES5ProxyType ? _state34.get("flatRecord") : _state34.flatRecord, _values28 = _flatRecord34._ES5ProxyType ? _flatRecord34.get("values") : _flatRecord34.values, _Checkbox7__c = _values28._ES5ProxyType ? _values28.get("Checkbox7__c") : _values28.Checkbox7__c)
      },
      key: 80
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e02",
        "fieldApiName": "e02__c",
        "isInlineEditable": true
      },
      key: 81
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state35 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord35 = _state35._ES5ProxyType ? _state35.get("flatRecord") : _state35.flatRecord, _values29 = _flatRecord35._ES5ProxyType ? _flatRecord35.get("values") : _flatRecord35.values, _e02__c = _values29._ES5ProxyType ? _values29.get("e02__c") : _values29.e02__c),
        "value": (_state36 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord36 = _state36._ES5ProxyType ? _state36.get("flatRecord") : _state36.flatRecord, _values30 = _flatRecord36._ES5ProxyType ? _flatRecord36.get("values") : _flatRecord36.values, _e02__c2 = _values30._ES5ProxyType ? _values30.get("e02__c") : _values30.e02__c)
      },
      key: 82
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 83
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox5",
        "fieldApiName": "Checkbox5__c",
        "isInlineEditable": true
      },
      key: 84
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state37 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord37 = _state37._ES5ProxyType ? _state37.get("flatRecord") : _state37.flatRecord, _values31 = _flatRecord37._ES5ProxyType ? _flatRecord37.get("values") : _flatRecord37.values, _Checkbox5__c = _values31._ES5ProxyType ? _values31.get("Checkbox5__c") : _values31.Checkbox5__c)
      },
      key: 85
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e03",
        "fieldApiName": "e03__c",
        "isInlineEditable": true
      },
      key: 86
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state38 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord38 = _state38._ES5ProxyType ? _state38.get("flatRecord") : _state38.flatRecord, _values32 = _flatRecord38._ES5ProxyType ? _flatRecord38.get("values") : _flatRecord38.values, _e03__c = _values32._ES5ProxyType ? _values32.get("e03__c") : _values32.e03__c),
        "value": (_state39 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord39 = _state39._ES5ProxyType ? _state39.get("flatRecord") : _state39.flatRecord, _values33 = _flatRecord39._ES5ProxyType ? _flatRecord39.get("values") : _flatRecord39.values, _e03__c2 = _values33._ES5ProxyType ? _values33.get("e03__c") : _values33.e03__c)
      },
      key: 87
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 88
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox18",
        "fieldApiName": "Checkbox18__c",
        "isInlineEditable": true
      },
      key: 89
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state40 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord40 = _state40._ES5ProxyType ? _state40.get("flatRecord") : _state40.flatRecord, _values34 = _flatRecord40._ES5ProxyType ? _flatRecord40.get("values") : _flatRecord40.values, _Checkbox18__c = _values34._ES5ProxyType ? _values34.get("Checkbox18__c") : _values34.Checkbox18__c)
      },
      key: 90
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e05",
        "fieldApiName": "e05__c",
        "isInlineEditable": true
      },
      key: 91
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state41 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord41 = _state41._ES5ProxyType ? _state41.get("flatRecord") : _state41.flatRecord, _values35 = _flatRecord41._ES5ProxyType ? _flatRecord41.get("values") : _flatRecord41.values, _e05__c = _values35._ES5ProxyType ? _values35.get("e05__c") : _values35.e05__c),
        "value": (_state42 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord42 = _state42._ES5ProxyType ? _state42.get("flatRecord") : _state42.flatRecord, _values36 = _flatRecord42._ES5ProxyType ? _flatRecord42.get("values") : _flatRecord42.values, _e05__c2 = _values36._ES5ProxyType ? _values36.get("e05__c") : _values36.e05__c)
      },
      key: 92
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 93
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox19",
        "fieldApiName": "Checkbox19__c",
        "isInlineEditable": true
      },
      key: 94
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state43 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord43 = _state43._ES5ProxyType ? _state43.get("flatRecord") : _state43.flatRecord, _values37 = _flatRecord43._ES5ProxyType ? _flatRecord43.get("values") : _flatRecord43.values, _Checkbox19__c = _values37._ES5ProxyType ? _values37.get("Checkbox19__c") : _values37.Checkbox19__c)
      },
      key: 95
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e06",
        "fieldApiName": "e06__c",
        "isInlineEditable": true
      },
      key: 96
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state44 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord44 = _state44._ES5ProxyType ? _state44.get("flatRecord") : _state44.flatRecord, _values38 = _flatRecord44._ES5ProxyType ? _flatRecord44.get("values") : _flatRecord44.values, _e06__c = _values38._ES5ProxyType ? _values38.get("e06__c") : _values38.e06__c),
        "value": (_state45 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord45 = _state45._ES5ProxyType ? _state45.get("flatRecord") : _state45.flatRecord, _values39 = _flatRecord45._ES5ProxyType ? _flatRecord45.get("values") : _flatRecord45.values, _e06__c2 = _values39._ES5ProxyType ? _values39.get("e06__c") : _values39.e06__c)
      },
      key: 97
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 98
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox9",
        "fieldApiName": "Checkbox9__c",
        "isInlineEditable": true
      },
      key: 99
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state46 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord46 = _state46._ES5ProxyType ? _state46.get("flatRecord") : _state46.flatRecord, _values40 = _flatRecord46._ES5ProxyType ? _flatRecord46.get("values") : _flatRecord46.values, _Checkbox9__c = _values40._ES5ProxyType ? _values40.get("Checkbox9__c") : _values40.Checkbox9__c)
      },
      key: 100
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e08",
        "fieldApiName": "e08__c",
        "isInlineEditable": true
      },
      key: 101
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state47 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord47 = _state47._ES5ProxyType ? _state47.get("flatRecord") : _state47.flatRecord, _values41 = _flatRecord47._ES5ProxyType ? _flatRecord47.get("values") : _flatRecord47.values, _e08__c = _values41._ES5ProxyType ? _values41.get("e08__c") : _values41.e08__c),
        "value": (_state48 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord48 = _state48._ES5ProxyType ? _state48.get("flatRecord") : _state48.flatRecord, _values42 = _flatRecord48._ES5ProxyType ? _flatRecord48.get("values") : _flatRecord48.values, _e08__c2 = _values42._ES5ProxyType ? _values42.get("e08__c") : _values42.e08__c)
      },
      key: 102
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 103
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox20",
        "fieldApiName": "Checkbox20__c",
        "isInlineEditable": true
      },
      key: 104
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state49 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord49 = _state49._ES5ProxyType ? _state49.get("flatRecord") : _state49.flatRecord, _values43 = _flatRecord49._ES5ProxyType ? _flatRecord49.get("values") : _flatRecord49.values, _Checkbox20__c = _values43._ES5ProxyType ? _values43.get("Checkbox20__c") : _values43.Checkbox20__c)
      },
      key: 105
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e10",
        "fieldApiName": "e10__c",
        "isInlineEditable": true
      },
      key: 106
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state50 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord50 = _state50._ES5ProxyType ? _state50.get("flatRecord") : _state50.flatRecord, _values44 = _flatRecord50._ES5ProxyType ? _flatRecord50.get("values") : _flatRecord50.values, _e10__c = _values44._ES5ProxyType ? _values44.get("e10__c") : _values44.e10__c),
        "value": (_state51 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord51 = _state51._ES5ProxyType ? _state51.get("flatRecord") : _state51.flatRecord, _values45 = _flatRecord51._ES5ProxyType ? _flatRecord51.get("values") : _flatRecord51.values, _e10__c2 = _values45._ES5ProxyType ? _values45.get("e10__c") : _values45.e10__c)
      },
      key: 107
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 108
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox8",
        "fieldApiName": "Checkbox8__c",
        "isInlineEditable": true
      },
      key: 109
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state52 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord52 = _state52._ES5ProxyType ? _state52.get("flatRecord") : _state52.flatRecord, _values46 = _flatRecord52._ES5ProxyType ? _flatRecord52.get("values") : _flatRecord52.values, _Checkbox8__c = _values46._ES5ProxyType ? _values46.get("Checkbox8__c") : _values46.Checkbox8__c)
      },
      key: 110
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date1",
        "fieldApiName": "Date1__c",
        "isInlineEditable": true
      },
      key: 111
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state53 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord53 = _state53._ES5ProxyType ? _state53.get("flatRecord") : _state53.flatRecord, _displayValues7 = _flatRecord53._ES5ProxyType ? _flatRecord53.get("displayValues") : _flatRecord53.displayValues, _Date1__c = _displayValues7._ES5ProxyType ? _displayValues7.get("Date1__c") : _displayValues7.Date1__c)
      },
      key: 112
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 113
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox6",
        "fieldApiName": "Checkbox6__c",
        "isInlineEditable": true
      },
      key: 114
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state54 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord54 = _state54._ES5ProxyType ? _state54.get("flatRecord") : _state54.flatRecord, _values47 = _flatRecord54._ES5ProxyType ? _flatRecord54.get("values") : _flatRecord54.values, _Checkbox6__c = _values47._ES5ProxyType ? _values47.get("Checkbox6__c") : _values47.Checkbox6__c)
      },
      key: 115
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt10",
        "fieldApiName": "dt10__c",
        "isInlineEditable": true
      },
      key: 116
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state55 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord55 = _state55._ES5ProxyType ? _state55.get("flatRecord") : _state55.flatRecord, _displayValues8 = _flatRecord55._ES5ProxyType ? _flatRecord55.get("displayValues") : _flatRecord55.displayValues, _dt10__c = _displayValues8._ES5ProxyType ? _displayValues8.get("dt10__c") : _displayValues8.dt10__c)
      },
      key: 117
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 118
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox17",
        "fieldApiName": "Checkbox17__c",
        "isInlineEditable": true
      },
      key: 119
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state56 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord56 = _state56._ES5ProxyType ? _state56.get("flatRecord") : _state56.flatRecord, _values48 = _flatRecord56._ES5ProxyType ? _flatRecord56.get("values") : _flatRecord56.values, _Checkbox17__c = _values48._ES5ProxyType ? _values48.get("Checkbox17__c") : _values48.Checkbox17__c)
      },
      key: 120
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e01",
        "fieldApiName": "e01__c",
        "isInlineEditable": true
      },
      key: 121
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state57 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord57 = _state57._ES5ProxyType ? _state57.get("flatRecord") : _state57.flatRecord, _values49 = _flatRecord57._ES5ProxyType ? _flatRecord57.get("values") : _flatRecord57.values, _e01__c = _values49._ES5ProxyType ? _values49.get("e01__c") : _values49.e01__c),
        "value": (_state58 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord58 = _state58._ES5ProxyType ? _state58.get("flatRecord") : _state58.flatRecord, _values50 = _flatRecord58._ES5ProxyType ? _flatRecord58.get("values") : _flatRecord58.values, _e01__c2 = _values50._ES5ProxyType ? _values50.get("e01__c") : _values50.e01__c)
      },
      key: 122
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 123
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox16",
        "fieldApiName": "Checkbox16__c",
        "isInlineEditable": true
      },
      key: 124
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state59 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord59 = _state59._ES5ProxyType ? _state59.get("flatRecord") : _state59.flatRecord, _values51 = _flatRecord59._ES5ProxyType ? _flatRecord59.get("values") : _flatRecord59.values, _Checkbox16__c = _values51._ES5ProxyType ? _values51.get("Checkbox16__c") : _values51.Checkbox16__c)
      },
      key: 125
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e09",
        "fieldApiName": "e09__c",
        "isInlineEditable": true
      },
      key: 126
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state60 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord60 = _state60._ES5ProxyType ? _state60.get("flatRecord") : _state60.flatRecord, _values52 = _flatRecord60._ES5ProxyType ? _flatRecord60.get("values") : _flatRecord60.values, _e09__c = _values52._ES5ProxyType ? _values52.get("e09__c") : _values52.e09__c),
        "value": (_state61 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord61 = _state61._ES5ProxyType ? _state61.get("flatRecord") : _state61.flatRecord, _values53 = _flatRecord61._ES5ProxyType ? _flatRecord61.get("values") : _flatRecord61.values, _e09__c2 = _values53._ES5ProxyType ? _values53.get("e09__c") : _values53.e09__c)
      },
      key: 127
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 128
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox12",
        "fieldApiName": "Checkbox12__c",
        "isInlineEditable": true
      },
      key: 129
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state62 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord62 = _state62._ES5ProxyType ? _state62.get("flatRecord") : _state62.flatRecord, _values54 = _flatRecord62._ES5ProxyType ? _flatRecord62.get("values") : _flatRecord62.values, _Checkbox12__c = _values54._ES5ProxyType ? _values54.get("Checkbox12__c") : _values54.Checkbox12__c)
      },
      key: 130
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "rt02",
        "fieldApiName": "rt02__c",
        "isInlineEditable": true
      },
      key: 131
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state63 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord63 = _state63._ES5ProxyType ? _state63.get("flatRecord") : _state63.flatRecord, _values55 = _flatRecord63._ES5ProxyType ? _flatRecord63.get("values") : _flatRecord63.values, _rt02__c = _values55._ES5ProxyType ? _values55.get("rt02__c") : _values55.rt02__c)
      },
      key: 132
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 133
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox14",
        "fieldApiName": "Checkbox14__c",
        "isInlineEditable": true
      },
      key: 134
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state64 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord64 = _state64._ES5ProxyType ? _state64.get("flatRecord") : _state64.flatRecord, _values56 = _flatRecord64._ES5ProxyType ? _flatRecord64.get("values") : _flatRecord64.values, _Checkbox14__c = _values56._ES5ProxyType ? _values56.get("Checkbox14__c") : _values56.Checkbox14__c)
      },
      key: 135
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "c02",
        "fieldApiName": "c02__c",
        "isInlineEditable": true
      },
      key: 136
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state65 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord65 = _state65._ES5ProxyType ? _state65.get("flatRecord") : _state65.flatRecord, _displayValues9 = _flatRecord65._ES5ProxyType ? _flatRecord65.get("displayValues") : _flatRecord65.displayValues, _c02__c = _displayValues9._ES5ProxyType ? _displayValues9.get("c02__c") : _displayValues9.c02__c)
      },
      key: 137
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 138
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox10",
        "fieldApiName": "Checkbox10__c",
        "isInlineEditable": true
      },
      key: 139
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state66 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord66 = _state66._ES5ProxyType ? _state66.get("flatRecord") : _state66.flatRecord, _values57 = _flatRecord66._ES5ProxyType ? _flatRecord66.get("values") : _flatRecord66.values, _Checkbox10__c = _values57._ES5ProxyType ? _values57.get("Checkbox10__c") : _values57.Checkbox10__c)
      },
      key: 140
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "c04",
        "fieldApiName": "c04__c",
        "isInlineEditable": true
      },
      key: 141
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state67 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord67 = _state67._ES5ProxyType ? _state67.get("flatRecord") : _state67.flatRecord, _displayValues10 = _flatRecord67._ES5ProxyType ? _flatRecord67.get("displayValues") : _flatRecord67.displayValues, _c04__c = _displayValues10._ES5ProxyType ? _displayValues10.get("c04__c") : _displayValues10.c04__c)
      },
      key: 142
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 143
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox13",
        "fieldApiName": "Checkbox13__c",
        "isInlineEditable": true
      },
      key: 144
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state68 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord68 = _state68._ES5ProxyType ? _state68.get("flatRecord") : _state68.flatRecord, _values58 = _flatRecord68._ES5ProxyType ? _flatRecord68.get("values") : _flatRecord68.values, _Checkbox13__c = _values58._ES5ProxyType ? _values58.get("Checkbox13__c") : _values58.Checkbox13__c)
      },
      key: 145
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "date02",
        "fieldApiName": "date02__c",
        "isInlineEditable": true
      },
      key: 146
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state69 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord69 = _state69._ES5ProxyType ? _state69.get("flatRecord") : _state69.flatRecord, _displayValues11 = _flatRecord69._ES5ProxyType ? _flatRecord69.get("displayValues") : _flatRecord69.displayValues, _date02__c = _displayValues11._ES5ProxyType ? _displayValues11.get("date02__c") : _displayValues11.date02__c)
      },
      key: 147
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 148
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Checkbox11",
        "fieldApiName": "Checkbox11__c",
        "isInlineEditable": true
      },
      key: 149
    }, [api_element("input", {
      attrs: {
        "type": "checkbox"
      },
      props: {
        "checked": (_state70 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord70 = _state70._ES5ProxyType ? _state70.get("flatRecord") : _state70.flatRecord, _values59 = _flatRecord70._ES5ProxyType ? _flatRecord70.get("values") : _flatRecord70.values, _Checkbox11__c = _values59._ES5ProxyType ? _values59.get("Checkbox11__c") : _values59.Checkbox11__c)
      },
      key: 150
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "date04",
        "fieldApiName": "date04__c",
        "isInlineEditable": true
      },
      key: 151
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state71 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord71 = _state71._ES5ProxyType ? _state71.get("flatRecord") : _state71.flatRecord, _displayValues12 = _flatRecord71._ES5ProxyType ? _flatRecord71.get("displayValues") : _flatRecord71.displayValues, _date04__c = _displayValues12._ES5ProxyType ? _displayValues12.get("date04__c") : _displayValues12.date04__c)
      },
      key: 152
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 153
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt01",
        "fieldApiName": "dt01__c",
        "isInlineEditable": true
      },
      key: 154
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state72 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord72 = _state72._ES5ProxyType ? _state72.get("flatRecord") : _state72.flatRecord, _displayValues13 = _flatRecord72._ES5ProxyType ? _flatRecord72.get("displayValues") : _flatRecord72.displayValues, _dt01__c = _displayValues13._ES5ProxyType ? _displayValues13.get("dt01__c") : _displayValues13.dt01__c)
      },
      key: 155
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent02",
        "fieldApiName": "percent02__c",
        "isInlineEditable": true
      },
      key: 156
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state73 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord73 = _state73._ES5ProxyType ? _state73.get("flatRecord") : _state73.flatRecord, _values60 = _flatRecord73._ES5ProxyType ? _flatRecord73.get("values") : _flatRecord73.values, _percent02__c = _values60._ES5ProxyType ? _values60.get("percent02__c") : _values60.percent02__c)
      },
      key: 157
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 158
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt02",
        "fieldApiName": "dt02__c",
        "isInlineEditable": true
      },
      key: 159
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state74 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord74 = _state74._ES5ProxyType ? _state74.get("flatRecord") : _state74.flatRecord, _displayValues14 = _flatRecord74._ES5ProxyType ? _flatRecord74.get("displayValues") : _flatRecord74.displayValues, _dt02__c = _displayValues14._ES5ProxyType ? _displayValues14.get("dt02__c") : _displayValues14.dt02__c)
      },
      key: 160
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent04",
        "fieldApiName": "percent04__c",
        "isInlineEditable": true
      },
      key: 161
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state75 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord75 = _state75._ES5ProxyType ? _state75.get("flatRecord") : _state75.flatRecord, _values61 = _flatRecord75._ES5ProxyType ? _flatRecord75.get("values") : _flatRecord75.values, _percent04__c = _values61._ES5ProxyType ? _values61.get("percent04__c") : _values61.percent04__c)
      },
      key: 162
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 163
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt03",
        "fieldApiName": "dt03__c",
        "isInlineEditable": true
      },
      key: 164
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state76 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord76 = _state76._ES5ProxyType ? _state76.get("flatRecord") : _state76.flatRecord, _displayValues15 = _flatRecord76._ES5ProxyType ? _flatRecord76.get("displayValues") : _flatRecord76.displayValues, _dt03__c = _displayValues15._ES5ProxyType ? _displayValues15.get("dt03__c") : _displayValues15.dt03__c)
      },
      key: 165
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent06",
        "fieldApiName": "percent06__c",
        "isInlineEditable": true
      },
      key: 166
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state77 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord77 = _state77._ES5ProxyType ? _state77.get("flatRecord") : _state77.flatRecord, _values62 = _flatRecord77._ES5ProxyType ? _flatRecord77.get("values") : _flatRecord77.values, _percent06__c = _values62._ES5ProxyType ? _values62.get("percent06__c") : _values62.percent06__c)
      },
      key: 167
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 168
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt04",
        "fieldApiName": "dt04__c",
        "isInlineEditable": true
      },
      key: 169
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state78 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord78 = _state78._ES5ProxyType ? _state78.get("flatRecord") : _state78.flatRecord, _displayValues16 = _flatRecord78._ES5ProxyType ? _flatRecord78.get("displayValues") : _flatRecord78.displayValues, _dt04__c = _displayValues16._ES5ProxyType ? _displayValues16.get("dt04__c") : _displayValues16.dt04__c)
      },
      key: 170
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent09",
        "fieldApiName": "percent09__c",
        "isInlineEditable": true
      },
      key: 171
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state79 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord79 = _state79._ES5ProxyType ? _state79.get("flatRecord") : _state79.flatRecord, _values63 = _flatRecord79._ES5ProxyType ? _flatRecord79.get("values") : _flatRecord79.values, _percent09__c = _values63._ES5ProxyType ? _values63.get("percent09__c") : _values63.percent09__c)
      },
      key: 172
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 173
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt05",
        "fieldApiName": "dt05__c",
        "isInlineEditable": true
      },
      key: 174
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state80 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord80 = _state80._ES5ProxyType ? _state80.get("flatRecord") : _state80.flatRecord, _displayValues17 = _flatRecord80._ES5ProxyType ? _flatRecord80.get("displayValues") : _flatRecord80.displayValues, _dt05__c = _displayValues17._ES5ProxyType ? _displayValues17.get("dt05__c") : _displayValues17.dt05__c)
      },
      key: 175
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone01",
        "fieldApiName": "phone01__c",
        "isInlineEditable": true
      },
      key: 176
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state81 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord81 = _state81._ES5ProxyType ? _state81.get("flatRecord") : _state81.flatRecord, _values64 = _flatRecord81._ES5ProxyType ? _flatRecord81.get("values") : _flatRecord81.values, _phone01__c = _values64._ES5ProxyType ? _values64.get("phone01__c") : _values64.phone01__c)
      },
      key: 177
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 178
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt06",
        "fieldApiName": "dt06__c",
        "isInlineEditable": true
      },
      key: 179
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state82 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord82 = _state82._ES5ProxyType ? _state82.get("flatRecord") : _state82.flatRecord, _displayValues18 = _flatRecord82._ES5ProxyType ? _flatRecord82.get("displayValues") : _flatRecord82.displayValues, _dt06__c = _displayValues18._ES5ProxyType ? _displayValues18.get("dt06__c") : _displayValues18.dt06__c)
      },
      key: 180
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone03",
        "fieldApiName": "phone03__c",
        "isInlineEditable": true
      },
      key: 181
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state83 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord83 = _state83._ES5ProxyType ? _state83.get("flatRecord") : _state83.flatRecord, _values65 = _flatRecord83._ES5ProxyType ? _flatRecord83.get("values") : _flatRecord83.values, _phone03__c = _values65._ES5ProxyType ? _values65.get("phone03__c") : _values65.phone03__c)
      },
      key: 182
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 183
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt07",
        "fieldApiName": "dt07__c",
        "isInlineEditable": true
      },
      key: 184
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state84 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord84 = _state84._ES5ProxyType ? _state84.get("flatRecord") : _state84.flatRecord, _displayValues19 = _flatRecord84._ES5ProxyType ? _flatRecord84.get("displayValues") : _flatRecord84.displayValues, _dt07__c = _displayValues19._ES5ProxyType ? _displayValues19.get("dt07__c") : _displayValues19.dt07__c)
      },
      key: 185
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone05",
        "fieldApiName": "phone05__c",
        "isInlineEditable": true
      },
      key: 186
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state85 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord85 = _state85._ES5ProxyType ? _state85.get("flatRecord") : _state85.flatRecord, _values66 = _flatRecord85._ES5ProxyType ? _flatRecord85.get("values") : _flatRecord85.values, _phone05__c = _values66._ES5ProxyType ? _values66.get("phone05__c") : _values66.phone05__c)
      },
      key: 187
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 188
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt08",
        "fieldApiName": "dt08__c",
        "isInlineEditable": true
      },
      key: 189
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state86 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord86 = _state86._ES5ProxyType ? _state86.get("flatRecord") : _state86.flatRecord, _displayValues20 = _flatRecord86._ES5ProxyType ? _flatRecord86.get("displayValues") : _flatRecord86.displayValues, _dt08__c = _displayValues20._ES5ProxyType ? _displayValues20.get("dt08__c") : _displayValues20.dt08__c)
      },
      key: 190
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone07",
        "fieldApiName": "phone07__c",
        "isInlineEditable": true
      },
      key: 191
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state87 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord87 = _state87._ES5ProxyType ? _state87.get("flatRecord") : _state87.flatRecord, _values67 = _flatRecord87._ES5ProxyType ? _flatRecord87.get("values") : _flatRecord87.values, _phone07__c = _values67._ES5ProxyType ? _values67.get("phone07__c") : _values67.phone07__c)
      },
      key: 192
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 193
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "dt09",
        "fieldApiName": "dt09__c",
        "isInlineEditable": true
      },
      key: 194
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state88 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord88 = _state88._ES5ProxyType ? _state88.get("flatRecord") : _state88.flatRecord, _displayValues21 = _flatRecord88._ES5ProxyType ? _flatRecord88.get("displayValues") : _flatRecord88.displayValues, _dt09__c = _displayValues21._ES5ProxyType ? _displayValues21.get("dt09__c") : _displayValues21.dt09__c)
      },
      key: 195
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone09",
        "fieldApiName": "phone09__c",
        "isInlineEditable": true
      },
      key: 196
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state89 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord89 = _state89._ES5ProxyType ? _state89.get("flatRecord") : _state89.flatRecord, _values68 = _flatRecord89._ES5ProxyType ? _flatRecord89.get("values") : _flatRecord89.values, _phone09__c = _values68._ES5ProxyType ? _values68.get("phone09__c") : _values68.phone09__c)
      },
      key: 197
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 198
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "e07",
        "fieldApiName": "e07__c",
        "isInlineEditable": true
      },
      key: 199
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state90 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord90 = _state90._ES5ProxyType ? _state90.get("flatRecord") : _state90.flatRecord, _values69 = _flatRecord90._ES5ProxyType ? _flatRecord90.get("values") : _flatRecord90.values, _e07__c = _values69._ES5ProxyType ? _values69.get("e07__c") : _values69.e07__c),
        "value": (_state91 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord91 = _state91._ES5ProxyType ? _state91.get("flatRecord") : _state91.flatRecord, _values70 = _flatRecord91._ES5ProxyType ? _flatRecord91.get("values") : _flatRecord91.values, _e07__c2 = _values70._ES5ProxyType ? _values70.get("e07__c") : _values70.e07__c)
      },
      key: 200
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "url02",
        "fieldApiName": "url02__c",
        "isInlineEditable": true
      },
      key: 201
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state92 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord92 = _state92._ES5ProxyType ? _state92.get("flatRecord") : _state92.flatRecord, _values71 = _flatRecord92._ES5ProxyType ? _flatRecord92.get("values") : _flatRecord92.values, _url02__c = _values71._ES5ProxyType ? _values71.get("url02__c") : _values71.url02__c),
        "value": (_state93 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord93 = _state93._ES5ProxyType ? _state93.get("flatRecord") : _state93.flatRecord, _values72 = _flatRecord93._ES5ProxyType ? _flatRecord93.get("values") : _flatRecord93.values, _url02__c2 = _values72._ES5ProxyType ? _values72.get("url02__c") : _values72.url02__c)
      },
      key: 202
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 203
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "rt01",
        "fieldApiName": "rt01__c",
        "isInlineEditable": true
      },
      key: 204
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state94 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord94 = _state94._ES5ProxyType ? _state94.get("flatRecord") : _state94.flatRecord, _values73 = _flatRecord94._ES5ProxyType ? _flatRecord94.get("values") : _flatRecord94.values, _rt01__c = _values73._ES5ProxyType ? _values73.get("rt01__c") : _values73.rt01__c)
      },
      key: 205
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "picklist02",
        "fieldApiName": "picklist02__c",
        "isInlineEditable": true
      },
      key: 206
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state95 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord95 = _state95._ES5ProxyType ? _state95.get("flatRecord") : _state95.flatRecord, _displayValues22 = _flatRecord95._ES5ProxyType ? _flatRecord95.get("displayValues") : _flatRecord95.displayValues, _picklist02__c = _displayValues22._ES5ProxyType ? _displayValues22.get("picklist02__c") : _displayValues22.picklist02__c)
      },
      key: 207
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 208
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "c01",
        "fieldApiName": "c01__c",
        "isInlineEditable": true
      },
      key: 209
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state96 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord96 = _state96._ES5ProxyType ? _state96.get("flatRecord") : _state96.flatRecord, _displayValues23 = _flatRecord96._ES5ProxyType ? _flatRecord96.get("displayValues") : _flatRecord96.displayValues, _c01__c = _displayValues23._ES5ProxyType ? _displayValues23.get("c01__c") : _displayValues23.c01__c)
      },
      key: 210
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt02",
        "fieldApiName": "txt02__c",
        "isInlineEditable": true
      },
      key: 211
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state97 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord97 = _state97._ES5ProxyType ? _state97.get("flatRecord") : _state97.flatRecord, _values74 = _flatRecord97._ES5ProxyType ? _flatRecord97.get("values") : _flatRecord97.values, _txt02__c = _values74._ES5ProxyType ? _values74.get("txt02__c") : _values74.txt02__c)
      },
      key: 212
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 213
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "c03",
        "fieldApiName": "c03__c",
        "isInlineEditable": true
      },
      key: 214
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state98 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord98 = _state98._ES5ProxyType ? _state98.get("flatRecord") : _state98.flatRecord, _displayValues24 = _flatRecord98._ES5ProxyType ? _flatRecord98.get("displayValues") : _flatRecord98.displayValues, _c03__c = _displayValues24._ES5ProxyType ? _displayValues24.get("c03__c") : _displayValues24.c03__c)
      },
      key: 215
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt04",
        "fieldApiName": "txt04__c",
        "isInlineEditable": true
      },
      key: 216
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state99 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord99 = _state99._ES5ProxyType ? _state99.get("flatRecord") : _state99.flatRecord, _values75 = _flatRecord99._ES5ProxyType ? _flatRecord99.get("values") : _flatRecord99.values, _txt04__c = _values75._ES5ProxyType ? _values75.get("txt04__c") : _values75.txt04__c)
      },
      key: 217
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 218
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "c05",
        "fieldApiName": "c05__c",
        "isInlineEditable": true
      },
      key: 219
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state100 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord100 = _state100._ES5ProxyType ? _state100.get("flatRecord") : _state100.flatRecord, _displayValues25 = _flatRecord100._ES5ProxyType ? _flatRecord100.get("displayValues") : _flatRecord100.displayValues, _c05__c = _displayValues25._ES5ProxyType ? _displayValues25.get("c05__c") : _displayValues25.c05__c)
      },
      key: 220
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt06",
        "fieldApiName": "txt06__c",
        "isInlineEditable": true
      },
      key: 221
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state101 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord101 = _state101._ES5ProxyType ? _state101.get("flatRecord") : _state101.flatRecord, _values76 = _flatRecord101._ES5ProxyType ? _flatRecord101.get("values") : _flatRecord101.values, _txt06__c = _values76._ES5ProxyType ? _values76.get("txt06__c") : _values76.txt06__c)
      },
      key: 222
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 223
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "date01",
        "fieldApiName": "date01__c",
        "isInlineEditable": true
      },
      key: 224
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state102 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord102 = _state102._ES5ProxyType ? _state102.get("flatRecord") : _state102.flatRecord, _displayValues26 = _flatRecord102._ES5ProxyType ? _flatRecord102.get("displayValues") : _flatRecord102.displayValues, _date01__c = _displayValues26._ES5ProxyType ? _displayValues26.get("date01__c") : _displayValues26.date01__c)
      },
      key: 225
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt08",
        "fieldApiName": "txt08__c",
        "isInlineEditable": true
      },
      key: 226
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state103 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord103 = _state103._ES5ProxyType ? _state103.get("flatRecord") : _state103.flatRecord, _values77 = _flatRecord103._ES5ProxyType ? _flatRecord103.get("values") : _flatRecord103.values, _txt08__c = _values77._ES5ProxyType ? _values77.get("txt08__c") : _values77.txt08__c)
      },
      key: 227
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 228
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "date03",
        "fieldApiName": "date03__c",
        "isInlineEditable": true
      },
      key: 229
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state104 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord104 = _state104._ES5ProxyType ? _state104.get("flatRecord") : _state104.flatRecord, _displayValues27 = _flatRecord104._ES5ProxyType ? _flatRecord104.get("displayValues") : _flatRecord104.displayValues, _date03__c = _displayValues27._ES5ProxyType ? _displayValues27.get("date03__c") : _displayValues27.date03__c)
      },
      key: 230
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt10",
        "fieldApiName": "txt10__c",
        "isInlineEditable": true
      },
      key: 231
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state105 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord105 = _state105._ES5ProxyType ? _state105.get("flatRecord") : _state105.flatRecord, _values78 = _flatRecord105._ES5ProxyType ? _flatRecord105.get("values") : _flatRecord105.values, _txt10__c = _values78._ES5ProxyType ? _values78.get("txt10__c") : _values78.txt10__c)
      },
      key: 232
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 233
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent01",
        "fieldApiName": "percent01__c",
        "isInlineEditable": true
      },
      key: 234
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state106 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord106 = _state106._ES5ProxyType ? _state106.get("flatRecord") : _state106.flatRecord, _values79 = _flatRecord106._ES5ProxyType ? _flatRecord106.get("values") : _flatRecord106.values, _percent01__c = _values79._ES5ProxyType ? _values79.get("percent01__c") : _values79.percent01__c)
      },
      key: 235
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone10",
        "fieldApiName": "phone10__c",
        "isInlineEditable": true
      },
      key: 236
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state107 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord107 = _state107._ES5ProxyType ? _state107.get("flatRecord") : _state107.flatRecord, _values80 = _flatRecord107._ES5ProxyType ? _flatRecord107.get("values") : _flatRecord107.values, _phone10__c = _values80._ES5ProxyType ? _values80.get("phone10__c") : _values80.phone10__c)
      },
      key: 237
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 238
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent03",
        "fieldApiName": "percent03__c",
        "isInlineEditable": true
      },
      key: 239
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state108 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord108 = _state108._ES5ProxyType ? _state108.get("flatRecord") : _state108.flatRecord, _values81 = _flatRecord108._ES5ProxyType ? _flatRecord108.get("values") : _flatRecord108.values, _percent03__c = _values81._ES5ProxyType ? _values81.get("percent03__c") : _values81.percent03__c)
      },
      key: 240
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Price Book",
        "fieldApiName": "Pricebook2Id",
        "isInlineEditable": true
      },
      key: 241
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "displayValue": (_state109 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord109 = _state109._ES5ProxyType ? _state109.get("flatRecord") : _state109.flatRecord, _displayValues28 = _flatRecord109._ES5ProxyType ? _flatRecord109.get("displayValues") : _flatRecord109.displayValues, _Pricebook = _displayValues28._ES5ProxyType ? _displayValues28.get("Pricebook2") : _displayValues28.Pricebook2),
        "fieldApiName": "Pricebook2Id",
        "value": (_state110 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord110 = _state110._ES5ProxyType ? _state110.get("flatRecord") : _state110.flatRecord, _values82 = _flatRecord110._ES5ProxyType ? _flatRecord110.get("values") : _flatRecord110.values, _Pricebook2Id = _values82._ES5ProxyType ? _values82.get("Pricebook2Id") : _values82.Pricebook2Id)
      },
      key: 242
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 243
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent05",
        "fieldApiName": "percent05__c",
        "isInlineEditable": true
      },
      key: 244
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state111 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord111 = _state111._ES5ProxyType ? _state111.get("flatRecord") : _state111.flatRecord, _values83 = _flatRecord111._ES5ProxyType ? _flatRecord111.get("values") : _flatRecord111.values, _percent05__c = _values83._ES5ProxyType ? _values83.get("percent05__c") : _values83.percent05__c)
      },
      key: 245
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Lead Source",
        "fieldApiName": "LeadSource",
        "isInlineEditable": true
      },
      key: 246
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state112 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord112 = _state112._ES5ProxyType ? _state112.get("flatRecord") : _state112.flatRecord, _displayValues29 = _flatRecord112._ES5ProxyType ? _flatRecord112.get("displayValues") : _flatRecord112.displayValues, _LeadSource = _displayValues29._ES5ProxyType ? _displayValues29.get("LeadSource") : _displayValues29.LeadSource)
      },
      key: 247
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 248
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent07",
        "fieldApiName": "percent07__c",
        "isInlineEditable": true
      },
      key: 249
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state113 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord113 = _state113._ES5ProxyType ? _state113.get("flatRecord") : _state113.flatRecord, _values84 = _flatRecord113._ES5ProxyType ? _flatRecord113.get("values") : _flatRecord113.values, _percent07__c = _values84._ES5ProxyType ? _values84.get("percent07__c") : _values84.percent07__c)
      },
      key: 250
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Created By",
        "fieldApiName": "CreatedById"
      },
      key: 251
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "displayValue": (_state114 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord114 = _state114._ES5ProxyType ? _state114.get("flatRecord") : _state114.flatRecord, _displayValues30 = _flatRecord114._ES5ProxyType ? _flatRecord114.get("displayValues") : _flatRecord114.displayValues, _CreatedBy = _displayValues30._ES5ProxyType ? _displayValues30.get("CreatedBy") : _displayValues30.CreatedBy),
        "value": (_state115 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord115 = _state115._ES5ProxyType ? _state115.get("flatRecord") : _state115.flatRecord, _values85 = _flatRecord115._ES5ProxyType ? _flatRecord115.get("values") : _flatRecord115.values, _CreatedById = _values85._ES5ProxyType ? _values85.get("CreatedById") : _values85.CreatedById)
      },
      key: 252
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 253
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "percent8",
        "fieldApiName": "percent8__c",
        "isInlineEditable": true
      },
      key: 254
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state116 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord116 = _state116._ES5ProxyType ? _state116.get("flatRecord") : _state116.flatRecord, _values86 = _flatRecord116._ES5ProxyType ? _flatRecord116.get("values") : _flatRecord116.values, _percent8__c = _values86._ES5ProxyType ? _values86.get("percent8__c") : _values86.percent8__c)
      },
      key: 255
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "date05",
        "fieldApiName": "date05__c",
        "isInlineEditable": true
      },
      key: 256
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state117 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord117 = _state117._ES5ProxyType ? _state117.get("flatRecord") : _state117.flatRecord, _displayValues31 = _flatRecord117._ES5ProxyType ? _flatRecord117.get("displayValues") : _flatRecord117.displayValues, _date05__c = _displayValues31._ES5ProxyType ? _displayValues31.get("date05__c") : _displayValues31.date05__c)
      },
      key: 257
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 258
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone02",
        "fieldApiName": "phone02__c",
        "isInlineEditable": true
      },
      key: 259
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state118 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord118 = _state118._ES5ProxyType ? _state118.get("flatRecord") : _state118.flatRecord, _values87 = _flatRecord118._ES5ProxyType ? _flatRecord118.get("values") : _flatRecord118.values, _phone02__c = _values87._ES5ProxyType ? _values87.get("phone02__c") : _values87.phone02__c)
      },
      key: 260
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Forecast Category",
        "fieldApiName": "ForecastCategoryName",
        "isInlineEditable": true
      },
      key: 261
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state119 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord119 = _state119._ES5ProxyType ? _state119.get("flatRecord") : _state119.flatRecord, _displayValues32 = _flatRecord119._ES5ProxyType ? _flatRecord119.get("displayValues") : _flatRecord119.displayValues, _ForecastCategoryName = _displayValues32._ES5ProxyType ? _displayValues32.get("ForecastCategoryName") : _displayValues32.ForecastCategoryName)
      },
      key: 262
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 263
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone04",
        "fieldApiName": "phone04__c",
        "isInlineEditable": true
      },
      key: 264
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state120 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord120 = _state120._ES5ProxyType ? _state120.get("flatRecord") : _state120.flatRecord, _values88 = _flatRecord120._ES5ProxyType ? _flatRecord120.get("values") : _flatRecord120.values, _phone04__c = _values88._ES5ProxyType ? _values88.get("phone04__c") : _values88.phone04__c)
      },
      key: 265
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency12",
        "fieldApiName": "Currency12__c",
        "isInlineEditable": true
      },
      key: 266
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state121 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord121 = _state121._ES5ProxyType ? _state121.get("flatRecord") : _state121.flatRecord, _displayValues33 = _flatRecord121._ES5ProxyType ? _flatRecord121.get("displayValues") : _flatRecord121.displayValues, _Currency12__c = _displayValues33._ES5ProxyType ? _displayValues33.get("Currency12__c") : _displayValues33.Currency12__c)
      },
      key: 267
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 268
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone06",
        "fieldApiName": "phone06__c",
        "isInlineEditable": true
      },
      key: 269
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state122 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord122 = _state122._ES5ProxyType ? _state122.get("flatRecord") : _state122.flatRecord, _values89 = _flatRecord122._ES5ProxyType ? _flatRecord122.get("values") : _flatRecord122.values, _phone06__c = _values89._ES5ProxyType ? _values89.get("phone06__c") : _values89.phone06__c)
      },
      key: 270
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency10",
        "fieldApiName": "Currency10__c",
        "isInlineEditable": true
      },
      key: 271
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state123 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord123 = _state123._ES5ProxyType ? _state123.get("flatRecord") : _state123.flatRecord, _displayValues34 = _flatRecord123._ES5ProxyType ? _flatRecord123.get("displayValues") : _flatRecord123.displayValues, _Currency10__c = _displayValues34._ES5ProxyType ? _displayValues34.get("Currency10__c") : _displayValues34.Currency10__c)
      },
      key: 272
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 273
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "phone08",
        "fieldApiName": "phone08__c",
        "isInlineEditable": true
      },
      key: 274
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state124 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord124 = _state124._ES5ProxyType ? _state124.get("flatRecord") : _state124.flatRecord, _values90 = _flatRecord124._ES5ProxyType ? _flatRecord124.get("values") : _flatRecord124.values, _phone08__c = _values90._ES5ProxyType ? _values90.get("phone08__c") : _values90.phone08__c)
      },
      key: 275
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency11",
        "fieldApiName": "Currency11__c",
        "isInlineEditable": true
      },
      key: 276
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state125 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord125 = _state125._ES5ProxyType ? _state125.get("flatRecord") : _state125.flatRecord, _displayValues35 = _flatRecord125._ES5ProxyType ? _flatRecord125.get("displayValues") : _flatRecord125.displayValues, _Currency11__c = _displayValues35._ES5ProxyType ? _displayValues35.get("Currency11__c") : _displayValues35.Currency11__c)
      },
      key: 277
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 278
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "url01",
        "fieldApiName": "url01__c",
        "isInlineEditable": true
      },
      key: 279
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state126 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord126 = _state126._ES5ProxyType ? _state126.get("flatRecord") : _state126.flatRecord, _values91 = _flatRecord126._ES5ProxyType ? _flatRecord126.get("values") : _flatRecord126.values, _url01__c = _values91._ES5ProxyType ? _values91.get("url01__c") : _values91.url01__c),
        "value": (_state127 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord127 = _state127._ES5ProxyType ? _state127.get("flatRecord") : _state127.flatRecord, _values92 = _flatRecord127._ES5ProxyType ? _flatRecord127.get("values") : _flatRecord127.values, _url01__c2 = _values92._ES5ProxyType ? _values92.get("url01__c") : _values92.url01__c)
      },
      key: 280
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency16",
        "fieldApiName": "Currency16__c",
        "isInlineEditable": true
      },
      key: 281
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state128 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord128 = _state128._ES5ProxyType ? _state128.get("flatRecord") : _state128.flatRecord, _displayValues36 = _flatRecord128._ES5ProxyType ? _flatRecord128.get("displayValues") : _flatRecord128.displayValues, _Currency16__c = _displayValues36._ES5ProxyType ? _displayValues36.get("Currency16__c") : _displayValues36.Currency16__c)
      },
      key: 282
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 283
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "picklist",
        "fieldApiName": "picklist__c",
        "isInlineEditable": true
      },
      key: 284
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state129 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord129 = _state129._ES5ProxyType ? _state129.get("flatRecord") : _state129.flatRecord, _displayValues37 = _flatRecord129._ES5ProxyType ? _flatRecord129.get("displayValues") : _flatRecord129.displayValues, _picklist__c = _displayValues37._ES5ProxyType ? _displayValues37.get("picklist__c") : _displayValues37.picklist__c)
      },
      key: 285
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency15",
        "fieldApiName": "Currency15__c",
        "isInlineEditable": true
      },
      key: 286
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state130 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord130 = _state130._ES5ProxyType ? _state130.get("flatRecord") : _state130.flatRecord, _displayValues38 = _flatRecord130._ES5ProxyType ? _flatRecord130.get("displayValues") : _flatRecord130.displayValues, _Currency15__c = _displayValues38._ES5ProxyType ? _displayValues38.get("Currency15__c") : _displayValues38.Currency15__c)
      },
      key: 287
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 288
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt01",
        "fieldApiName": "txt01__c",
        "isInlineEditable": true
      },
      key: 289
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state131 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord131 = _state131._ES5ProxyType ? _state131.get("flatRecord") : _state131.flatRecord, _values93 = _flatRecord131._ES5ProxyType ? _flatRecord131.get("values") : _flatRecord131.values, _txt01__c = _values93._ES5ProxyType ? _values93.get("txt01__c") : _values93.txt01__c)
      },
      key: 290
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency14",
        "fieldApiName": "Currency14__c",
        "isInlineEditable": true
      },
      key: 291
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state132 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord132 = _state132._ES5ProxyType ? _state132.get("flatRecord") : _state132.flatRecord, _displayValues39 = _flatRecord132._ES5ProxyType ? _flatRecord132.get("displayValues") : _flatRecord132.displayValues, _Currency14__c = _displayValues39._ES5ProxyType ? _displayValues39.get("Currency14__c") : _displayValues39.Currency14__c)
      },
      key: 292
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 293
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt03",
        "fieldApiName": "txt03__c",
        "isInlineEditable": true
      },
      key: 294
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state133 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord133 = _state133._ES5ProxyType ? _state133.get("flatRecord") : _state133.flatRecord, _values94 = _flatRecord133._ES5ProxyType ? _flatRecord133.get("values") : _flatRecord133.values, _txt03__c = _values94._ES5ProxyType ? _values94.get("txt03__c") : _values94.txt03__c)
      },
      key: 295
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency2",
        "fieldApiName": "Currency2__c",
        "isInlineEditable": true
      },
      key: 296
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state134 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord134 = _state134._ES5ProxyType ? _state134.get("flatRecord") : _state134.flatRecord, _displayValues40 = _flatRecord134._ES5ProxyType ? _flatRecord134.get("displayValues") : _flatRecord134.displayValues, _Currency2__c = _displayValues40._ES5ProxyType ? _displayValues40.get("Currency2__c") : _displayValues40.Currency2__c)
      },
      key: 297
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 298
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt05",
        "fieldApiName": "txt05__c",
        "isInlineEditable": true
      },
      key: 299
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state135 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord135 = _state135._ES5ProxyType ? _state135.get("flatRecord") : _state135.flatRecord, _values95 = _flatRecord135._ES5ProxyType ? _flatRecord135.get("values") : _flatRecord135.values, _txt05__c = _values95._ES5ProxyType ? _values95.get("txt05__c") : _values95.txt05__c)
      },
      key: 300
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency18",
        "fieldApiName": "Currency18__c",
        "isInlineEditable": true
      },
      key: 301
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state136 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord136 = _state136._ES5ProxyType ? _state136.get("flatRecord") : _state136.flatRecord, _displayValues41 = _flatRecord136._ES5ProxyType ? _flatRecord136.get("displayValues") : _flatRecord136.displayValues, _Currency18__c = _displayValues41._ES5ProxyType ? _displayValues41.get("Currency18__c") : _displayValues41.Currency18__c)
      },
      key: 302
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 303
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt07",
        "fieldApiName": "txt07__c",
        "isInlineEditable": true
      },
      key: 304
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state137 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord137 = _state137._ES5ProxyType ? _state137.get("flatRecord") : _state137.flatRecord, _values96 = _flatRecord137._ES5ProxyType ? _flatRecord137.get("values") : _flatRecord137.values, _txt07__c = _values96._ES5ProxyType ? _values96.get("txt07__c") : _values96.txt07__c)
      },
      key: 305
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency8",
        "fieldApiName": "Currency8__c",
        "isInlineEditable": true
      },
      key: 306
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state138 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord138 = _state138._ES5ProxyType ? _state138.get("flatRecord") : _state138.flatRecord, _displayValues42 = _flatRecord138._ES5ProxyType ? _flatRecord138.get("displayValues") : _flatRecord138.displayValues, _Currency8__c = _displayValues42._ES5ProxyType ? _displayValues42.get("Currency8__c") : _displayValues42.Currency8__c)
      },
      key: 307
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 308
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "txt09",
        "fieldApiName": "txt09__c",
        "isInlineEditable": true
      },
      key: 309
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state139 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord139 = _state139._ES5ProxyType ? _state139.get("flatRecord") : _state139.flatRecord, _values97 = _flatRecord139._ES5ProxyType ? _flatRecord139.get("values") : _flatRecord139.values, _txt09__c = _values97._ES5ProxyType ? _values97.get("txt09__c") : _values97.txt09__c)
      },
      key: 310
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency5",
        "fieldApiName": "Currency5__c",
        "isInlineEditable": true
      },
      key: 311
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state140 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord140 = _state140._ES5ProxyType ? _state140.get("flatRecord") : _state140.flatRecord, _displayValues43 = _flatRecord140._ES5ProxyType ? _flatRecord140.get("displayValues") : _flatRecord140.displayValues, _Currency5__c = _displayValues43._ES5ProxyType ? _displayValues43.get("Currency5__c") : _displayValues43.Currency5__c)
      },
      key: 312
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 313
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "picklist03",
        "fieldApiName": "picklist03__c",
        "isInlineEditable": true
      },
      key: 314
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state141 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord141 = _state141._ES5ProxyType ? _state141.get("flatRecord") : _state141.flatRecord, _displayValues44 = _flatRecord141._ES5ProxyType ? _flatRecord141.get("displayValues") : _flatRecord141.displayValues, _picklist03__c = _displayValues44._ES5ProxyType ? _displayValues44.get("picklist03__c") : _displayValues44.picklist03__c)
      },
      key: 315
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency19",
        "fieldApiName": "Currency19__c",
        "isInlineEditable": true
      },
      key: 316
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state142 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord142 = _state142._ES5ProxyType ? _state142.get("flatRecord") : _state142.flatRecord, _displayValues45 = _flatRecord142._ES5ProxyType ? _flatRecord142.get("displayValues") : _flatRecord142.displayValues, _Currency19__c = _displayValues45._ES5ProxyType ? _displayValues45.get("Currency19__c") : _displayValues45.Currency19__c)
      },
      key: 317
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 318
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "picklist04",
        "fieldApiName": "picklist04__c",
        "isInlineEditable": true
      },
      key: 319
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state143 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord143 = _state143._ES5ProxyType ? _state143.get("flatRecord") : _state143.flatRecord, _displayValues46 = _flatRecord143._ES5ProxyType ? _flatRecord143.get("displayValues") : _flatRecord143.displayValues, _picklist04__c = _displayValues46._ES5ProxyType ? _displayValues46.get("picklist04__c") : _displayValues46.picklist04__c)
      },
      key: 320
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency7",
        "fieldApiName": "Currency7__c",
        "isInlineEditable": true
      },
      key: 321
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state144 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord144 = _state144._ES5ProxyType ? _state144.get("flatRecord") : _state144.flatRecord, _displayValues47 = _flatRecord144._ES5ProxyType ? _flatRecord144.get("displayValues") : _flatRecord144.displayValues, _Currency7__c = _displayValues47._ES5ProxyType ? _displayValues47.get("Currency7__c") : _displayValues47.Currency7__c)
      },
      key: 322
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 323
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Next Step",
        "fieldApiName": "NextStep",
        "isInlineEditable": true
      },
      key: 324
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state145 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord145 = _state145._ES5ProxyType ? _state145.get("flatRecord") : _state145.flatRecord, _values98 = _flatRecord145._ES5ProxyType ? _flatRecord145.get("values") : _flatRecord145.values, _NextStep = _values98._ES5ProxyType ? _values98.get("NextStep") : _values98.NextStep)
      },
      key: 325
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency9",
        "fieldApiName": "Currency9__c",
        "isInlineEditable": true
      },
      key: 326
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state146 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord146 = _state146._ES5ProxyType ? _state146.get("flatRecord") : _state146.flatRecord, _displayValues48 = _flatRecord146._ES5ProxyType ? _flatRecord146.get("displayValues") : _flatRecord146.displayValues, _Currency9__c = _displayValues48._ES5ProxyType ? _displayValues48.get("Currency9__c") : _displayValues48.Currency9__c)
      },
      key: 327
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 328
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Description",
        "fieldApiName": "Description",
        "isInlineEditable": true
      },
      key: 329
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state147 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord147 = _state147._ES5ProxyType ? _state147.get("flatRecord") : _state147.flatRecord, _values99 = _flatRecord147._ES5ProxyType ? _flatRecord147.get("values") : _flatRecord147.values, _Description = _values99._ES5ProxyType ? _values99.get("Description") : _values99.Description)
      },
      key: 330
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency20",
        "fieldApiName": "Currency20__c",
        "isInlineEditable": true
      },
      key: 331
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state148 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord148 = _state148._ES5ProxyType ? _state148.get("flatRecord") : _state148.flatRecord, _displayValues49 = _flatRecord148._ES5ProxyType ? _flatRecord148.get("displayValues") : _flatRecord148.displayValues, _Currency20__c = _displayValues49._ES5ProxyType ? _displayValues49.get("Currency20__c") : _displayValues49.Currency20__c)
      },
      key: 332
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 333
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Last Modified By",
        "fieldApiName": "LastModifiedById"
      },
      key: 334
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "displayValue": (_state149 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord149 = _state149._ES5ProxyType ? _state149.get("flatRecord") : _state149.flatRecord, _displayValues50 = _flatRecord149._ES5ProxyType ? _flatRecord149.get("displayValues") : _flatRecord149.displayValues, _LastModifiedBy = _displayValues50._ES5ProxyType ? _displayValues50.get("LastModifiedBy") : _displayValues50.LastModifiedBy),
        "value": (_state150 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord150 = _state150._ES5ProxyType ? _state150.get("flatRecord") : _state150.flatRecord, _values100 = _flatRecord150._ES5ProxyType ? _flatRecord150.get("values") : _flatRecord150.values, _LastModifiedById = _values100._ES5ProxyType ? _values100.get("LastModifiedById") : _values100.LastModifiedById)
      },
      key: 335
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency3",
        "fieldApiName": "Currency3__c",
        "isInlineEditable": true
      },
      key: 336
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state151 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord151 = _state151._ES5ProxyType ? _state151.get("flatRecord") : _state151.flatRecord, _displayValues51 = _flatRecord151._ES5ProxyType ? _flatRecord151.get("displayValues") : _flatRecord151.displayValues, _Currency3__c = _displayValues51._ES5ProxyType ? _displayValues51.get("Currency3__c") : _displayValues51.Currency3__c)
      },
      key: 337
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 338
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date16",
        "fieldApiName": "Date16__c",
        "isInlineEditable": true
      },
      key: 339
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state152 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord152 = _state152._ES5ProxyType ? _state152.get("flatRecord") : _state152.flatRecord, _displayValues52 = _flatRecord152._ES5ProxyType ? _flatRecord152.get("displayValues") : _flatRecord152.displayValues, _Date16__c = _displayValues52._ES5ProxyType ? _displayValues52.get("Date16__c") : _displayValues52.Date16__c)
      },
      key: 340
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency4",
        "fieldApiName": "Currency4__c",
        "isInlineEditable": true
      },
      key: 341
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state153 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord153 = _state153._ES5ProxyType ? _state153.get("flatRecord") : _state153.flatRecord, _displayValues53 = _flatRecord153._ES5ProxyType ? _flatRecord153.get("displayValues") : _flatRecord153.displayValues, _Currency4__c = _displayValues53._ES5ProxyType ? _displayValues53.get("Currency4__c") : _displayValues53.Currency4__c)
      },
      key: 342
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 343
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date14",
        "fieldApiName": "Date14__c",
        "isInlineEditable": true
      },
      key: 344
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state154 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord154 = _state154._ES5ProxyType ? _state154.get("flatRecord") : _state154.flatRecord, _displayValues54 = _flatRecord154._ES5ProxyType ? _flatRecord154.get("displayValues") : _flatRecord154.displayValues, _Date14__c = _displayValues54._ES5ProxyType ? _displayValues54.get("Date14__c") : _displayValues54.Date14__c)
      },
      key: 345
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency17",
        "fieldApiName": "Currency17__c",
        "isInlineEditable": true
      },
      key: 346
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state155 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord155 = _state155._ES5ProxyType ? _state155.get("flatRecord") : _state155.flatRecord, _displayValues55 = _flatRecord155._ES5ProxyType ? _flatRecord155.get("displayValues") : _flatRecord155.displayValues, _Currency17__c = _displayValues55._ES5ProxyType ? _displayValues55.get("Currency17__c") : _displayValues55.Currency17__c)
      },
      key: 347
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 348
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date13",
        "fieldApiName": "Date13__c",
        "isInlineEditable": true
      },
      key: 349
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state156 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord156 = _state156._ES5ProxyType ? _state156.get("flatRecord") : _state156.flatRecord, _displayValues56 = _flatRecord156._ES5ProxyType ? _flatRecord156.get("displayValues") : _flatRecord156.displayValues, _Date13__c = _displayValues56._ES5ProxyType ? _displayValues56.get("Date13__c") : _displayValues56.Date13__c)
      },
      key: 350
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency13",
        "fieldApiName": "Currency13__c",
        "isInlineEditable": true
      },
      key: 351
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state157 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord157 = _state157._ES5ProxyType ? _state157.get("flatRecord") : _state157.flatRecord, _displayValues57 = _flatRecord157._ES5ProxyType ? _flatRecord157.get("displayValues") : _flatRecord157.displayValues, _Currency13__c = _displayValues57._ES5ProxyType ? _displayValues57.get("Currency13__c") : _displayValues57.Currency13__c)
      },
      key: 352
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 353
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date10",
        "fieldApiName": "Date10__c",
        "isInlineEditable": true
      },
      key: 354
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state158 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord158 = _state158._ES5ProxyType ? _state158.get("flatRecord") : _state158.flatRecord, _displayValues58 = _flatRecord158._ES5ProxyType ? _flatRecord158.get("displayValues") : _flatRecord158.displayValues, _Date10__c = _displayValues58._ES5ProxyType ? _displayValues58.get("Date10__c") : _displayValues58.Date10__c)
      },
      key: 355
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Currency1",
        "fieldApiName": "Currency1__c",
        "isInlineEditable": true
      },
      key: 356
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state159 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord159 = _state159._ES5ProxyType ? _state159.get("flatRecord") : _state159.flatRecord, _displayValues59 = _flatRecord159._ES5ProxyType ? _flatRecord159.get("displayValues") : _flatRecord159.displayValues, _Currency1__c = _displayValues59._ES5ProxyType ? _displayValues59.get("Currency1__c") : _displayValues59.Currency1__c)
      },
      key: 357
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 358
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date5",
        "fieldApiName": "Date5__c",
        "isInlineEditable": true
      },
      key: 359
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state160 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord160 = _state160._ES5ProxyType ? _state160.get("flatRecord") : _state160.flatRecord, _displayValues60 = _flatRecord160._ES5ProxyType ? _flatRecord160.get("displayValues") : _flatRecord160.displayValues, _Date5__c = _displayValues60._ES5ProxyType ? _displayValues60.get("Date5__c") : _displayValues60.Date5__c)
      },
      key: 360
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime1",
        "fieldApiName": "DateTime1__c",
        "isInlineEditable": true
      },
      key: 361
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state161 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord161 = _state161._ES5ProxyType ? _state161.get("flatRecord") : _state161.flatRecord, _displayValues61 = _flatRecord161._ES5ProxyType ? _flatRecord161.get("displayValues") : _flatRecord161.displayValues, _DateTime1__c = _displayValues61._ES5ProxyType ? _displayValues61.get("DateTime1__c") : _displayValues61.DateTime1__c)
      },
      key: 362
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 363
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date6",
        "fieldApiName": "Date6__c",
        "isInlineEditable": true
      },
      key: 364
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state162 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord162 = _state162._ES5ProxyType ? _state162.get("flatRecord") : _state162.flatRecord, _displayValues62 = _flatRecord162._ES5ProxyType ? _flatRecord162.get("displayValues") : _flatRecord162.displayValues, _Date6__c = _displayValues62._ES5ProxyType ? _displayValues62.get("Date6__c") : _displayValues62.Date6__c)
      },
      key: 365
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime17",
        "fieldApiName": "DateTime17__c",
        "isInlineEditable": true
      },
      key: 366
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state163 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord163 = _state163._ES5ProxyType ? _state163.get("flatRecord") : _state163.flatRecord, _displayValues63 = _flatRecord163._ES5ProxyType ? _flatRecord163.get("displayValues") : _flatRecord163.displayValues, _DateTime17__c = _displayValues63._ES5ProxyType ? _displayValues63.get("DateTime17__c") : _displayValues63.DateTime17__c)
      },
      key: 367
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 368
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date18",
        "fieldApiName": "Date18__c",
        "isInlineEditable": true
      },
      key: 369
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state164 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord164 = _state164._ES5ProxyType ? _state164.get("flatRecord") : _state164.flatRecord, _displayValues64 = _flatRecord164._ES5ProxyType ? _flatRecord164.get("displayValues") : _flatRecord164.displayValues, _Date18__c = _displayValues64._ES5ProxyType ? _displayValues64.get("Date18__c") : _displayValues64.Date18__c)
      },
      key: 370
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime19",
        "fieldApiName": "DateTime19__c",
        "isInlineEditable": true
      },
      key: 371
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state165 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord165 = _state165._ES5ProxyType ? _state165.get("flatRecord") : _state165.flatRecord, _displayValues65 = _flatRecord165._ES5ProxyType ? _flatRecord165.get("displayValues") : _flatRecord165.displayValues, _DateTime19__c = _displayValues65._ES5ProxyType ? _displayValues65.get("DateTime19__c") : _displayValues65.DateTime19__c)
      },
      key: 372
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 373
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date8",
        "fieldApiName": "Date8__c",
        "isInlineEditable": true
      },
      key: 374
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state166 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord166 = _state166._ES5ProxyType ? _state166.get("flatRecord") : _state166.flatRecord, _displayValues66 = _flatRecord166._ES5ProxyType ? _flatRecord166.get("displayValues") : _flatRecord166.displayValues, _Date8__c = _displayValues66._ES5ProxyType ? _displayValues66.get("Date8__c") : _displayValues66.Date8__c)
      },
      key: 375
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime14",
        "fieldApiName": "DateTime14__c",
        "isInlineEditable": true
      },
      key: 376
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state167 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord167 = _state167._ES5ProxyType ? _state167.get("flatRecord") : _state167.flatRecord, _displayValues67 = _flatRecord167._ES5ProxyType ? _flatRecord167.get("displayValues") : _flatRecord167.displayValues, _DateTime14__c = _displayValues67._ES5ProxyType ? _displayValues67.get("DateTime14__c") : _displayValues67.DateTime14__c)
      },
      key: 377
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 378
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date17",
        "fieldApiName": "Date17__c",
        "isInlineEditable": true
      },
      key: 379
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state168 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord168 = _state168._ES5ProxyType ? _state168.get("flatRecord") : _state168.flatRecord, _displayValues68 = _flatRecord168._ES5ProxyType ? _flatRecord168.get("displayValues") : _flatRecord168.displayValues, _Date17__c = _displayValues68._ES5ProxyType ? _displayValues68.get("Date17__c") : _displayValues68.Date17__c)
      },
      key: 380
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime15",
        "fieldApiName": "DateTime15__c",
        "isInlineEditable": true
      },
      key: 381
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state169 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord169 = _state169._ES5ProxyType ? _state169.get("flatRecord") : _state169.flatRecord, _displayValues69 = _flatRecord169._ES5ProxyType ? _flatRecord169.get("displayValues") : _flatRecord169.displayValues, _DateTime15__c = _displayValues69._ES5ProxyType ? _displayValues69.get("DateTime15__c") : _displayValues69.DateTime15__c)
      },
      key: 382
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 383
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date9",
        "fieldApiName": "Date9__c",
        "isInlineEditable": true
      },
      key: 384
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state170 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord170 = _state170._ES5ProxyType ? _state170.get("flatRecord") : _state170.flatRecord, _displayValues70 = _flatRecord170._ES5ProxyType ? _flatRecord170.get("displayValues") : _flatRecord170.displayValues, _Date9__c = _displayValues70._ES5ProxyType ? _displayValues70.get("Date9__c") : _displayValues70.Date9__c)
      },
      key: 385
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime10",
        "fieldApiName": "DateTime10__c",
        "isInlineEditable": true
      },
      key: 386
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state171 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord171 = _state171._ES5ProxyType ? _state171.get("flatRecord") : _state171.flatRecord, _displayValues71 = _flatRecord171._ES5ProxyType ? _flatRecord171.get("displayValues") : _flatRecord171.displayValues, _DateTime10__c = _displayValues71._ES5ProxyType ? _displayValues71.get("DateTime10__c") : _displayValues71.DateTime10__c)
      },
      key: 387
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 388
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date7",
        "fieldApiName": "Date7__c",
        "isInlineEditable": true
      },
      key: 389
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state172 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord172 = _state172._ES5ProxyType ? _state172.get("flatRecord") : _state172.flatRecord, _displayValues72 = _flatRecord172._ES5ProxyType ? _flatRecord172.get("displayValues") : _flatRecord172.displayValues, _Date7__c = _displayValues72._ES5ProxyType ? _displayValues72.get("Date7__c") : _displayValues72.Date7__c)
      },
      key: 390
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime12",
        "fieldApiName": "DateTime12__c",
        "isInlineEditable": true
      },
      key: 391
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state173 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord173 = _state173._ES5ProxyType ? _state173.get("flatRecord") : _state173.flatRecord, _displayValues73 = _flatRecord173._ES5ProxyType ? _flatRecord173.get("displayValues") : _flatRecord173.displayValues, _DateTime12__c = _displayValues73._ES5ProxyType ? _displayValues73.get("DateTime12__c") : _displayValues73.DateTime12__c)
      },
      key: 392
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 393
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date19",
        "fieldApiName": "Date19__c",
        "isInlineEditable": true
      },
      key: 394
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state174 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord174 = _state174._ES5ProxyType ? _state174.get("flatRecord") : _state174.flatRecord, _displayValues74 = _flatRecord174._ES5ProxyType ? _flatRecord174.get("displayValues") : _flatRecord174.displayValues, _Date19__c = _displayValues74._ES5ProxyType ? _displayValues74.get("Date19__c") : _displayValues74.Date19__c)
      },
      key: 395
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime11",
        "fieldApiName": "DateTime11__c",
        "isInlineEditable": true
      },
      key: 396
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state175 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord175 = _state175._ES5ProxyType ? _state175.get("flatRecord") : _state175.flatRecord, _displayValues75 = _flatRecord175._ES5ProxyType ? _flatRecord175.get("displayValues") : _flatRecord175.displayValues, _DateTime11__c = _displayValues75._ES5ProxyType ? _displayValues75.get("DateTime11__c") : _displayValues75.DateTime11__c)
      },
      key: 397
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 398
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date15",
        "fieldApiName": "Date15__c",
        "isInlineEditable": true
      },
      key: 399
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state176 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord176 = _state176._ES5ProxyType ? _state176.get("flatRecord") : _state176.flatRecord, _displayValues76 = _flatRecord176._ES5ProxyType ? _flatRecord176.get("displayValues") : _flatRecord176.displayValues, _Date15__c = _displayValues76._ES5ProxyType ? _displayValues76.get("Date15__c") : _displayValues76.Date15__c)
      },
      key: 400
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime3",
        "fieldApiName": "DateTime3__c",
        "isInlineEditable": true
      },
      key: 401
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state177 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord177 = _state177._ES5ProxyType ? _state177.get("flatRecord") : _state177.flatRecord, _displayValues77 = _flatRecord177._ES5ProxyType ? _flatRecord177.get("displayValues") : _flatRecord177.displayValues, _DateTime3__c = _displayValues77._ES5ProxyType ? _displayValues77.get("DateTime3__c") : _displayValues77.DateTime3__c)
      },
      key: 402
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 403
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date12",
        "fieldApiName": "Date12__c",
        "isInlineEditable": true
      },
      key: 404
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state178 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord178 = _state178._ES5ProxyType ? _state178.get("flatRecord") : _state178.flatRecord, _displayValues78 = _flatRecord178._ES5ProxyType ? _flatRecord178.get("displayValues") : _flatRecord178.displayValues, _Date12__c = _displayValues78._ES5ProxyType ? _displayValues78.get("Date12__c") : _displayValues78.Date12__c)
      },
      key: 405
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime16",
        "fieldApiName": "DateTime16__c",
        "isInlineEditable": true
      },
      key: 406
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state179 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord179 = _state179._ES5ProxyType ? _state179.get("flatRecord") : _state179.flatRecord, _displayValues79 = _flatRecord179._ES5ProxyType ? _flatRecord179.get("displayValues") : _flatRecord179.displayValues, _DateTime16__c = _displayValues79._ES5ProxyType ? _displayValues79.get("DateTime16__c") : _displayValues79.DateTime16__c)
      },
      key: 407
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 408
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date20",
        "fieldApiName": "Date20__c",
        "isInlineEditable": true
      },
      key: 409
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state180 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord180 = _state180._ES5ProxyType ? _state180.get("flatRecord") : _state180.flatRecord, _displayValues80 = _flatRecord180._ES5ProxyType ? _flatRecord180.get("displayValues") : _flatRecord180.displayValues, _Date20__c = _displayValues80._ES5ProxyType ? _displayValues80.get("Date20__c") : _displayValues80.Date20__c)
      },
      key: 410
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime2",
        "fieldApiName": "DateTime2__c",
        "isInlineEditable": true
      },
      key: 411
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state181 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord181 = _state181._ES5ProxyType ? _state181.get("flatRecord") : _state181.flatRecord, _displayValues81 = _flatRecord181._ES5ProxyType ? _flatRecord181.get("displayValues") : _flatRecord181.displayValues, _DateTime2__c = _displayValues81._ES5ProxyType ? _displayValues81.get("DateTime2__c") : _displayValues81.DateTime2__c)
      },
      key: 412
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 413
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Date11",
        "fieldApiName": "Date11__c",
        "isInlineEditable": true
      },
      key: 414
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state182 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord182 = _state182._ES5ProxyType ? _state182.get("flatRecord") : _state182.flatRecord, _displayValues82 = _flatRecord182._ES5ProxyType ? _flatRecord182.get("displayValues") : _flatRecord182.displayValues, _Date11__c = _displayValues82._ES5ProxyType ? _displayValues82.get("Date11__c") : _displayValues82.Date11__c)
      },
      key: 415
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime7",
        "fieldApiName": "DateTime7__c",
        "isInlineEditable": true
      },
      key: 416
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state183 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord183 = _state183._ES5ProxyType ? _state183.get("flatRecord") : _state183.flatRecord, _displayValues83 = _flatRecord183._ES5ProxyType ? _flatRecord183.get("displayValues") : _flatRecord183.displayValues, _DateTime7__c = _displayValues83._ES5ProxyType ? _displayValues83.get("DateTime7__c") : _displayValues83.DateTime7__c)
      },
      key: 417
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 418
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email10",
        "fieldApiName": "Email10__c",
        "isInlineEditable": true
      },
      key: 419
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state184 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord184 = _state184._ES5ProxyType ? _state184.get("flatRecord") : _state184.flatRecord, _values101 = _flatRecord184._ES5ProxyType ? _flatRecord184.get("values") : _flatRecord184.values, _Email10__c = _values101._ES5ProxyType ? _values101.get("Email10__c") : _values101.Email10__c),
        "value": (_state185 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord185 = _state185._ES5ProxyType ? _state185.get("flatRecord") : _state185.flatRecord, _values102 = _flatRecord185._ES5ProxyType ? _flatRecord185.get("values") : _flatRecord185.values, _Email10__c2 = _values102._ES5ProxyType ? _values102.get("Email10__c") : _values102.Email10__c)
      },
      key: 420
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime13",
        "fieldApiName": "DateTime13__c",
        "isInlineEditable": true
      },
      key: 421
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state186 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord186 = _state186._ES5ProxyType ? _state186.get("flatRecord") : _state186.flatRecord, _displayValues84 = _flatRecord186._ES5ProxyType ? _flatRecord186.get("displayValues") : _flatRecord186.displayValues, _DateTime13__c = _displayValues84._ES5ProxyType ? _displayValues84.get("DateTime13__c") : _displayValues84.DateTime13__c)
      },
      key: 422
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 423
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email13",
        "fieldApiName": "Email13__c",
        "isInlineEditable": true
      },
      key: 424
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state187 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord187 = _state187._ES5ProxyType ? _state187.get("flatRecord") : _state187.flatRecord, _values103 = _flatRecord187._ES5ProxyType ? _flatRecord187.get("values") : _flatRecord187.values, _Email13__c = _values103._ES5ProxyType ? _values103.get("Email13__c") : _values103.Email13__c),
        "value": (_state188 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord188 = _state188._ES5ProxyType ? _state188.get("flatRecord") : _state188.flatRecord, _values104 = _flatRecord188._ES5ProxyType ? _flatRecord188.get("values") : _flatRecord188.values, _Email13__c2 = _values104._ES5ProxyType ? _values104.get("Email13__c") : _values104.Email13__c)
      },
      key: 425
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime20",
        "fieldApiName": "DateTime20__c",
        "isInlineEditable": true
      },
      key: 426
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state189 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord189 = _state189._ES5ProxyType ? _state189.get("flatRecord") : _state189.flatRecord, _displayValues85 = _flatRecord189._ES5ProxyType ? _flatRecord189.get("displayValues") : _flatRecord189.displayValues, _DateTime20__c = _displayValues85._ES5ProxyType ? _displayValues85.get("DateTime20__c") : _displayValues85.DateTime20__c)
      },
      key: 427
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 428
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email14",
        "fieldApiName": "Email14__c",
        "isInlineEditable": true
      },
      key: 429
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state190 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord190 = _state190._ES5ProxyType ? _state190.get("flatRecord") : _state190.flatRecord, _values105 = _flatRecord190._ES5ProxyType ? _flatRecord190.get("values") : _flatRecord190.values, _Email14__c = _values105._ES5ProxyType ? _values105.get("Email14__c") : _values105.Email14__c),
        "value": (_state191 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord191 = _state191._ES5ProxyType ? _state191.get("flatRecord") : _state191.flatRecord, _values106 = _flatRecord191._ES5ProxyType ? _flatRecord191.get("values") : _flatRecord191.values, _Email14__c2 = _values106._ES5ProxyType ? _values106.get("Email14__c") : _values106.Email14__c)
      },
      key: 430
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime18",
        "fieldApiName": "DateTime18__c",
        "isInlineEditable": true
      },
      key: 431
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state192 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord192 = _state192._ES5ProxyType ? _state192.get("flatRecord") : _state192.flatRecord, _displayValues86 = _flatRecord192._ES5ProxyType ? _flatRecord192.get("displayValues") : _flatRecord192.displayValues, _DateTime18__c = _displayValues86._ES5ProxyType ? _displayValues86.get("DateTime18__c") : _displayValues86.DateTime18__c)
      },
      key: 432
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 433
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email9",
        "fieldApiName": "Email9__c",
        "isInlineEditable": true
      },
      key: 434
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state193 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord193 = _state193._ES5ProxyType ? _state193.get("flatRecord") : _state193.flatRecord, _values107 = _flatRecord193._ES5ProxyType ? _flatRecord193.get("values") : _flatRecord193.values, _Email9__c = _values107._ES5ProxyType ? _values107.get("Email9__c") : _values107.Email9__c),
        "value": (_state194 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord194 = _state194._ES5ProxyType ? _state194.get("flatRecord") : _state194.flatRecord, _values108 = _flatRecord194._ES5ProxyType ? _flatRecord194.get("values") : _flatRecord194.values, _Email9__c2 = _values108._ES5ProxyType ? _values108.get("Email9__c") : _values108.Email9__c)
      },
      key: 435
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime5",
        "fieldApiName": "DateTime5__c",
        "isInlineEditable": true
      },
      key: 436
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state195 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord195 = _state195._ES5ProxyType ? _state195.get("flatRecord") : _state195.flatRecord, _displayValues87 = _flatRecord195._ES5ProxyType ? _flatRecord195.get("displayValues") : _flatRecord195.displayValues, _DateTime5__c = _displayValues87._ES5ProxyType ? _displayValues87.get("DateTime5__c") : _displayValues87.DateTime5__c)
      },
      key: 437
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 438
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email20",
        "fieldApiName": "Email20__c",
        "isInlineEditable": true
      },
      key: 439
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state196 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord196 = _state196._ES5ProxyType ? _state196.get("flatRecord") : _state196.flatRecord, _values109 = _flatRecord196._ES5ProxyType ? _flatRecord196.get("values") : _flatRecord196.values, _Email20__c = _values109._ES5ProxyType ? _values109.get("Email20__c") : _values109.Email20__c),
        "value": (_state197 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord197 = _state197._ES5ProxyType ? _state197.get("flatRecord") : _state197.flatRecord, _values110 = _flatRecord197._ES5ProxyType ? _flatRecord197.get("values") : _flatRecord197.values, _Email20__c2 = _values110._ES5ProxyType ? _values110.get("Email20__c") : _values110.Email20__c)
      },
      key: 440
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime9",
        "fieldApiName": "DateTime9__c",
        "isInlineEditable": true
      },
      key: 441
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state198 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord198 = _state198._ES5ProxyType ? _state198.get("flatRecord") : _state198.flatRecord, _displayValues88 = _flatRecord198._ES5ProxyType ? _flatRecord198.get("displayValues") : _flatRecord198.displayValues, _DateTime9__c = _displayValues88._ES5ProxyType ? _displayValues88.get("DateTime9__c") : _displayValues88.DateTime9__c)
      },
      key: 442
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 443
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email8",
        "fieldApiName": "Email8__c",
        "isInlineEditable": true
      },
      key: 444
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state199 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord199 = _state199._ES5ProxyType ? _state199.get("flatRecord") : _state199.flatRecord, _values111 = _flatRecord199._ES5ProxyType ? _flatRecord199.get("values") : _flatRecord199.values, _Email8__c = _values111._ES5ProxyType ? _values111.get("Email8__c") : _values111.Email8__c),
        "value": (_state200 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord200 = _state200._ES5ProxyType ? _state200.get("flatRecord") : _state200.flatRecord, _values112 = _flatRecord200._ES5ProxyType ? _flatRecord200.get("values") : _flatRecord200.values, _Email8__c2 = _values112._ES5ProxyType ? _values112.get("Email8__c") : _values112.Email8__c)
      },
      key: 445
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime6",
        "fieldApiName": "DateTime6__c",
        "isInlineEditable": true
      },
      key: 446
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state201 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord201 = _state201._ES5ProxyType ? _state201.get("flatRecord") : _state201.flatRecord, _displayValues89 = _flatRecord201._ES5ProxyType ? _flatRecord201.get("displayValues") : _flatRecord201.displayValues, _DateTime6__c = _displayValues89._ES5ProxyType ? _displayValues89.get("DateTime6__c") : _displayValues89.DateTime6__c)
      },
      key: 447
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 448
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email11",
        "fieldApiName": "Email11__c",
        "isInlineEditable": true
      },
      key: 449
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state202 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord202 = _state202._ES5ProxyType ? _state202.get("flatRecord") : _state202.flatRecord, _values113 = _flatRecord202._ES5ProxyType ? _flatRecord202.get("values") : _flatRecord202.values, _Email11__c = _values113._ES5ProxyType ? _values113.get("Email11__c") : _values113.Email11__c),
        "value": (_state203 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord203 = _state203._ES5ProxyType ? _state203.get("flatRecord") : _state203.flatRecord, _values114 = _flatRecord203._ES5ProxyType ? _flatRecord203.get("values") : _flatRecord203.values, _Email11__c2 = _values114._ES5ProxyType ? _values114.get("Email11__c") : _values114.Email11__c)
      },
      key: 450
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime8",
        "fieldApiName": "DateTime8__c",
        "isInlineEditable": true
      },
      key: 451
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state204 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord204 = _state204._ES5ProxyType ? _state204.get("flatRecord") : _state204.flatRecord, _displayValues90 = _flatRecord204._ES5ProxyType ? _flatRecord204.get("displayValues") : _flatRecord204.displayValues, _DateTime8__c = _displayValues90._ES5ProxyType ? _displayValues90.get("DateTime8__c") : _displayValues90.DateTime8__c)
      },
      key: 452
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 453
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email2",
        "fieldApiName": "Email2__c",
        "isInlineEditable": true
      },
      key: 454
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state205 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord205 = _state205._ES5ProxyType ? _state205.get("flatRecord") : _state205.flatRecord, _values115 = _flatRecord205._ES5ProxyType ? _flatRecord205.get("values") : _flatRecord205.values, _Email2__c = _values115._ES5ProxyType ? _values115.get("Email2__c") : _values115.Email2__c),
        "value": (_state206 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord206 = _state206._ES5ProxyType ? _state206.get("flatRecord") : _state206.flatRecord, _values116 = _flatRecord206._ES5ProxyType ? _flatRecord206.get("values") : _flatRecord206.values, _Email2__c2 = _values116._ES5ProxyType ? _values116.get("Email2__c") : _values116.Email2__c)
      },
      key: 455
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "DateTime4",
        "fieldApiName": "DateTime4__c",
        "isInlineEditable": true
      },
      key: 456
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state207 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord207 = _state207._ES5ProxyType ? _state207.get("flatRecord") : _state207.flatRecord, _displayValues91 = _flatRecord207._ES5ProxyType ? _flatRecord207.get("displayValues") : _flatRecord207.displayValues, _DateTime4__c = _displayValues91._ES5ProxyType ? _displayValues91.get("DateTime4__c") : _displayValues91.DateTime4__c)
      },
      key: 457
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 458
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email15",
        "fieldApiName": "Email15__c",
        "isInlineEditable": true
      },
      key: 459
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state208 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord208 = _state208._ES5ProxyType ? _state208.get("flatRecord") : _state208.flatRecord, _values117 = _flatRecord208._ES5ProxyType ? _flatRecord208.get("values") : _flatRecord208.values, _Email15__c = _values117._ES5ProxyType ? _values117.get("Email15__c") : _values117.Email15__c),
        "value": (_state209 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord209 = _state209._ES5ProxyType ? _state209.get("flatRecord") : _state209.flatRecord, _values118 = _flatRecord209._ES5ProxyType ? _flatRecord209.get("values") : _flatRecord209.values, _Email15__c2 = _values118._ES5ProxyType ? _values118.get("Email15__c") : _values118.Email15__c)
      },
      key: 460
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num19",
        "fieldApiName": "Num19__c",
        "isInlineEditable": true
      },
      key: 461
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state210 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord210 = _state210._ES5ProxyType ? _state210.get("flatRecord") : _state210.flatRecord, _values119 = _flatRecord210._ES5ProxyType ? _flatRecord210.get("values") : _flatRecord210.values, _Num19__c = _values119._ES5ProxyType ? _values119.get("Num19__c") : _values119.Num19__c)
      },
      key: 462
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 463
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email3",
        "fieldApiName": "Email3__c",
        "isInlineEditable": true
      },
      key: 464
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state211 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord211 = _state211._ES5ProxyType ? _state211.get("flatRecord") : _state211.flatRecord, _values120 = _flatRecord211._ES5ProxyType ? _flatRecord211.get("values") : _flatRecord211.values, _Email3__c = _values120._ES5ProxyType ? _values120.get("Email3__c") : _values120.Email3__c),
        "value": (_state212 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord212 = _state212._ES5ProxyType ? _state212.get("flatRecord") : _state212.flatRecord, _values121 = _flatRecord212._ES5ProxyType ? _flatRecord212.get("values") : _flatRecord212.values, _Email3__c2 = _values121._ES5ProxyType ? _values121.get("Email3__c") : _values121.Email3__c)
      },
      key: 465
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num18",
        "fieldApiName": "Num18__c",
        "isInlineEditable": true
      },
      key: 466
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state213 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord213 = _state213._ES5ProxyType ? _state213.get("flatRecord") : _state213.flatRecord, _values122 = _flatRecord213._ES5ProxyType ? _flatRecord213.get("values") : _flatRecord213.values, _Num18__c = _values122._ES5ProxyType ? _values122.get("Num18__c") : _values122.Num18__c)
      },
      key: 467
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 468
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email18",
        "fieldApiName": "Email18__c",
        "isInlineEditable": true
      },
      key: 469
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state214 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord214 = _state214._ES5ProxyType ? _state214.get("flatRecord") : _state214.flatRecord, _values123 = _flatRecord214._ES5ProxyType ? _flatRecord214.get("values") : _flatRecord214.values, _Email18__c = _values123._ES5ProxyType ? _values123.get("Email18__c") : _values123.Email18__c),
        "value": (_state215 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord215 = _state215._ES5ProxyType ? _state215.get("flatRecord") : _state215.flatRecord, _values124 = _flatRecord215._ES5ProxyType ? _flatRecord215.get("values") : _flatRecord215.values, _Email18__c2 = _values124._ES5ProxyType ? _values124.get("Email18__c") : _values124.Email18__c)
      },
      key: 470
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num15",
        "fieldApiName": "Num15__c",
        "isInlineEditable": true
      },
      key: 471
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state216 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord216 = _state216._ES5ProxyType ? _state216.get("flatRecord") : _state216.flatRecord, _values125 = _flatRecord216._ES5ProxyType ? _flatRecord216.get("values") : _flatRecord216.values, _Num15__c = _values125._ES5ProxyType ? _values125.get("Num15__c") : _values125.Num15__c)
      },
      key: 472
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 473
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email6",
        "fieldApiName": "Email6__c",
        "isInlineEditable": true
      },
      key: 474
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state217 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord217 = _state217._ES5ProxyType ? _state217.get("flatRecord") : _state217.flatRecord, _values126 = _flatRecord217._ES5ProxyType ? _flatRecord217.get("values") : _flatRecord217.values, _Email6__c = _values126._ES5ProxyType ? _values126.get("Email6__c") : _values126.Email6__c),
        "value": (_state218 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord218 = _state218._ES5ProxyType ? _state218.get("flatRecord") : _state218.flatRecord, _values127 = _flatRecord218._ES5ProxyType ? _flatRecord218.get("values") : _flatRecord218.values, _Email6__c2 = _values127._ES5ProxyType ? _values127.get("Email6__c") : _values127.Email6__c)
      },
      key: 475
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num12",
        "fieldApiName": "Num12__c",
        "isInlineEditable": true
      },
      key: 476
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state219 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord219 = _state219._ES5ProxyType ? _state219.get("flatRecord") : _state219.flatRecord, _values128 = _flatRecord219._ES5ProxyType ? _flatRecord219.get("values") : _flatRecord219.values, _Num12__c = _values128._ES5ProxyType ? _values128.get("Num12__c") : _values128.Num12__c)
      },
      key: 477
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 478
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email7",
        "fieldApiName": "Email7__c",
        "isInlineEditable": true
      },
      key: 479
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state220 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord220 = _state220._ES5ProxyType ? _state220.get("flatRecord") : _state220.flatRecord, _values129 = _flatRecord220._ES5ProxyType ? _flatRecord220.get("values") : _flatRecord220.values, _Email7__c = _values129._ES5ProxyType ? _values129.get("Email7__c") : _values129.Email7__c),
        "value": (_state221 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord221 = _state221._ES5ProxyType ? _state221.get("flatRecord") : _state221.flatRecord, _values130 = _flatRecord221._ES5ProxyType ? _flatRecord221.get("values") : _flatRecord221.values, _Email7__c2 = _values130._ES5ProxyType ? _values130.get("Email7__c") : _values130.Email7__c)
      },
      key: 480
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num14",
        "fieldApiName": "Num14__c",
        "isInlineEditable": true
      },
      key: 481
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state222 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord222 = _state222._ES5ProxyType ? _state222.get("flatRecord") : _state222.flatRecord, _values131 = _flatRecord222._ES5ProxyType ? _flatRecord222.get("values") : _flatRecord222.values, _Num14__c = _values131._ES5ProxyType ? _values131.get("Num14__c") : _values131.Num14__c)
      },
      key: 482
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 483
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email12",
        "fieldApiName": "Email12__c",
        "isInlineEditable": true
      },
      key: 484
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state223 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord223 = _state223._ES5ProxyType ? _state223.get("flatRecord") : _state223.flatRecord, _values132 = _flatRecord223._ES5ProxyType ? _flatRecord223.get("values") : _flatRecord223.values, _Email12__c = _values132._ES5ProxyType ? _values132.get("Email12__c") : _values132.Email12__c),
        "value": (_state224 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord224 = _state224._ES5ProxyType ? _state224.get("flatRecord") : _state224.flatRecord, _values133 = _flatRecord224._ES5ProxyType ? _flatRecord224.get("values") : _flatRecord224.values, _Email12__c2 = _values133._ES5ProxyType ? _values133.get("Email12__c") : _values133.Email12__c)
      },
      key: 485
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num11",
        "fieldApiName": "Num11__c",
        "isInlineEditable": true
      },
      key: 486
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state225 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord225 = _state225._ES5ProxyType ? _state225.get("flatRecord") : _state225.flatRecord, _values134 = _flatRecord225._ES5ProxyType ? _flatRecord225.get("values") : _flatRecord225.values, _Num11__c = _values134._ES5ProxyType ? _values134.get("Num11__c") : _values134.Num11__c)
      },
      key: 487
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 488
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email4",
        "fieldApiName": "Email4__c",
        "isInlineEditable": true
      },
      key: 489
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state226 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord226 = _state226._ES5ProxyType ? _state226.get("flatRecord") : _state226.flatRecord, _values135 = _flatRecord226._ES5ProxyType ? _flatRecord226.get("values") : _flatRecord226.values, _Email4__c = _values135._ES5ProxyType ? _values135.get("Email4__c") : _values135.Email4__c),
        "value": (_state227 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord227 = _state227._ES5ProxyType ? _state227.get("flatRecord") : _state227.flatRecord, _values136 = _flatRecord227._ES5ProxyType ? _flatRecord227.get("values") : _flatRecord227.values, _Email4__c2 = _values136._ES5ProxyType ? _values136.get("Email4__c") : _values136.Email4__c)
      },
      key: 490
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num13",
        "fieldApiName": "Num13__c",
        "isInlineEditable": true
      },
      key: 491
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state228 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord228 = _state228._ES5ProxyType ? _state228.get("flatRecord") : _state228.flatRecord, _values137 = _flatRecord228._ES5ProxyType ? _flatRecord228.get("values") : _flatRecord228.values, _Num13__c = _values137._ES5ProxyType ? _values137.get("Num13__c") : _values137.Num13__c)
      },
      key: 492
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 493
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email1",
        "fieldApiName": "Email1__c",
        "isInlineEditable": true
      },
      key: 494
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state229 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord229 = _state229._ES5ProxyType ? _state229.get("flatRecord") : _state229.flatRecord, _values138 = _flatRecord229._ES5ProxyType ? _flatRecord229.get("values") : _flatRecord229.values, _Email1__c = _values138._ES5ProxyType ? _values138.get("Email1__c") : _values138.Email1__c),
        "value": (_state230 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord230 = _state230._ES5ProxyType ? _state230.get("flatRecord") : _state230.flatRecord, _values139 = _flatRecord230._ES5ProxyType ? _flatRecord230.get("values") : _flatRecord230.values, _Email1__c2 = _values139._ES5ProxyType ? _values139.get("Email1__c") : _values139.Email1__c)
      },
      key: 495
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num1",
        "fieldApiName": "Num1__c",
        "isInlineEditable": true
      },
      key: 496
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state231 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord231 = _state231._ES5ProxyType ? _state231.get("flatRecord") : _state231.flatRecord, _values140 = _flatRecord231._ES5ProxyType ? _flatRecord231.get("values") : _flatRecord231.values, _Num1__c = _values140._ES5ProxyType ? _values140.get("Num1__c") : _values140.Num1__c)
      },
      key: 497
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 498
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email5",
        "fieldApiName": "Email5__c",
        "isInlineEditable": true
      },
      key: 499
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state232 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord232 = _state232._ES5ProxyType ? _state232.get("flatRecord") : _state232.flatRecord, _values141 = _flatRecord232._ES5ProxyType ? _flatRecord232.get("values") : _flatRecord232.values, _Email5__c = _values141._ES5ProxyType ? _values141.get("Email5__c") : _values141.Email5__c),
        "value": (_state233 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord233 = _state233._ES5ProxyType ? _state233.get("flatRecord") : _state233.flatRecord, _values142 = _flatRecord233._ES5ProxyType ? _flatRecord233.get("values") : _flatRecord233.values, _Email5__c2 = _values142._ES5ProxyType ? _values142.get("Email5__c") : _values142.Email5__c)
      },
      key: 500
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num10",
        "fieldApiName": "Num10__c",
        "isInlineEditable": true
      },
      key: 501
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state234 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord234 = _state234._ES5ProxyType ? _state234.get("flatRecord") : _state234.flatRecord, _values143 = _flatRecord234._ES5ProxyType ? _flatRecord234.get("values") : _flatRecord234.values, _Num10__c = _values143._ES5ProxyType ? _values143.get("Num10__c") : _values143.Num10__c)
      },
      key: 502
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 503
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email17",
        "fieldApiName": "Email17__c",
        "isInlineEditable": true
      },
      key: 504
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state235 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord235 = _state235._ES5ProxyType ? _state235.get("flatRecord") : _state235.flatRecord, _values144 = _flatRecord235._ES5ProxyType ? _flatRecord235.get("values") : _flatRecord235.values, _Email17__c = _values144._ES5ProxyType ? _values144.get("Email17__c") : _values144.Email17__c),
        "value": (_state236 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord236 = _state236._ES5ProxyType ? _state236.get("flatRecord") : _state236.flatRecord, _values145 = _flatRecord236._ES5ProxyType ? _flatRecord236.get("values") : _flatRecord236.values, _Email17__c2 = _values145._ES5ProxyType ? _values145.get("Email17__c") : _values145.Email17__c)
      },
      key: 505
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num9",
        "fieldApiName": "Num9__c",
        "isInlineEditable": true
      },
      key: 506
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state237 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord237 = _state237._ES5ProxyType ? _state237.get("flatRecord") : _state237.flatRecord, _values146 = _flatRecord237._ES5ProxyType ? _flatRecord237.get("values") : _flatRecord237.values, _Num9__c = _values146._ES5ProxyType ? _values146.get("Num9__c") : _values146.Num9__c)
      },
      key: 507
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 508
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email16",
        "fieldApiName": "Email16__c",
        "isInlineEditable": true
      },
      key: 509
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state238 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord238 = _state238._ES5ProxyType ? _state238.get("flatRecord") : _state238.flatRecord, _values147 = _flatRecord238._ES5ProxyType ? _flatRecord238.get("values") : _flatRecord238.values, _Email16__c = _values147._ES5ProxyType ? _values147.get("Email16__c") : _values147.Email16__c),
        "value": (_state239 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord239 = _state239._ES5ProxyType ? _state239.get("flatRecord") : _state239.flatRecord, _values148 = _flatRecord239._ES5ProxyType ? _flatRecord239.get("values") : _flatRecord239.values, _Email16__c2 = _values148._ES5ProxyType ? _values148.get("Email16__c") : _values148.Email16__c)
      },
      key: 510
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num20",
        "fieldApiName": "Num20__c",
        "isInlineEditable": true
      },
      key: 511
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state240 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord240 = _state240._ES5ProxyType ? _state240.get("flatRecord") : _state240.flatRecord, _values149 = _flatRecord240._ES5ProxyType ? _flatRecord240.get("values") : _flatRecord240.values, _Num20__c = _values149._ES5ProxyType ? _values149.get("Num20__c") : _values149.Num20__c)
      },
      key: 512
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 513
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Email19",
        "fieldApiName": "Email19__c",
        "isInlineEditable": true
      },
      key: 514
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": (_state241 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord241 = _state241._ES5ProxyType ? _state241.get("flatRecord") : _state241.flatRecord, _values150 = _flatRecord241._ES5ProxyType ? _flatRecord241.get("values") : _flatRecord241.values, _Email19__c = _values150._ES5ProxyType ? _values150.get("Email19__c") : _values150.Email19__c),
        "value": (_state242 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord242 = _state242._ES5ProxyType ? _state242.get("flatRecord") : _state242.flatRecord, _values151 = _flatRecord242._ES5ProxyType ? _flatRecord242.get("values") : _flatRecord242.values, _Email19__c2 = _values151._ES5ProxyType ? _values151.get("Email19__c") : _values151.Email19__c)
      },
      key: 515
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num16",
        "fieldApiName": "Num16__c",
        "isInlineEditable": true
      },
      key: 516
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state243 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord243 = _state243._ES5ProxyType ? _state243.get("flatRecord") : _state243.flatRecord, _values152 = _flatRecord243._ES5ProxyType ? _flatRecord243.get("values") : _flatRecord243.values, _Num16__c = _values152._ES5ProxyType ? _values152.get("Num16__c") : _values152.Num16__c)
      },
      key: 517
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 518
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc12",
        "fieldApiName": "Perc12__c",
        "isInlineEditable": true
      },
      key: 519
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state244 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord244 = _state244._ES5ProxyType ? _state244.get("flatRecord") : _state244.flatRecord, _values153 = _flatRecord244._ES5ProxyType ? _flatRecord244.get("values") : _flatRecord244.values, _Perc12__c = _values153._ES5ProxyType ? _values153.get("Perc12__c") : _values153.Perc12__c)
      },
      key: 520
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num2",
        "fieldApiName": "Num2__c",
        "isInlineEditable": true
      },
      key: 521
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state245 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord245 = _state245._ES5ProxyType ? _state245.get("flatRecord") : _state245.flatRecord, _values154 = _flatRecord245._ES5ProxyType ? _flatRecord245.get("values") : _flatRecord245.values, _Num2__c = _values154._ES5ProxyType ? _values154.get("Num2__c") : _values154.Num2__c)
      },
      key: 522
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 523
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc17",
        "fieldApiName": "Perc17__c",
        "isInlineEditable": true
      },
      key: 524
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state246 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord246 = _state246._ES5ProxyType ? _state246.get("flatRecord") : _state246.flatRecord, _values155 = _flatRecord246._ES5ProxyType ? _flatRecord246.get("values") : _flatRecord246.values, _Perc17__c = _values155._ES5ProxyType ? _values155.get("Perc17__c") : _values155.Perc17__c)
      },
      key: 525
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num17",
        "fieldApiName": "Num17__c",
        "isInlineEditable": true
      },
      key: 526
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state247 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord247 = _state247._ES5ProxyType ? _state247.get("flatRecord") : _state247.flatRecord, _values156 = _flatRecord247._ES5ProxyType ? _flatRecord247.get("values") : _flatRecord247.values, _Num17__c = _values156._ES5ProxyType ? _values156.get("Num17__c") : _values156.Num17__c)
      },
      key: 527
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 528
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc13",
        "fieldApiName": "Perc13__c",
        "isInlineEditable": true
      },
      key: 529
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state248 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord248 = _state248._ES5ProxyType ? _state248.get("flatRecord") : _state248.flatRecord, _values157 = _flatRecord248._ES5ProxyType ? _flatRecord248.get("values") : _flatRecord248.values, _Perc13__c = _values157._ES5ProxyType ? _values157.get("Perc13__c") : _values157.Perc13__c)
      },
      key: 530
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num4",
        "fieldApiName": "Num4__c",
        "isInlineEditable": true
      },
      key: 531
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state249 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord249 = _state249._ES5ProxyType ? _state249.get("flatRecord") : _state249.flatRecord, _values158 = _flatRecord249._ES5ProxyType ? _flatRecord249.get("values") : _flatRecord249.values, _Num4__c = _values158._ES5ProxyType ? _values158.get("Num4__c") : _values158.Num4__c)
      },
      key: 532
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 533
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc1",
        "fieldApiName": "Perc1__c",
        "isInlineEditable": true
      },
      key: 534
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state250 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord250 = _state250._ES5ProxyType ? _state250.get("flatRecord") : _state250.flatRecord, _values159 = _flatRecord250._ES5ProxyType ? _flatRecord250.get("values") : _flatRecord250.values, _Perc1__c = _values159._ES5ProxyType ? _values159.get("Perc1__c") : _values159.Perc1__c)
      },
      key: 535
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num6",
        "fieldApiName": "Num6__c",
        "isInlineEditable": true
      },
      key: 536
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state251 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord251 = _state251._ES5ProxyType ? _state251.get("flatRecord") : _state251.flatRecord, _values160 = _flatRecord251._ES5ProxyType ? _flatRecord251.get("values") : _flatRecord251.values, _Num6__c = _values160._ES5ProxyType ? _values160.get("Num6__c") : _values160.Num6__c)
      },
      key: 537
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 538
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc16",
        "fieldApiName": "Perc16__c",
        "isInlineEditable": true
      },
      key: 539
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state252 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord252 = _state252._ES5ProxyType ? _state252.get("flatRecord") : _state252.flatRecord, _values161 = _flatRecord252._ES5ProxyType ? _flatRecord252.get("values") : _flatRecord252.values, _Perc16__c = _values161._ES5ProxyType ? _values161.get("Perc16__c") : _values161.Perc16__c)
      },
      key: 540
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num8",
        "fieldApiName": "Num8__c",
        "isInlineEditable": true
      },
      key: 541
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state253 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord253 = _state253._ES5ProxyType ? _state253.get("flatRecord") : _state253.flatRecord, _values162 = _flatRecord253._ES5ProxyType ? _flatRecord253.get("values") : _flatRecord253.values, _Num8__c = _values162._ES5ProxyType ? _values162.get("Num8__c") : _values162.Num8__c)
      },
      key: 542
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 543
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc10",
        "fieldApiName": "Perc10__c",
        "isInlineEditable": true
      },
      key: 544
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state254 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord254 = _state254._ES5ProxyType ? _state254.get("flatRecord") : _state254.flatRecord, _values163 = _flatRecord254._ES5ProxyType ? _flatRecord254.get("values") : _flatRecord254.values, _Perc10__c = _values163._ES5ProxyType ? _values163.get("Perc10__c") : _values163.Perc10__c)
      },
      key: 545
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num3",
        "fieldApiName": "Num3__c",
        "isInlineEditable": true
      },
      key: 546
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state255 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord255 = _state255._ES5ProxyType ? _state255.get("flatRecord") : _state255.flatRecord, _values164 = _flatRecord255._ES5ProxyType ? _flatRecord255.get("values") : _flatRecord255.values, _Num3__c = _values164._ES5ProxyType ? _values164.get("Num3__c") : _values164.Num3__c)
      },
      key: 547
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 548
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc5",
        "fieldApiName": "Perc5__c",
        "isInlineEditable": true
      },
      key: 549
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state256 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord256 = _state256._ES5ProxyType ? _state256.get("flatRecord") : _state256.flatRecord, _values165 = _flatRecord256._ES5ProxyType ? _flatRecord256.get("values") : _flatRecord256.values, _Perc5__c = _values165._ES5ProxyType ? _values165.get("Perc5__c") : _values165.Perc5__c)
      },
      key: 550
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num5",
        "fieldApiName": "Num5__c",
        "isInlineEditable": true
      },
      key: 551
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state257 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord257 = _state257._ES5ProxyType ? _state257.get("flatRecord") : _state257.flatRecord, _values166 = _flatRecord257._ES5ProxyType ? _flatRecord257.get("values") : _flatRecord257.values, _Num5__c = _values166._ES5ProxyType ? _values166.get("Num5__c") : _values166.Num5__c)
      },
      key: 552
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 553
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc11",
        "fieldApiName": "Perc11__c",
        "isInlineEditable": true
      },
      key: 554
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state258 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord258 = _state258._ES5ProxyType ? _state258.get("flatRecord") : _state258.flatRecord, _values167 = _flatRecord258._ES5ProxyType ? _flatRecord258.get("values") : _flatRecord258.values, _Perc11__c = _values167._ES5ProxyType ? _values167.get("Perc11__c") : _values167.Perc11__c)
      },
      key: 555
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Num7",
        "fieldApiName": "Num7__c",
        "isInlineEditable": true
      },
      key: 556
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state259 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord259 = _state259._ES5ProxyType ? _state259.get("flatRecord") : _state259.flatRecord, _values168 = _flatRecord259._ES5ProxyType ? _flatRecord259.get("values") : _flatRecord259.values, _Num7__c = _values168._ES5ProxyType ? _values168.get("Num7__c") : _values168.Num7__c)
      },
      key: 557
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 558
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc6",
        "fieldApiName": "Perc6__c",
        "isInlineEditable": true
      },
      key: 559
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state260 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord260 = _state260._ES5ProxyType ? _state260.get("flatRecord") : _state260.flatRecord, _values169 = _flatRecord260._ES5ProxyType ? _flatRecord260.get("values") : _flatRecord260.values, _Perc6__c = _values169._ES5ProxyType ? _values169.get("Perc6__c") : _values169.Perc6__c)
      },
      key: 560
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone20",
        "fieldApiName": "Phone20__c",
        "isInlineEditable": true
      },
      key: 561
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state261 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord261 = _state261._ES5ProxyType ? _state261.get("flatRecord") : _state261.flatRecord, _values170 = _flatRecord261._ES5ProxyType ? _flatRecord261.get("values") : _flatRecord261.values, _Phone20__c = _values170._ES5ProxyType ? _values170.get("Phone20__c") : _values170.Phone20__c)
      },
      key: 562
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 563
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc18",
        "fieldApiName": "Perc18__c",
        "isInlineEditable": true
      },
      key: 564
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state262 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord262 = _state262._ES5ProxyType ? _state262.get("flatRecord") : _state262.flatRecord, _values171 = _flatRecord262._ES5ProxyType ? _flatRecord262.get("values") : _flatRecord262.values, _Perc18__c = _values171._ES5ProxyType ? _values171.get("Perc18__c") : _values171.Perc18__c)
      },
      key: 565
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone15",
        "fieldApiName": "Phone15__c",
        "isInlineEditable": true
      },
      key: 566
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state263 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord263 = _state263._ES5ProxyType ? _state263.get("flatRecord") : _state263.flatRecord, _values172 = _flatRecord263._ES5ProxyType ? _flatRecord263.get("values") : _flatRecord263.values, _Phone15__c = _values172._ES5ProxyType ? _values172.get("Phone15__c") : _values172.Phone15__c)
      },
      key: 567
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 568
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc3",
        "fieldApiName": "Perc3__c",
        "isInlineEditable": true
      },
      key: 569
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state264 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord264 = _state264._ES5ProxyType ? _state264.get("flatRecord") : _state264.flatRecord, _values173 = _flatRecord264._ES5ProxyType ? _flatRecord264.get("values") : _flatRecord264.values, _Perc3__c = _values173._ES5ProxyType ? _values173.get("Perc3__c") : _values173.Perc3__c)
      },
      key: 570
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone3",
        "fieldApiName": "Phone3__c",
        "isInlineEditable": true
      },
      key: 571
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state265 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord265 = _state265._ES5ProxyType ? _state265.get("flatRecord") : _state265.flatRecord, _values174 = _flatRecord265._ES5ProxyType ? _flatRecord265.get("values") : _flatRecord265.values, _Phone3__c = _values174._ES5ProxyType ? _values174.get("Phone3__c") : _values174.Phone3__c)
      },
      key: 572
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 573
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc8",
        "fieldApiName": "Perc8__c",
        "isInlineEditable": true
      },
      key: 574
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state266 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord266 = _state266._ES5ProxyType ? _state266.get("flatRecord") : _state266.flatRecord, _values175 = _flatRecord266._ES5ProxyType ? _flatRecord266.get("values") : _flatRecord266.values, _Perc8__c = _values175._ES5ProxyType ? _values175.get("Perc8__c") : _values175.Perc8__c)
      },
      key: 575
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone19",
        "fieldApiName": "Phone19__c",
        "isInlineEditable": true
      },
      key: 576
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state267 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord267 = _state267._ES5ProxyType ? _state267.get("flatRecord") : _state267.flatRecord, _values176 = _flatRecord267._ES5ProxyType ? _flatRecord267.get("values") : _flatRecord267.values, _Phone19__c = _values176._ES5ProxyType ? _values176.get("Phone19__c") : _values176.Phone19__c)
      },
      key: 577
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 578
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc14",
        "fieldApiName": "Perc14__c",
        "isInlineEditable": true
      },
      key: 579
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state268 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord268 = _state268._ES5ProxyType ? _state268.get("flatRecord") : _state268.flatRecord, _values177 = _flatRecord268._ES5ProxyType ? _flatRecord268.get("values") : _flatRecord268.values, _Perc14__c = _values177._ES5ProxyType ? _values177.get("Perc14__c") : _values177.Perc14__c)
      },
      key: 580
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone2",
        "fieldApiName": "Phone2__c",
        "isInlineEditable": true
      },
      key: 581
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state269 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord269 = _state269._ES5ProxyType ? _state269.get("flatRecord") : _state269.flatRecord, _values178 = _flatRecord269._ES5ProxyType ? _flatRecord269.get("values") : _flatRecord269.values, _Phone2__c = _values178._ES5ProxyType ? _values178.get("Phone2__c") : _values178.Phone2__c)
      },
      key: 582
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 583
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc9",
        "fieldApiName": "Perc9__c",
        "isInlineEditable": true
      },
      key: 584
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state270 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord270 = _state270._ES5ProxyType ? _state270.get("flatRecord") : _state270.flatRecord, _values179 = _flatRecord270._ES5ProxyType ? _flatRecord270.get("values") : _flatRecord270.values, _Perc9__c = _values179._ES5ProxyType ? _values179.get("Perc9__c") : _values179.Perc9__c)
      },
      key: 585
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone16",
        "fieldApiName": "Phone16__c",
        "isInlineEditable": true
      },
      key: 586
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state271 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord271 = _state271._ES5ProxyType ? _state271.get("flatRecord") : _state271.flatRecord, _values180 = _flatRecord271._ES5ProxyType ? _flatRecord271.get("values") : _flatRecord271.values, _Phone16__c = _values180._ES5ProxyType ? _values180.get("Phone16__c") : _values180.Phone16__c)
      },
      key: 587
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 588
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc4",
        "fieldApiName": "Perc4__c",
        "isInlineEditable": true
      },
      key: 589
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state272 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord272 = _state272._ES5ProxyType ? _state272.get("flatRecord") : _state272.flatRecord, _values181 = _flatRecord272._ES5ProxyType ? _flatRecord272.get("values") : _flatRecord272.values, _Perc4__c = _values181._ES5ProxyType ? _values181.get("Perc4__c") : _values181.Perc4__c)
      },
      key: 590
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone18",
        "fieldApiName": "Phone18__c",
        "isInlineEditable": true
      },
      key: 591
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state273 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord273 = _state273._ES5ProxyType ? _state273.get("flatRecord") : _state273.flatRecord, _values182 = _flatRecord273._ES5ProxyType ? _flatRecord273.get("values") : _flatRecord273.values, _Phone18__c = _values182._ES5ProxyType ? _values182.get("Phone18__c") : _values182.Phone18__c)
      },
      key: 592
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 593
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc19",
        "fieldApiName": "Perc19__c",
        "isInlineEditable": true
      },
      key: 594
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state274 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord274 = _state274._ES5ProxyType ? _state274.get("flatRecord") : _state274.flatRecord, _values183 = _flatRecord274._ES5ProxyType ? _flatRecord274.get("values") : _flatRecord274.values, _Perc19__c = _values183._ES5ProxyType ? _values183.get("Perc19__c") : _values183.Perc19__c)
      },
      key: 595
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone12",
        "fieldApiName": "Phone12__c",
        "isInlineEditable": true
      },
      key: 596
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state275 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord275 = _state275._ES5ProxyType ? _state275.get("flatRecord") : _state275.flatRecord, _values184 = _flatRecord275._ES5ProxyType ? _flatRecord275.get("values") : _flatRecord275.values, _Phone12__c = _values184._ES5ProxyType ? _values184.get("Phone12__c") : _values184.Phone12__c)
      },
      key: 597
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 598
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc7",
        "fieldApiName": "Perc7__c",
        "isInlineEditable": true
      },
      key: 599
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state276 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord276 = _state276._ES5ProxyType ? _state276.get("flatRecord") : _state276.flatRecord, _values185 = _flatRecord276._ES5ProxyType ? _flatRecord276.get("values") : _flatRecord276.values, _Perc7__c = _values185._ES5ProxyType ? _values185.get("Perc7__c") : _values185.Perc7__c)
      },
      key: 600
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone11",
        "fieldApiName": "Phone11__c",
        "isInlineEditable": true
      },
      key: 601
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state277 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord277 = _state277._ES5ProxyType ? _state277.get("flatRecord") : _state277.flatRecord, _values186 = _flatRecord277._ES5ProxyType ? _flatRecord277.get("values") : _flatRecord277.values, _Phone11__c = _values186._ES5ProxyType ? _values186.get("Phone11__c") : _values186.Phone11__c)
      },
      key: 602
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 603
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc15",
        "fieldApiName": "Perc15__c",
        "isInlineEditable": true
      },
      key: 604
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state278 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord278 = _state278._ES5ProxyType ? _state278.get("flatRecord") : _state278.flatRecord, _values187 = _flatRecord278._ES5ProxyType ? _flatRecord278.get("values") : _flatRecord278.values, _Perc15__c = _values187._ES5ProxyType ? _values187.get("Perc15__c") : _values187.Perc15__c)
      },
      key: 605
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone13",
        "fieldApiName": "Phone13__c",
        "isInlineEditable": true
      },
      key: 606
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state279 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord279 = _state279._ES5ProxyType ? _state279.get("flatRecord") : _state279.flatRecord, _values188 = _flatRecord279._ES5ProxyType ? _flatRecord279.get("values") : _flatRecord279.values, _Phone13__c = _values188._ES5ProxyType ? _values188.get("Phone13__c") : _values188.Phone13__c)
      },
      key: 607
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 608
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc20",
        "fieldApiName": "Perc20__c",
        "isInlineEditable": true
      },
      key: 609
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state280 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord280 = _state280._ES5ProxyType ? _state280.get("flatRecord") : _state280.flatRecord, _values189 = _flatRecord280._ES5ProxyType ? _flatRecord280.get("values") : _flatRecord280.values, _Perc20__c = _values189._ES5ProxyType ? _values189.get("Perc20__c") : _values189.Perc20__c)
      },
      key: 610
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone5",
        "fieldApiName": "Phone5__c",
        "isInlineEditable": true
      },
      key: 611
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state281 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord281 = _state281._ES5ProxyType ? _state281.get("flatRecord") : _state281.flatRecord, _values190 = _flatRecord281._ES5ProxyType ? _flatRecord281.get("values") : _flatRecord281.values, _Phone5__c = _values190._ES5ProxyType ? _values190.get("Phone5__c") : _values190.Phone5__c)
      },
      key: 612
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 613
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Perc2",
        "fieldApiName": "Perc2__c",
        "isInlineEditable": true
      },
      key: 614
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state282 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord282 = _state282._ES5ProxyType ? _state282.get("flatRecord") : _state282.flatRecord, _values191 = _flatRecord282._ES5ProxyType ? _flatRecord282.get("values") : _flatRecord282.values, _Perc2__c = _values191._ES5ProxyType ? _values191.get("Perc2__c") : _values191.Perc2__c)
      },
      key: 615
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone8",
        "fieldApiName": "Phone8__c",
        "isInlineEditable": true
      },
      key: 616
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state283 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord283 = _state283._ES5ProxyType ? _state283.get("flatRecord") : _state283.flatRecord, _values192 = _flatRecord283._ES5ProxyType ? _flatRecord283.get("values") : _flatRecord283.values, _Phone8__c = _values192._ES5ProxyType ? _values192.get("Phone8__c") : _values192.Phone8__c)
      },
      key: 617
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 618
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text18",
        "fieldApiName": "Text18__c",
        "isInlineEditable": true
      },
      key: 619
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state284 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord284 = _state284._ES5ProxyType ? _state284.get("flatRecord") : _state284.flatRecord, _values193 = _flatRecord284._ES5ProxyType ? _flatRecord284.get("values") : _flatRecord284.values, _Text18__c = _values193._ES5ProxyType ? _values193.get("Text18__c") : _values193.Text18__c)
      },
      key: 620
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone6",
        "fieldApiName": "Phone6__c",
        "isInlineEditable": true
      },
      key: 621
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state285 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord285 = _state285._ES5ProxyType ? _state285.get("flatRecord") : _state285.flatRecord, _values194 = _flatRecord285._ES5ProxyType ? _flatRecord285.get("values") : _flatRecord285.values, _Phone6__c = _values194._ES5ProxyType ? _values194.get("Phone6__c") : _values194.Phone6__c)
      },
      key: 622
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 623
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea1",
        "fieldApiName": "TextArea1__c",
        "isInlineEditable": true
      },
      key: 624
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state286 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord286 = _state286._ES5ProxyType ? _state286.get("flatRecord") : _state286.flatRecord, _values195 = _flatRecord286._ES5ProxyType ? _flatRecord286.get("values") : _flatRecord286.values, _TextArea1__c = _values195._ES5ProxyType ? _values195.get("TextArea1__c") : _values195.TextArea1__c)
      },
      key: 625
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone4",
        "fieldApiName": "Phone4__c",
        "isInlineEditable": true
      },
      key: 626
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state287 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord287 = _state287._ES5ProxyType ? _state287.get("flatRecord") : _state287.flatRecord, _values196 = _flatRecord287._ES5ProxyType ? _flatRecord287.get("values") : _flatRecord287.values, _Phone4__c = _values196._ES5ProxyType ? _values196.get("Phone4__c") : _values196.Phone4__c)
      },
      key: 627
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 628
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text20",
        "fieldApiName": "Text20__c",
        "isInlineEditable": true
      },
      key: 629
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state288 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord288 = _state288._ES5ProxyType ? _state288.get("flatRecord") : _state288.flatRecord, _values197 = _flatRecord288._ES5ProxyType ? _flatRecord288.get("values") : _flatRecord288.values, _Text20__c = _values197._ES5ProxyType ? _values197.get("Text20__c") : _values197.Text20__c)
      },
      key: 630
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone7",
        "fieldApiName": "Phone7__c",
        "isInlineEditable": true
      },
      key: 631
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state289 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord289 = _state289._ES5ProxyType ? _state289.get("flatRecord") : _state289.flatRecord, _values198 = _flatRecord289._ES5ProxyType ? _flatRecord289.get("values") : _flatRecord289.values, _Phone7__c = _values198._ES5ProxyType ? _values198.get("Phone7__c") : _values198.Phone7__c)
      },
      key: 632
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 633
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea13",
        "fieldApiName": "TextArea13__c",
        "isInlineEditable": true
      },
      key: 634
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state290 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord290 = _state290._ES5ProxyType ? _state290.get("flatRecord") : _state290.flatRecord, _values199 = _flatRecord290._ES5ProxyType ? _flatRecord290.get("values") : _flatRecord290.values, _TextArea13__c = _values199._ES5ProxyType ? _values199.get("TextArea13__c") : _values199.TextArea13__c)
      },
      key: 635
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone9",
        "fieldApiName": "Phone9__c",
        "isInlineEditable": true
      },
      key: 636
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state291 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord291 = _state291._ES5ProxyType ? _state291.get("flatRecord") : _state291.flatRecord, _values200 = _flatRecord291._ES5ProxyType ? _flatRecord291.get("values") : _flatRecord291.values, _Phone9__c = _values200._ES5ProxyType ? _values200.get("Phone9__c") : _values200.Phone9__c)
      },
      key: 637
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 638
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text19",
        "fieldApiName": "Text19__c",
        "isInlineEditable": true
      },
      key: 639
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state292 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord292 = _state292._ES5ProxyType ? _state292.get("flatRecord") : _state292.flatRecord, _values201 = _flatRecord292._ES5ProxyType ? _flatRecord292.get("values") : _flatRecord292.values, _Text19__c = _values201._ES5ProxyType ? _values201.get("Text19__c") : _values201.Text19__c)
      },
      key: 640
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone14",
        "fieldApiName": "Phone14__c",
        "isInlineEditable": true
      },
      key: 641
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state293 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord293 = _state293._ES5ProxyType ? _state293.get("flatRecord") : _state293.flatRecord, _values202 = _flatRecord293._ES5ProxyType ? _flatRecord293.get("values") : _flatRecord293.values, _Phone14__c = _values202._ES5ProxyType ? _values202.get("Phone14__c") : _values202.Phone14__c)
      },
      key: 642
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 643
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text9",
        "fieldApiName": "Text9__c",
        "isInlineEditable": true
      },
      key: 644
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state294 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord294 = _state294._ES5ProxyType ? _state294.get("flatRecord") : _state294.flatRecord, _values203 = _flatRecord294._ES5ProxyType ? _flatRecord294.get("values") : _flatRecord294.values, _Text9__c = _values203._ES5ProxyType ? _values203.get("Text9__c") : _values203.Text9__c)
      },
      key: 645
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Phone17",
        "fieldApiName": "Phone17__c",
        "isInlineEditable": true
      },
      key: 646
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state295 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord295 = _state295._ES5ProxyType ? _state295.get("flatRecord") : _state295.flatRecord, _values204 = _flatRecord295._ES5ProxyType ? _flatRecord295.get("values") : _flatRecord295.values, _Phone17__c = _values204._ES5ProxyType ? _values204.get("Phone17__c") : _values204.Phone17__c)
      },
      key: 647
    }, [])])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 648
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "Text8",
        "fieldApiName": "Text8__c",
        "isInlineEditable": true
      },
      key: 649
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state296 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord296 = _state296._ES5ProxyType ? _state296.get("flatRecord") : _state296.flatRecord, _values205 = _flatRecord296._ES5ProxyType ? _flatRecord296.get("values") : _flatRecord296.values, _Text8__c = _values205._ES5ProxyType ? _values205.get("Text8__c") : _values205.Text8__c)
      },
      key: 650
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 651
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 652
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea15",
        "fieldApiName": "TextArea15__c",
        "isInlineEditable": true
      },
      key: 653
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state297 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord297 = _state297._ES5ProxyType ? _state297.get("flatRecord") : _state297.flatRecord, _values206 = _flatRecord297._ES5ProxyType ? _flatRecord297.get("values") : _flatRecord297.values, _TextArea15__c = _values206._ES5ProxyType ? _values206.get("TextArea15__c") : _values206.TextArea15__c)
      },
      key: 654
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 655
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 656
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea11",
        "fieldApiName": "TextArea11__c",
        "isInlineEditable": true
      },
      key: 657
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state298 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord298 = _state298._ES5ProxyType ? _state298.get("flatRecord") : _state298.flatRecord, _values207 = _flatRecord298._ES5ProxyType ? _flatRecord298.get("values") : _flatRecord298.values, _TextArea11__c = _values207._ES5ProxyType ? _values207.get("TextArea11__c") : _values207.TextArea11__c)
      },
      key: 658
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 659
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 660
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea18",
        "fieldApiName": "TextArea18__c",
        "isInlineEditable": true
      },
      key: 661
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state299 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord299 = _state299._ES5ProxyType ? _state299.get("flatRecord") : _state299.flatRecord, _values208 = _flatRecord299._ES5ProxyType ? _flatRecord299.get("values") : _flatRecord299.values, _TextArea18__c = _values208._ES5ProxyType ? _values208.get("TextArea18__c") : _values208.TextArea18__c)
      },
      key: 662
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 663
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 664
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea12",
        "fieldApiName": "TextArea12__c",
        "isInlineEditable": true
      },
      key: 665
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state300 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord300 = _state300._ES5ProxyType ? _state300.get("flatRecord") : _state300.flatRecord, _values209 = _flatRecord300._ES5ProxyType ? _flatRecord300.get("values") : _flatRecord300.values, _TextArea12__c = _values209._ES5ProxyType ? _values209.get("TextArea12__c") : _values209.TextArea12__c)
      },
      key: 666
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 667
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 668
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea19",
        "fieldApiName": "TextArea19__c",
        "isInlineEditable": true
      },
      key: 669
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state301 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord301 = _state301._ES5ProxyType ? _state301.get("flatRecord") : _state301.flatRecord, _values210 = _flatRecord301._ES5ProxyType ? _flatRecord301.get("values") : _flatRecord301.values, _TextArea19__c = _values210._ES5ProxyType ? _values210.get("TextArea19__c") : _values210.TextArea19__c)
      },
      key: 670
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 671
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 672
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea3",
        "fieldApiName": "TextArea3__c",
        "isInlineEditable": true
      },
      key: 673
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state302 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord302 = _state302._ES5ProxyType ? _state302.get("flatRecord") : _state302.flatRecord, _values211 = _flatRecord302._ES5ProxyType ? _flatRecord302.get("values") : _flatRecord302.values, _TextArea3__c = _values211._ES5ProxyType ? _values211.get("TextArea3__c") : _values211.TextArea3__c)
      },
      key: 674
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 675
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 676
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea8",
        "fieldApiName": "TextArea8__c",
        "isInlineEditable": true
      },
      key: 677
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state303 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord303 = _state303._ES5ProxyType ? _state303.get("flatRecord") : _state303.flatRecord, _values212 = _flatRecord303._ES5ProxyType ? _flatRecord303.get("values") : _flatRecord303.values, _TextArea8__c = _values212._ES5ProxyType ? _values212.get("TextArea8__c") : _values212.TextArea8__c)
      },
      key: 678
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 679
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 680
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea5",
        "fieldApiName": "TextArea5__c",
        "isInlineEditable": true
      },
      key: 681
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state304 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord304 = _state304._ES5ProxyType ? _state304.get("flatRecord") : _state304.flatRecord, _values213 = _flatRecord304._ES5ProxyType ? _flatRecord304.get("values") : _flatRecord304.values, _TextArea5__c = _values213._ES5ProxyType ? _values213.get("TextArea5__c") : _values213.TextArea5__c)
      },
      key: 682
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 683
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 684
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea20",
        "fieldApiName": "TextArea20__c",
        "isInlineEditable": true
      },
      key: 685
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state305 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord305 = _state305._ES5ProxyType ? _state305.get("flatRecord") : _state305.flatRecord, _values214 = _flatRecord305._ES5ProxyType ? _flatRecord305.get("values") : _flatRecord305.values, _TextArea20__c = _values214._ES5ProxyType ? _values214.get("TextArea20__c") : _values214.TextArea20__c)
      },
      key: 686
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 687
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 688
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea16",
        "fieldApiName": "TextArea16__c",
        "isInlineEditable": true
      },
      key: 689
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state306 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord306 = _state306._ES5ProxyType ? _state306.get("flatRecord") : _state306.flatRecord, _values215 = _flatRecord306._ES5ProxyType ? _flatRecord306.get("values") : _flatRecord306.values, _TextArea16__c = _values215._ES5ProxyType ? _values215.get("TextArea16__c") : _values215.TextArea16__c)
      },
      key: 690
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 691
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 692
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea6",
        "fieldApiName": "TextArea6__c",
        "isInlineEditable": true
      },
      key: 693
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state307 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord307 = _state307._ES5ProxyType ? _state307.get("flatRecord") : _state307.flatRecord, _values216 = _flatRecord307._ES5ProxyType ? _flatRecord307.get("values") : _flatRecord307.values, _TextArea6__c = _values216._ES5ProxyType ? _values216.get("TextArea6__c") : _values216.TextArea6__c)
      },
      key: 694
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 695
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 696
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea14",
        "fieldApiName": "TextArea14__c",
        "isInlineEditable": true
      },
      key: 697
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state308 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord308 = _state308._ES5ProxyType ? _state308.get("flatRecord") : _state308.flatRecord, _values217 = _flatRecord308._ES5ProxyType ? _flatRecord308.get("values") : _flatRecord308.values, _TextArea14__c = _values217._ES5ProxyType ? _values217.get("TextArea14__c") : _values217.TextArea14__c)
      },
      key: 698
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 699
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 700
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea7",
        "fieldApiName": "TextArea7__c",
        "isInlineEditable": true
      },
      key: 701
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state309 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord309 = _state309._ES5ProxyType ? _state309.get("flatRecord") : _state309.flatRecord, _values218 = _flatRecord309._ES5ProxyType ? _flatRecord309.get("values") : _flatRecord309.values, _TextArea7__c = _values218._ES5ProxyType ? _values218.get("TextArea7__c") : _values218.TextArea7__c)
      },
      key: 702
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 703
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 704
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea2",
        "fieldApiName": "TextArea2__c",
        "isInlineEditable": true
      },
      key: 705
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state310 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord310 = _state310._ES5ProxyType ? _state310.get("flatRecord") : _state310.flatRecord, _values219 = _flatRecord310._ES5ProxyType ? _flatRecord310.get("values") : _flatRecord310.values, _TextArea2__c = _values219._ES5ProxyType ? _values219.get("TextArea2__c") : _values219.TextArea2__c)
      },
      key: 706
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 707
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 708
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea9",
        "fieldApiName": "TextArea9__c",
        "isInlineEditable": true
      },
      key: 709
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state311 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord311 = _state311._ES5ProxyType ? _state311.get("flatRecord") : _state311.flatRecord, _values220 = _flatRecord311._ES5ProxyType ? _flatRecord311.get("values") : _flatRecord311.values, _TextArea9__c = _values220._ES5ProxyType ? _values220.get("TextArea9__c") : _values220.TextArea9__c)
      },
      key: 710
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 711
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 712
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea17",
        "fieldApiName": "TextArea17__c",
        "isInlineEditable": true
      },
      key: 713
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state312 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord312 = _state312._ES5ProxyType ? _state312.get("flatRecord") : _state312.flatRecord, _values221 = _flatRecord312._ES5ProxyType ? _flatRecord312.get("values") : _flatRecord312.values, _TextArea17__c = _values221._ES5ProxyType ? _values221.get("TextArea17__c") : _values221.TextArea17__c)
      },
      key: 714
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 715
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 716
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea4",
        "fieldApiName": "TextArea4__c",
        "isInlineEditable": true
      },
      key: 717
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state313 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord313 = _state313._ES5ProxyType ? _state313.get("flatRecord") : _state313.flatRecord, _values222 = _flatRecord313._ES5ProxyType ? _flatRecord313.get("values") : _flatRecord313.values, _TextArea4__c = _values222._ES5ProxyType ? _values222.get("TextArea4__c") : _values222.TextArea4__c)
      },
      key: 718
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 719
    }, [])]), api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 720
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": "TextArea10",
        "fieldApiName": "TextArea10__c",
        "isInlineEditable": true
      },
      key: 721
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "value": (_state314 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _flatRecord314 = _state314._ES5ProxyType ? _state314.get("flatRecord") : _state314.flatRecord, _values223 = _flatRecord314._ES5ProxyType ? _flatRecord314.get("values") : _flatRecord314.values, _TextArea10__c = _values223._ES5ProxyType ? _values223.get("TextArea10__c") : _values223.TextArea10__c)
      },
      key: 722
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 723
    }, [])])]), api_custom_element("integration-record-layout-section", _integrationRecordLayoutSection, {
      classMap: {
        "01Bxx0000029W7NEAU": true
      },
      props: {
        "mode": "VIEW",
        "titleLabel": "Custom Links"
      },
      key: 724,
      on: {
        "togglesectioncollapsed": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleToggleSectionCollapsed") : $cmp.handleToggleSectionCollapsed))
      }
    }, [api_custom_element("integration-record-layout-row", _integrationRecordLayoutRow, {
      classMap: {
        "slds-grid": true
      },
      key: 725
    }, [api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem"
      },
      key: 726
    }, [api_custom_element("integration-record-layout-leaf", _integrationRecordLayoutLeaf, {
      props: {
        "label": "x",
        "title": "x",
        "value": "/servlet/servlet.Integration?lid=00bxx000000iY2G&eid=ENTITY_ID&ic=1"
      },
      key: 727
    }, [])]), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 728
    }, []), api_custom_element("integration-record-layout-item", _integrationRecordLayoutItem, {
      classMap: {
        "slds-has-flexi-truncate": true,
        "slds-p-horizontal_x-small": true
      },
      props: {
        "mode": "VIEW",
        "role": "listitem",
        "fieldLabel": ""
      },
      key: 729
    }, [])])])];
  }

  var _tmpl$4 = lwc.registerTemplate(tmpl$4);

  __setKey(tmpl$4, "stylesheets", []);

  __setKey(tmpl$4, "stylesheetTokens", {
    hostAttribute: "integration-record-layout_record-layout-host",
    shadowAttribute: "integration-record-layout_record-layout"
  });

  var mockState = {
    "flatRecord": {
      "id": "006xx000001ZdxuAAC",
      "values": {
        "Account": {
          "apiName": "Account",
          "childRelationships": {},
          "fields": {
            "Id": {
              "displayValue": null,
              "value": "001xx000003DIIxAAO"
            },
            "Name": {
              "displayValue": null,
              "value": "Acme"
            }
          },
          "id": "001xx000003DIIxAAO",
          "recordTypeInfo": null
        },
        "AccountId": "001xx000003DIIxAAO",
        "Amount": 140000,
        "Campaign": null,
        "CampaignId": null,
        "Checkbox10__c": false,
        "Checkbox11__c": false,
        "Checkbox12__c": false,
        "Checkbox13__c": false,
        "Checkbox14__c": false,
        "Checkbox15__c": false,
        "Checkbox16__c": false,
        "Checkbox17__c": false,
        "Checkbox18__c": false,
        "Checkbox19__c": false,
        "Checkbox1__c": true,
        "Checkbox20__c": false,
        "Checkbox2__c": false,
        "Checkbox3__c": false,
        "Checkbox4__c": true,
        "Checkbox5__c": false,
        "Checkbox6__c": false,
        "Checkbox7__c": false,
        "Checkbox8__c": false,
        "Checkbox9__c": false,
        "CloseDate": "2015-05-05",
        "CreatedBy": {
          "apiName": "User",
          "childRelationships": {},
          "fields": {
            "Id": {
              "displayValue": null,
              "value": "005xx000001T1vNAAS"
            },
            "Name": {
              "displayValue": null,
              "value": "Test User"
            }
          },
          "id": "005xx000001T1vNAAS",
          "recordTypeInfo": null
        },
        "CreatedById": "005xx000001T1vNAAS",
        "CreatedDate": "2017-07-17T20:36:53.000Z",
        "Currency10__c": 765,
        "Currency11__c": 765,
        "Currency12__c": 43,
        "Currency13__c": 6,
        "Currency14__c": 7876,
        "Currency15__c": 45,
        "Currency16__c": 4,
        "Currency17__c": 87,
        "Currency18__c": 234,
        "Currency19__c": 876,
        "Currency1__c": 876,
        "Currency20__c": 6,
        "Currency2__c": 899,
        "Currency3__c": 98,
        "Currency4__c": 98,
        "Currency5__c": 5,
        "Currency7__c": 456,
        "Currency8__c": 88,
        "Currency9__c": 87,
        "Date10__c": null,
        "Date11__c": null,
        "Date12__c": null,
        "Date13__c": null,
        "Date14__c": null,
        "Date15__c": null,
        "Date16__c": null,
        "Date17__c": null,
        "Date18__c": null,
        "Date19__c": null,
        "Date1__c": "2017-07-31",
        "Date20__c": null,
        "Date5__c": null,
        "Date6__c": null,
        "Date7__c": null,
        "Date8__c": null,
        "Date9__c": null,
        "DateTime10__c": "2017-07-18T19:30:00.000Z",
        "DateTime11__c": "2017-07-03T19:30:00.000Z",
        "DateTime12__c": "2017-07-19T19:30:00.000Z",
        "DateTime13__c": null,
        "DateTime14__c": "2017-07-05T19:30:00.000Z",
        "DateTime15__c": "2017-07-17T19:30:00.000Z",
        "DateTime16__c": null,
        "DateTime17__c": "2017-07-02T19:30:00.000Z",
        "DateTime18__c": null,
        "DateTime19__c": "2017-07-04T19:30:00.000Z",
        "DateTime1__c": "2017-07-11T19:30:00.000Z",
        "DateTime20__c": null,
        "DateTime2__c": null,
        "DateTime3__c": "2017-07-03T19:30:00.000Z",
        "DateTime4__c": null,
        "DateTime5__c": null,
        "DateTime6__c": null,
        "DateTime7__c": null,
        "DateTime8__c": null,
        "DateTime9__c": null,
        "Description": "The deal is at  50% because they are at the sales process stage of evaluating our ROI justification.",
        "Email10__c": "foo@bar.com",
        "Email11__c": "foo@bar.com",
        "Email12__c": "foo@bar.com",
        "Email13__c": "foo@bar.com",
        "Email14__c": "foo@bar.com",
        "Email15__c": "foo@bar.com",
        "Email16__c": "foo@bar.com",
        "Email17__c": "foo@bar.com",
        "Email18__c": "foo@bar.com",
        "Email19__c": "foo@bar.comv",
        "Email1__c": "foo@bar.com",
        "Email20__c": "foo@bar.com",
        "Email2__c": "foo@bar.com",
        "Email3__c": "foo@bar.com",
        "Email4__c": "foo@bar.com",
        "Email5__c": "foo@bar.com",
        "Email6__c": "foo@bar.com",
        "Email7__c": "foo@bar.com",
        "Email8__c": "foo@bar.com",
        "Email9__c": "foo@bar.com",
        "ForecastCategoryName": "Pipeline",
        "LastModifiedBy": {
          "apiName": "User",
          "childRelationships": {},
          "fields": {
            "Id": {
              "displayValue": null,
              "value": "005xx000001T1vNAAS"
            },
            "Name": {
              "displayValue": null,
              "value": "Test User"
            }
          },
          "id": "005xx000001T1vNAAS",
          "recordTypeInfo": null
        },
        "LastModifiedById": "005xx000001T1vNAAS",
        "LastModifiedDate": "2017-07-21T19:32:11.000Z",
        "LeadSource": "Trade Show",
        "Name": "Acme - 1,200 Widgets",
        "NextStep": "Need estimate",
        "Num10__c": 876,
        "Num11__c": 87,
        "Num12__c": 65,
        "Num13__c": 68,
        "Num14__c": 876,
        "Num15__c": 123,
        "Num16__c": 765,
        "Num17__c": 65,
        "Num18__c": null,
        "Num19__c": null,
        "Num1__c": 76,
        "Num20__c": 5,
        "Num2__c": 87,
        "Num3__c": 876,
        "Num4__c": 876,
        "Num5__c": 5,
        "Num6__c": 5,
        "Num7__c": 7865,
        "Num8__c": 7865,
        "Num9__c": 86,
        "Owner": {
          "apiName": "User",
          "childRelationships": {},
          "fields": {
            "Id": {
              "displayValue": null,
              "value": "005xx000001T1vNAAS"
            },
            "Name": {
              "displayValue": null,
              "value": "Test User"
            }
          },
          "id": "005xx000001T1vNAAS",
          "recordTypeInfo": null
        },
        "OwnerId": "005xx000001T1vNAAS",
        "Perc10__c": 4,
        "Perc11__c": 6,
        "Perc12__c": 123,
        "Perc13__c": 123,
        "Perc14__c": 5,
        "Perc15__c": 6,
        "Perc16__c": 123,
        "Perc17__c": 123,
        "Perc18__c": 5,
        "Perc19__c": 8,
        "Perc1__c": 122,
        "Perc20__c": 2,
        "Perc2__c": 2,
        "Perc3__c": 9,
        "Perc4__c": 9,
        "Perc5__c": 6,
        "Perc6__c": 7,
        "Perc7__c": 7,
        "Perc8__c": 6,
        "Perc9__c": 5,
        "Phone11__c": "65",
        "Phone12__c": "87",
        "Phone13__c": "876",
        "Phone14__c": "587",
        "Phone15__c": "5",
        "Phone16__c": "876",
        "Phone17__c": "65",
        "Phone18__c": "8765",
        "Phone19__c": "876",
        "Phone20__c": "876",
        "Phone2__c": "5",
        "Phone3__c": "765",
        "Phone4__c": "58",
        "Phone5__c": "587",
        "Phone6__c": "876",
        "Phone7__c": "765",
        "Phone8__c": "65",
        "Phone9__c": "876",
        "Pricebook2": null,
        "Pricebook2Id": null,
        "Probability": 50,
        "StageName": "Value Proposition",
        "Text18__c": "foo",
        "Text19__c": "gkj",
        "Text1__c": "is",
        "Text20__c": "hjg",
        "Text2__c": "garbage",
        "Text3__c": "stuff",
        "Text4__c": "for",
        "Text5__c": "recprd",
        "Text8__c": "kjh",
        "Text9__c": "hg",
        "TextArea10__c": "kgv",
        "TextArea11__c": "hg",
        "TextArea12__c": "kj",
        "TextArea13__c": "jkh",
        "TextArea14__c": "kj",
        "TextArea15__c": "gkj",
        "TextArea16__c": "hg",
        "TextArea17__c": "hj",
        "TextArea18__c": "kjhg",
        "TextArea19__c": "hg",
        "TextArea1__c": "asd",
        "TextArea20__c": "kj",
        "TextArea2__c": "vh",
        "TextArea3__c": "kjh",
        "TextArea4__c": "gv",
        "TextArea5__c": "hg",
        "TextArea6__c": "kjh",
        "TextArea7__c": "khg",
        "TextArea8__c": "gkj",
        "TextArea9__c": "jgv",
        "Type": "Existing Business",
        "c01__c": 12,
        "c02__c": 123,
        "c03__c": 123,
        "c04__c": 123,
        "c05__c": "2017-07-02",
        "date01__c": "2017-07-15",
        "date02__c": "2017-07-03",
        "date03__c": "2017-07-10",
        "date04__c": "2017-07-10",
        "date05__c": "2017-07-03",
        "dt01__c": "2017-07-13T22:17:00.000Z",
        "dt02__c": "2017-07-04T22:17:00.000Z",
        "dt03__c": "2017-07-20T22:17:00.000Z",
        "dt04__c": "2017-06-28T22:17:00.000Z",
        "dt05__c": "2017-07-07T22:17:00.000Z",
        "dt06__c": "2017-07-22T22:17:00.000Z",
        "dt07__c": "2017-07-16T22:17:00.000Z",
        "dt08__c": "2017-07-04T01:42:00.000Z",
        "dt09__c": "2017-06-27T01:42:00.000Z",
        "dt10__c": "2017-07-10T22:17:00.000Z",
        "e01__c": "foo@bar.com",
        "e02__c": "foo@bar.com",
        "e03__c": "foo@bar.com",
        "e04__c": "foo@bar.com",
        "e05__c": "foo@bar.com",
        "e06__c": "foo@bar.com",
        "e07__c": "foo@bar.com",
        "e08__c": "foo@bar.com",
        "e09__c": "foo@bar.com",
        "e10__c": "foo@bar.com",
        "n01__c": 123,
        "n02__c": 120,
        "n03__c": 786234876,
        "n04__c": 387623,
        "n05__c": 28765,
        "n06__c": 123213423,
        "n07__c": 23423234,
        "n08__c": 12457,
        "n09__c": 245769,
        "n10__c": 234275,
        "percent01__c": 12,
        "percent02__c": 345,
        "percent03__c": 12,
        "percent04__c": 345,
        "percent05__c": 23,
        "percent06__c": 123,
        "percent07__c": 2,
        "percent09__c": 123,
        "percent8__c": 3,
        "phone01__c": "34",
        "phone02__c": "5",
        "phone03__c": "55",
        "phone04__c": "123",
        "phone05__c": "35",
        "phone06__c": "1234",
        "phone07__c": "54",
        "phone08__c": "123",
        "phone09__c": "32",
        "phone10__c": "s2e234",
        "picklist02__c": "t01,t02,t03,t04,t01,t02,t03,t04,t01,t02,t03,t04",
        "picklist03__c": "b",
        "picklist04__c": "a",
        "picklist__c": "pick01,pick02,pick03",
        "rt01__c": "&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&quot;",
        "rt02__c": "&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&quot;",
        "txt01__c": "asd",
        "txt02__c": "sdf",
        "txt03__c": "sdf",
        "txt04__c": "sdf",
        "txt05__c": "sdf",
        "txt06__c": "sdf",
        "txt07__c": "sdf",
        "txt08__c": "sdf",
        "txt09__c": "sdf",
        "txt10__c": "dsfsdf",
        "url01__c": "foo.com",
        "url02__c": "qsd"
      },
      "displayValues": {
        "Account": "Acme",
        "AccountId": null,
        "Amount": "$140,000.00",
        "Campaign": null,
        "CampaignId": null,
        "Checkbox10__c": null,
        "Checkbox11__c": null,
        "Checkbox12__c": null,
        "Checkbox13__c": null,
        "Checkbox14__c": null,
        "Checkbox15__c": null,
        "Checkbox16__c": null,
        "Checkbox17__c": null,
        "Checkbox18__c": null,
        "Checkbox19__c": null,
        "Checkbox1__c": null,
        "Checkbox20__c": null,
        "Checkbox2__c": null,
        "Checkbox3__c": null,
        "Checkbox4__c": null,
        "Checkbox5__c": null,
        "Checkbox6__c": null,
        "Checkbox7__c": null,
        "Checkbox8__c": null,
        "Checkbox9__c": null,
        "CloseDate": "5/5/2015",
        "CreatedBy": "Test User",
        "CreatedById": null,
        "CreatedDate": "7/17/2017 1:36 PM",
        "Currency10__c": "$765",
        "Currency11__c": "$765",
        "Currency12__c": "$43",
        "Currency13__c": "$6",
        "Currency14__c": "$7,876",
        "Currency15__c": "$45",
        "Currency16__c": "$4",
        "Currency17__c": "$87",
        "Currency18__c": "$234",
        "Currency19__c": "$876",
        "Currency1__c": "$876",
        "Currency20__c": "$6",
        "Currency2__c": "$899",
        "Currency3__c": "$98",
        "Currency4__c": "$98",
        "Currency5__c": "$5",
        "Currency7__c": "$456",
        "Currency8__c": "$88",
        "Currency9__c": "$87",
        "Date10__c": null,
        "Date11__c": null,
        "Date12__c": null,
        "Date13__c": null,
        "Date14__c": null,
        "Date15__c": null,
        "Date16__c": null,
        "Date17__c": null,
        "Date18__c": null,
        "Date19__c": null,
        "Date1__c": "7/31/2017",
        "Date20__c": null,
        "Date5__c": null,
        "Date6__c": null,
        "Date7__c": null,
        "Date8__c": null,
        "Date9__c": null,
        "DateTime10__c": "7/18/2017 12:30 PM",
        "DateTime11__c": "7/3/2017 12:30 PM",
        "DateTime12__c": "7/19/2017 12:30 PM",
        "DateTime13__c": null,
        "DateTime14__c": "7/5/2017 12:30 PM",
        "DateTime15__c": "7/17/2017 12:30 PM",
        "DateTime16__c": null,
        "DateTime17__c": "7/2/2017 12:30 PM",
        "DateTime18__c": null,
        "DateTime19__c": "7/4/2017 12:30 PM",
        "DateTime1__c": "7/11/2017 12:30 PM",
        "DateTime20__c": null,
        "DateTime2__c": null,
        "DateTime3__c": "7/3/2017 12:30 PM",
        "DateTime4__c": null,
        "DateTime5__c": null,
        "DateTime6__c": null,
        "DateTime7__c": null,
        "DateTime8__c": null,
        "DateTime9__c": null,
        "Description": null,
        "Email10__c": null,
        "Email11__c": null,
        "Email12__c": null,
        "Email13__c": null,
        "Email14__c": null,
        "Email15__c": null,
        "Email16__c": null,
        "Email17__c": null,
        "Email18__c": null,
        "Email19__c": null,
        "Email1__c": null,
        "Email20__c": null,
        "Email2__c": null,
        "Email3__c": null,
        "Email4__c": null,
        "Email5__c": null,
        "Email6__c": null,
        "Email7__c": null,
        "Email8__c": null,
        "Email9__c": null,
        "ForecastCategoryName": "Pipeline",
        "LastModifiedBy": "Test User",
        "LastModifiedById": null,
        "LastModifiedDate": "7/21/2017 12:32 PM",
        "LeadSource": "Trade Show",
        "Name": null,
        "NextStep": null,
        "Num10__c": null,
        "Num11__c": null,
        "Num12__c": null,
        "Num13__c": null,
        "Num14__c": null,
        "Num15__c": null,
        "Num16__c": null,
        "Num17__c": null,
        "Num18__c": null,
        "Num19__c": null,
        "Num1__c": null,
        "Num20__c": null,
        "Num2__c": null,
        "Num3__c": null,
        "Num4__c": null,
        "Num5__c": null,
        "Num6__c": null,
        "Num7__c": null,
        "Num8__c": null,
        "Num9__c": null,
        "Owner": "Test User",
        "OwnerId": null,
        "Perc10__c": null,
        "Perc11__c": null,
        "Perc12__c": null,
        "Perc13__c": null,
        "Perc14__c": null,
        "Perc15__c": null,
        "Perc16__c": null,
        "Perc17__c": null,
        "Perc18__c": null,
        "Perc19__c": null,
        "Perc1__c": null,
        "Perc20__c": null,
        "Perc2__c": null,
        "Perc3__c": null,
        "Perc4__c": null,
        "Perc5__c": null,
        "Perc6__c": null,
        "Perc7__c": null,
        "Perc8__c": null,
        "Perc9__c": null,
        "Phone11__c": null,
        "Phone12__c": null,
        "Phone13__c": null,
        "Phone14__c": null,
        "Phone15__c": null,
        "Phone16__c": null,
        "Phone17__c": null,
        "Phone18__c": null,
        "Phone19__c": null,
        "Phone20__c": null,
        "Phone2__c": null,
        "Phone3__c": null,
        "Phone4__c": null,
        "Phone5__c": null,
        "Phone6__c": null,
        "Phone7__c": null,
        "Phone8__c": null,
        "Phone9__c": null,
        "Pricebook2": null,
        "Pricebook2Id": null,
        "Probability": null,
        "StageName": "Value Proposition",
        "Text18__c": null,
        "Text19__c": null,
        "Text1__c": null,
        "Text20__c": null,
        "Text2__c": null,
        "Text3__c": null,
        "Text4__c": null,
        "Text5__c": null,
        "Text8__c": null,
        "Text9__c": null,
        "TextArea10__c": null,
        "TextArea11__c": null,
        "TextArea12__c": null,
        "TextArea13__c": null,
        "TextArea14__c": null,
        "TextArea15__c": null,
        "TextArea16__c": null,
        "TextArea17__c": null,
        "TextArea18__c": null,
        "TextArea19__c": null,
        "TextArea1__c": null,
        "TextArea20__c": null,
        "TextArea2__c": null,
        "TextArea3__c": null,
        "TextArea4__c": null,
        "TextArea5__c": null,
        "TextArea6__c": null,
        "TextArea7__c": null,
        "TextArea8__c": null,
        "TextArea9__c": null,
        "Type": "Existing Business",
        "c01__c": "$12",
        "c02__c": "$123",
        "c03__c": "$123",
        "c04__c": "$123",
        "c05__c": "7/2/2017",
        "date01__c": "7/15/2017",
        "date02__c": "7/3/2017",
        "date03__c": "7/10/2017",
        "date04__c": "7/10/2017",
        "date05__c": "7/3/2017",
        "dt01__c": "7/13/2017 3:17 PM",
        "dt02__c": "7/4/2017 3:17 PM",
        "dt03__c": "7/20/2017 3:17 PM",
        "dt04__c": "6/28/2017 3:17 PM",
        "dt05__c": "7/7/2017 3:17 PM",
        "dt06__c": "7/22/2017 3:17 PM",
        "dt07__c": "7/16/2017 3:17 PM",
        "dt08__c": "7/3/2017 6:42 PM",
        "dt09__c": "6/26/2017 6:42 PM",
        "dt10__c": "7/10/2017 3:17 PM",
        "e01__c": null,
        "e02__c": null,
        "e03__c": null,
        "e04__c": null,
        "e05__c": null,
        "e06__c": null,
        "e07__c": null,
        "e08__c": null,
        "e09__c": null,
        "e10__c": null,
        "n01__c": null,
        "n02__c": null,
        "n03__c": null,
        "n04__c": null,
        "n05__c": null,
        "n06__c": null,
        "n07__c": null,
        "n08__c": null,
        "n09__c": null,
        "n10__c": null,
        "percent01__c": null,
        "percent02__c": null,
        "percent03__c": null,
        "percent04__c": null,
        "percent05__c": null,
        "percent06__c": null,
        "percent07__c": null,
        "percent09__c": null,
        "percent8__c": null,
        "phone01__c": null,
        "phone02__c": null,
        "phone03__c": null,
        "phone04__c": null,
        "phone05__c": null,
        "phone06__c": null,
        "phone07__c": null,
        "phone08__c": null,
        "phone09__c": null,
        "phone10__c": null,
        "picklist02__c": "t01,t02,t03,t04,t01,t02,t03,t04,t01,t02,t03,t04",
        "picklist03__c": "b",
        "picklist04__c": "a",
        "picklist__c": "pick01,pick02,pick03",
        "rt01__c": null,
        "rt02__c": null,
        "txt01__c": null,
        "txt02__c": null,
        "txt03__c": null,
        "txt04__c": null,
        "txt05__c": null,
        "txt06__c": null,
        "txt07__c": null,
        "txt08__c": null,
        "txt09__c": null,
        "txt10__c": null,
        "url01__c": null,
        "url02__c": null
      },
      "relationshipApiNames": {
        "Account": "Account",
        "CreatedBy": "User",
        "LastModifiedBy": "User",
        "Owner": "User"
      },
      "avatars": {
        "Account": {
          "backgroundColor": "7F8DE1",
          "iconUrl": "https://dval-wsm.internal.salesforce.com:7443/img/icon/t4v35/standard/account_120.png",
          "recordId": "001xx000003DIIxAAO",
          "type": "Theme"
        },
        "CreatedBy": {
          "backgroundColor": null,
          "height": null,
          "photoUrl": "/profilephoto/005/T",
          "recordId": "005xx000001T1vNAAS",
          "type": "Photo",
          "width": null
        },
        "LastModifiedBy": {
          "backgroundColor": null,
          "height": null,
          "photoUrl": "/profilephoto/005/T",
          "recordId": "005xx000001T1vNAAS",
          "type": "Photo",
          "width": null
        },
        "Owner": {
          "backgroundColor": null,
          "height": null,
          "photoUrl": "/profilephoto/005/T",
          "recordId": "005xx000001T1vNAAS",
          "type": "Photo",
          "width": null
        }
      }
    },
    "record": {
      "apiName": "Opportunity",
      "childRelationships": {},
      "fields": {
        "Account": {
          "displayValue": "Acme",
          "value": {
            "apiName": "Account",
            "childRelationships": {},
            "fields": {
              "Id": {
                "displayValue": null,
                "value": "001xx000003DIIxAAO"
              },
              "Name": {
                "displayValue": null,
                "value": "Acme"
              }
            },
            "id": "001xx000003DIIxAAO",
            "recordTypeInfo": null
          }
        },
        "AccountId": {
          "displayValue": null,
          "value": "001xx000003DIIxAAO"
        },
        "Amount": {
          "displayValue": "$140,000.00",
          "value": 140000
        },
        "Campaign": {
          "displayValue": null,
          "value": null
        },
        "CampaignId": {
          "displayValue": null,
          "value": null
        },
        "Checkbox10__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox11__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox12__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox13__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox14__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox15__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox16__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox17__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox18__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox19__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox1__c": {
          "displayValue": null,
          "value": true
        },
        "Checkbox20__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox2__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox3__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox4__c": {
          "displayValue": null,
          "value": true
        },
        "Checkbox5__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox6__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox7__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox8__c": {
          "displayValue": null,
          "value": false
        },
        "Checkbox9__c": {
          "displayValue": null,
          "value": false
        },
        "CloseDate": {
          "displayValue": "5/5/2015",
          "value": "2015-05-05"
        },
        "CreatedBy": {
          "displayValue": "Test User",
          "value": {
            "apiName": "User",
            "childRelationships": {},
            "fields": {
              "Id": {
                "displayValue": null,
                "value": "005xx000001T1vNAAS"
              },
              "Name": {
                "displayValue": null,
                "value": "Test User"
              }
            },
            "id": "005xx000001T1vNAAS",
            "recordTypeInfo": null
          }
        },
        "CreatedById": {
          "displayValue": null,
          "value": "005xx000001T1vNAAS"
        },
        "CreatedDate": {
          "displayValue": "7/17/2017 1:36 PM",
          "value": "2017-07-17T20:36:53.000Z"
        },
        "Currency10__c": {
          "displayValue": "$765",
          "value": 765
        },
        "Currency11__c": {
          "displayValue": "$765",
          "value": 765
        },
        "Currency12__c": {
          "displayValue": "$43",
          "value": 43
        },
        "Currency13__c": {
          "displayValue": "$6",
          "value": 6
        },
        "Currency14__c": {
          "displayValue": "$7,876",
          "value": 7876
        },
        "Currency15__c": {
          "displayValue": "$45",
          "value": 45
        },
        "Currency16__c": {
          "displayValue": "$4",
          "value": 4
        },
        "Currency17__c": {
          "displayValue": "$87",
          "value": 87
        },
        "Currency18__c": {
          "displayValue": "$234",
          "value": 234
        },
        "Currency19__c": {
          "displayValue": "$876",
          "value": 876
        },
        "Currency1__c": {
          "displayValue": "$876",
          "value": 876
        },
        "Currency20__c": {
          "displayValue": "$6",
          "value": 6
        },
        "Currency2__c": {
          "displayValue": "$899",
          "value": 899
        },
        "Currency3__c": {
          "displayValue": "$98",
          "value": 98
        },
        "Currency4__c": {
          "displayValue": "$98",
          "value": 98
        },
        "Currency5__c": {
          "displayValue": "$5",
          "value": 5
        },
        "Currency7__c": {
          "displayValue": "$456",
          "value": 456
        },
        "Currency8__c": {
          "displayValue": "$88",
          "value": 88
        },
        "Currency9__c": {
          "displayValue": "$87",
          "value": 87
        },
        "Date10__c": {
          "displayValue": null,
          "value": null
        },
        "Date11__c": {
          "displayValue": null,
          "value": null
        },
        "Date12__c": {
          "displayValue": null,
          "value": null
        },
        "Date13__c": {
          "displayValue": null,
          "value": null
        },
        "Date14__c": {
          "displayValue": null,
          "value": null
        },
        "Date15__c": {
          "displayValue": null,
          "value": null
        },
        "Date16__c": {
          "displayValue": null,
          "value": null
        },
        "Date17__c": {
          "displayValue": null,
          "value": null
        },
        "Date18__c": {
          "displayValue": null,
          "value": null
        },
        "Date19__c": {
          "displayValue": null,
          "value": null
        },
        "Date1__c": {
          "displayValue": "7/31/2017",
          "value": "2017-07-31"
        },
        "Date20__c": {
          "displayValue": null,
          "value": null
        },
        "Date5__c": {
          "displayValue": null,
          "value": null
        },
        "Date6__c": {
          "displayValue": null,
          "value": null
        },
        "Date7__c": {
          "displayValue": null,
          "value": null
        },
        "Date8__c": {
          "displayValue": null,
          "value": null
        },
        "Date9__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime10__c": {
          "displayValue": "7/18/2017 12:30 PM",
          "value": "2017-07-18T19:30:00.000Z"
        },
        "DateTime11__c": {
          "displayValue": "7/3/2017 12:30 PM",
          "value": "2017-07-03T19:30:00.000Z"
        },
        "DateTime12__c": {
          "displayValue": "7/19/2017 12:30 PM",
          "value": "2017-07-19T19:30:00.000Z"
        },
        "DateTime13__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime14__c": {
          "displayValue": "7/5/2017 12:30 PM",
          "value": "2017-07-05T19:30:00.000Z"
        },
        "DateTime15__c": {
          "displayValue": "7/17/2017 12:30 PM",
          "value": "2017-07-17T19:30:00.000Z"
        },
        "DateTime16__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime17__c": {
          "displayValue": "7/2/2017 12:30 PM",
          "value": "2017-07-02T19:30:00.000Z"
        },
        "DateTime18__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime19__c": {
          "displayValue": "7/4/2017 12:30 PM",
          "value": "2017-07-04T19:30:00.000Z"
        },
        "DateTime1__c": {
          "displayValue": "7/11/2017 12:30 PM",
          "value": "2017-07-11T19:30:00.000Z"
        },
        "DateTime20__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime2__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime3__c": {
          "displayValue": "7/3/2017 12:30 PM",
          "value": "2017-07-03T19:30:00.000Z"
        },
        "DateTime4__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime5__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime6__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime7__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime8__c": {
          "displayValue": null,
          "value": null
        },
        "DateTime9__c": {
          "displayValue": null,
          "value": null
        },
        "Description": {
          "displayValue": null,
          "value": "The deal is at  50% because they are at the sales process stage of evaluating our ROI justification."
        },
        "Email10__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email11__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email12__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email13__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email14__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email15__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email16__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email17__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email18__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email19__c": {
          "displayValue": null,
          "value": "foo@bar.comv"
        },
        "Email1__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email20__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email2__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email3__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email4__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email5__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email6__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email7__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email8__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "Email9__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "ForecastCategoryName": {
          "displayValue": "Pipeline",
          "value": "Pipeline"
        },
        "LastModifiedBy": {
          "displayValue": "Test User",
          "value": {
            "apiName": "User",
            "childRelationships": {},
            "fields": {
              "Id": {
                "displayValue": null,
                "value": "005xx000001T1vNAAS"
              },
              "Name": {
                "displayValue": null,
                "value": "Test User"
              }
            },
            "id": "005xx000001T1vNAAS",
            "recordTypeInfo": null
          }
        },
        "LastModifiedById": {
          "displayValue": null,
          "value": "005xx000001T1vNAAS"
        },
        "LastModifiedDate": {
          "displayValue": "7/21/2017 12:32 PM",
          "value": "2017-07-21T19:32:11.000Z"
        },
        "LeadSource": {
          "displayValue": "Trade Show",
          "value": "Trade Show"
        },
        "Name": {
          "displayValue": null,
          "value": "Acme - 1,200 Widgets"
        },
        "NextStep": {
          "displayValue": null,
          "value": "Need estimate"
        },
        "Num10__c": {
          "displayValue": null,
          "value": 876
        },
        "Num11__c": {
          "displayValue": null,
          "value": 87
        },
        "Num12__c": {
          "displayValue": null,
          "value": 65
        },
        "Num13__c": {
          "displayValue": null,
          "value": 68
        },
        "Num14__c": {
          "displayValue": null,
          "value": 876
        },
        "Num15__c": {
          "displayValue": null,
          "value": 123
        },
        "Num16__c": {
          "displayValue": null,
          "value": 765
        },
        "Num17__c": {
          "displayValue": null,
          "value": 65
        },
        "Num18__c": {
          "displayValue": null,
          "value": null
        },
        "Num19__c": {
          "displayValue": null,
          "value": null
        },
        "Num1__c": {
          "displayValue": null,
          "value": 76
        },
        "Num20__c": {
          "displayValue": null,
          "value": 5
        },
        "Num2__c": {
          "displayValue": null,
          "value": 87
        },
        "Num3__c": {
          "displayValue": null,
          "value": 876
        },
        "Num4__c": {
          "displayValue": null,
          "value": 876
        },
        "Num5__c": {
          "displayValue": null,
          "value": 5
        },
        "Num6__c": {
          "displayValue": null,
          "value": 5
        },
        "Num7__c": {
          "displayValue": null,
          "value": 7865
        },
        "Num8__c": {
          "displayValue": null,
          "value": 7865
        },
        "Num9__c": {
          "displayValue": null,
          "value": 86
        },
        "Owner": {
          "displayValue": "Test User",
          "value": {
            "apiName": "User",
            "childRelationships": {},
            "fields": {
              "Id": {
                "displayValue": null,
                "value": "005xx000001T1vNAAS"
              },
              "Name": {
                "displayValue": null,
                "value": "Test User"
              }
            },
            "id": "005xx000001T1vNAAS",
            "recordTypeInfo": null
          }
        },
        "OwnerId": {
          "displayValue": null,
          "value": "005xx000001T1vNAAS"
        },
        "Perc10__c": {
          "displayValue": null,
          "value": 4
        },
        "Perc11__c": {
          "displayValue": null,
          "value": 6
        },
        "Perc12__c": {
          "displayValue": null,
          "value": 123
        },
        "Perc13__c": {
          "displayValue": null,
          "value": 123
        },
        "Perc14__c": {
          "displayValue": null,
          "value": 5
        },
        "Perc15__c": {
          "displayValue": null,
          "value": 6
        },
        "Perc16__c": {
          "displayValue": null,
          "value": 123
        },
        "Perc17__c": {
          "displayValue": null,
          "value": 123
        },
        "Perc18__c": {
          "displayValue": null,
          "value": 5
        },
        "Perc19__c": {
          "displayValue": null,
          "value": 8
        },
        "Perc1__c": {
          "displayValue": null,
          "value": 122
        },
        "Perc20__c": {
          "displayValue": null,
          "value": 2
        },
        "Perc2__c": {
          "displayValue": null,
          "value": 2
        },
        "Perc3__c": {
          "displayValue": null,
          "value": 9
        },
        "Perc4__c": {
          "displayValue": null,
          "value": 9
        },
        "Perc5__c": {
          "displayValue": null,
          "value": 6
        },
        "Perc6__c": {
          "displayValue": null,
          "value": 7
        },
        "Perc7__c": {
          "displayValue": null,
          "value": 7
        },
        "Perc8__c": {
          "displayValue": null,
          "value": 6
        },
        "Perc9__c": {
          "displayValue": null,
          "value": 5
        },
        "Phone11__c": {
          "displayValue": null,
          "value": "65"
        },
        "Phone12__c": {
          "displayValue": null,
          "value": "87"
        },
        "Phone13__c": {
          "displayValue": null,
          "value": "876"
        },
        "Phone14__c": {
          "displayValue": null,
          "value": "587"
        },
        "Phone15__c": {
          "displayValue": null,
          "value": "5"
        },
        "Phone16__c": {
          "displayValue": null,
          "value": "876"
        },
        "Phone17__c": {
          "displayValue": null,
          "value": "65"
        },
        "Phone18__c": {
          "displayValue": null,
          "value": "8765"
        },
        "Phone19__c": {
          "displayValue": null,
          "value": "876"
        },
        "Phone20__c": {
          "displayValue": null,
          "value": "876"
        },
        "Phone2__c": {
          "displayValue": null,
          "value": "5"
        },
        "Phone3__c": {
          "displayValue": null,
          "value": "765"
        },
        "Phone4__c": {
          "displayValue": null,
          "value": "58"
        },
        "Phone5__c": {
          "displayValue": null,
          "value": "587"
        },
        "Phone6__c": {
          "displayValue": null,
          "value": "876"
        },
        "Phone7__c": {
          "displayValue": null,
          "value": "765"
        },
        "Phone8__c": {
          "displayValue": null,
          "value": "65"
        },
        "Phone9__c": {
          "displayValue": null,
          "value": "876"
        },
        "Pricebook2": {
          "displayValue": null,
          "value": null
        },
        "Pricebook2Id": {
          "displayValue": null,
          "value": null
        },
        "Probability": {
          "displayValue": null,
          "value": 50
        },
        "StageName": {
          "displayValue": "Value Proposition",
          "value": "Value Proposition"
        },
        "Text18__c": {
          "displayValue": null,
          "value": "foo"
        },
        "Text19__c": {
          "displayValue": null,
          "value": "gkj"
        },
        "Text1__c": {
          "displayValue": null,
          "value": "is"
        },
        "Text20__c": {
          "displayValue": null,
          "value": "hjg"
        },
        "Text2__c": {
          "displayValue": null,
          "value": "garbage"
        },
        "Text3__c": {
          "displayValue": null,
          "value": "stuff"
        },
        "Text4__c": {
          "displayValue": null,
          "value": "for"
        },
        "Text5__c": {
          "displayValue": null,
          "value": "recprd"
        },
        "Text8__c": {
          "displayValue": null,
          "value": "kjh"
        },
        "Text9__c": {
          "displayValue": null,
          "value": "hg"
        },
        "TextArea10__c": {
          "displayValue": null,
          "value": "kgv"
        },
        "TextArea11__c": {
          "displayValue": null,
          "value": "hg"
        },
        "TextArea12__c": {
          "displayValue": null,
          "value": "kj"
        },
        "TextArea13__c": {
          "displayValue": null,
          "value": "jkh"
        },
        "TextArea14__c": {
          "displayValue": null,
          "value": "kj"
        },
        "TextArea15__c": {
          "displayValue": null,
          "value": "gkj"
        },
        "TextArea16__c": {
          "displayValue": null,
          "value": "hg"
        },
        "TextArea17__c": {
          "displayValue": null,
          "value": "hj"
        },
        "TextArea18__c": {
          "displayValue": null,
          "value": "kjhg"
        },
        "TextArea19__c": {
          "displayValue": null,
          "value": "hg"
        },
        "TextArea1__c": {
          "displayValue": null,
          "value": "asd"
        },
        "TextArea20__c": {
          "displayValue": null,
          "value": "kj"
        },
        "TextArea2__c": {
          "displayValue": null,
          "value": "vh"
        },
        "TextArea3__c": {
          "displayValue": null,
          "value": "kjh"
        },
        "TextArea4__c": {
          "displayValue": null,
          "value": "gv"
        },
        "TextArea5__c": {
          "displayValue": null,
          "value": "hg"
        },
        "TextArea6__c": {
          "displayValue": null,
          "value": "kjh"
        },
        "TextArea7__c": {
          "displayValue": null,
          "value": "khg"
        },
        "TextArea8__c": {
          "displayValue": null,
          "value": "gkj"
        },
        "TextArea9__c": {
          "displayValue": null,
          "value": "jgv"
        },
        "Type": {
          "displayValue": "Existing Business",
          "value": "Existing Business"
        },
        "c01__c": {
          "displayValue": "$12",
          "value": 12
        },
        "c02__c": {
          "displayValue": "$123",
          "value": 123
        },
        "c03__c": {
          "displayValue": "$123",
          "value": 123
        },
        "c04__c": {
          "displayValue": "$123",
          "value": 123
        },
        "c05__c": {
          "displayValue": "7/2/2017",
          "value": "2017-07-02"
        },
        "date01__c": {
          "displayValue": "7/15/2017",
          "value": "2017-07-15"
        },
        "date02__c": {
          "displayValue": "7/3/2017",
          "value": "2017-07-03"
        },
        "date03__c": {
          "displayValue": "7/10/2017",
          "value": "2017-07-10"
        },
        "date04__c": {
          "displayValue": "7/10/2017",
          "value": "2017-07-10"
        },
        "date05__c": {
          "displayValue": "7/3/2017",
          "value": "2017-07-03"
        },
        "dt01__c": {
          "displayValue": "7/13/2017 3:17 PM",
          "value": "2017-07-13T22:17:00.000Z"
        },
        "dt02__c": {
          "displayValue": "7/4/2017 3:17 PM",
          "value": "2017-07-04T22:17:00.000Z"
        },
        "dt03__c": {
          "displayValue": "7/20/2017 3:17 PM",
          "value": "2017-07-20T22:17:00.000Z"
        },
        "dt04__c": {
          "displayValue": "6/28/2017 3:17 PM",
          "value": "2017-06-28T22:17:00.000Z"
        },
        "dt05__c": {
          "displayValue": "7/7/2017 3:17 PM",
          "value": "2017-07-07T22:17:00.000Z"
        },
        "dt06__c": {
          "displayValue": "7/22/2017 3:17 PM",
          "value": "2017-07-22T22:17:00.000Z"
        },
        "dt07__c": {
          "displayValue": "7/16/2017 3:17 PM",
          "value": "2017-07-16T22:17:00.000Z"
        },
        "dt08__c": {
          "displayValue": "7/3/2017 6:42 PM",
          "value": "2017-07-04T01:42:00.000Z"
        },
        "dt09__c": {
          "displayValue": "6/26/2017 6:42 PM",
          "value": "2017-06-27T01:42:00.000Z"
        },
        "dt10__c": {
          "displayValue": "7/10/2017 3:17 PM",
          "value": "2017-07-10T22:17:00.000Z"
        },
        "e01__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e02__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e03__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e04__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e05__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e06__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e07__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e08__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e09__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "e10__c": {
          "displayValue": null,
          "value": "foo@bar.com"
        },
        "n01__c": {
          "displayValue": null,
          "value": 123
        },
        "n02__c": {
          "displayValue": null,
          "value": 120
        },
        "n03__c": {
          "displayValue": null,
          "value": 786234876
        },
        "n04__c": {
          "displayValue": null,
          "value": 387623
        },
        "n05__c": {
          "displayValue": null,
          "value": 28765
        },
        "n06__c": {
          "displayValue": null,
          "value": 123213423
        },
        "n07__c": {
          "displayValue": null,
          "value": 23423234
        },
        "n08__c": {
          "displayValue": null,
          "value": 12457
        },
        "n09__c": {
          "displayValue": null,
          "value": 245769
        },
        "n10__c": {
          "displayValue": null,
          "value": 234275
        },
        "percent01__c": {
          "displayValue": null,
          "value": 12
        },
        "percent02__c": {
          "displayValue": null,
          "value": 345
        },
        "percent03__c": {
          "displayValue": null,
          "value": 12
        },
        "percent04__c": {
          "displayValue": null,
          "value": 345
        },
        "percent05__c": {
          "displayValue": null,
          "value": 23
        },
        "percent06__c": {
          "displayValue": null,
          "value": 123
        },
        "percent07__c": {
          "displayValue": null,
          "value": 2
        },
        "percent09__c": {
          "displayValue": null,
          "value": 123
        },
        "percent8__c": {
          "displayValue": null,
          "value": 3
        },
        "phone01__c": {
          "displayValue": null,
          "value": "34"
        },
        "phone02__c": {
          "displayValue": null,
          "value": "5"
        },
        "phone03__c": {
          "displayValue": null,
          "value": "55"
        },
        "phone04__c": {
          "displayValue": null,
          "value": "123"
        },
        "phone05__c": {
          "displayValue": null,
          "value": "35"
        },
        "phone06__c": {
          "displayValue": null,
          "value": "1234"
        },
        "phone07__c": {
          "displayValue": null,
          "value": "54"
        },
        "phone08__c": {
          "displayValue": null,
          "value": "123"
        },
        "phone09__c": {
          "displayValue": null,
          "value": "32"
        },
        "phone10__c": {
          "displayValue": null,
          "value": "s2e234"
        },
        "picklist02__c": {
          "displayValue": "t01,t02,t03,t04,t01,t02,t03,t04,t01,t02,t03,t04",
          "value": "t01,t02,t03,t04,t01,t02,t03,t04,t01,t02,t03,t04"
        },
        "picklist03__c": {
          "displayValue": "b",
          "value": "b"
        },
        "picklist04__c": {
          "displayValue": "a",
          "value": "a"
        },
        "picklist__c": {
          "displayValue": "pick01,pick02,pick03",
          "value": "pick01,pick02,pick03"
        },
        "rt01__c": {
          "displayValue": null,
          "value": "&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&quot;"
        },
        "rt02__c": {
          "displayValue": null,
          "value": "&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&quot;"
        },
        "txt01__c": {
          "displayValue": null,
          "value": "asd"
        },
        "txt02__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt03__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt04__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt05__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt06__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt07__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt08__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt09__c": {
          "displayValue": null,
          "value": "sdf"
        },
        "txt10__c": {
          "displayValue": null,
          "value": "dsfsdf"
        },
        "url01__c": {
          "displayValue": null,
          "value": "foo.com"
        },
        "url02__c": {
          "displayValue": null,
          "value": "qsd"
        }
      },
      "id": "006xx000001ZdxuAAC",
      "recordTypeInfo": null
    },
    "sections": {
      "id_01Bxx0000029W6VEAU": {
        "isCollapsed": false
      },
      "id_01Bxx0000029W7NEAU": {
        "isCollapsed": false
      }
    }
  };

  var RecordLayout =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RecordLayout, _LightningElement);

    function RecordLayout() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RecordLayout);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RecordLayout), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", mockState);

      return _this;
    }

    return RecordLayout;
  }(lwc.LightningElement);

  lwc.registerDecorators(RecordLayout, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(RecordLayout, {
    tmpl: _tmpl$4
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-record-layout', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
