// ===== 02b-data-tech.js — 科技树+法律系统(含科技绑定) =====

var TECH_ERAS=[
  {id:"ancient",name:"\u8FDC\u53E4",order:0},{id:"classical",name:"\u53E4\u5178",order:1},
  {id:"medieval",name:"\u4E2D\u4E16\u7EAA",order:2},{id:"gunpowder",name:"\u706B\u836F",order:3},
  {id:"industrial",name:"\u5DE5\u4E1A",order:4},{id:"modern",name:"\u73B0\u4EE3",order:5}
];
var DEF_TECHS=[
  // 远古
  {id:"t_agri",name:"\u519C\u4E1A",era:"ancient",cost:100,req:[],fx:{pop:10},desc:"\u4EBA\u53E3+10%"},
  {id:"t_bronze",name:"\u9752\u94DC",era:"ancient",cost:120,req:[],fx:{atk:5},desc:"\u653B\u51FB+5%"},
  {id:"t_writing",name:"\u6587\u5B57",era:"ancient",cost:150,req:[],fx:{research:10},desc:"\u79D1\u7814+10%"},
  {id:"t_wheel",name:"\u8F6E\u5B50",era:"ancient",cost:100,req:[],fx:{eco:5},desc:"\u7ECF\u6D4E+5%"},
  {id:"t_stone",name:"\u77F3\u5DE5",era:"ancient",cost:80,req:[],fx:{def:5},desc:"\u9632\u5FA1+5%"},
  // 古典
  {id:"t_iron",name:"\u94C1\u5668",era:"classical",cost:200,req:["t_bronze"],fx:{atk:8},desc:"\u653B\u51FB+8%"},
  {id:"t_math",name:"\u6570\u5B66",era:"classical",cost:250,req:["t_writing"],fx:{research:15},desc:"\u79D1\u7814+15%"},
  {id:"t_trade",name:"\u8D38\u6613",era:"classical",cost:180,req:["t_wheel"],fx:{eco:10},desc:"\u7ECF\u6D4E+10%"},
  {id:"t_horse",name:"\u9A91\u672F",era:"classical",cost:220,req:["t_agri"],fx:{atk:5,speed:20},desc:"\u79FB\u901F+20%"},
  {id:"t_fort",name:"\u7B51\u57CE",era:"classical",cost:200,req:["t_stone"],fx:{def:12},desc:"\u9632\u5FA1+12%"},
  // 中世纪
  {id:"t_steel",name:"\u7EFC\u94A2",era:"medieval",cost:350,req:["t_iron"],fx:{atk:10,def:5},desc:"\u653B+10%\u9632+5%"},
  {id:"t_sail",name:"\u5E06\u8239",era:"medieval",cost:300,req:["t_trade"],fx:{naval:20},desc:"\u89E3\u9501\u6218\u8239"},
  {id:"t_castle",name:"\u57CE\u5821",era:"medieval",cost:400,req:["t_fort"],fx:{def:20},desc:"\u9632\u5FA1+20%"},
  {id:"t_feudal",name:"\u5C01\u5EFA",era:"medieval",cost:280,req:["t_math"],fx:{eco:8,pop:5},desc:"\u7ECF\u6D4E+8%"},
  {id:"t_guild",name:"\u884C\u4F1A",era:"medieval",cost:320,req:["t_trade"],fx:{eco:15},desc:"\u7ECF\u6D4E+15%"},
  // 火药
  {id:"t_gunpowder",name:"\u706B\u836F",era:"gunpowder",cost:500,req:["t_steel"],fx:{atk:15},desc:"\u653B\u51FB+15%"},
  {id:"t_cannon",name:"\u706B\u70AE",era:"gunpowder",cost:600,req:["t_gunpowder"],fx:{siege:30},desc:"\u653B\u57CE+30%"},
  {id:"t_galleon",name:"\u5927\u5E06\u8239",era:"gunpowder",cost:550,req:["t_sail"],fx:{naval:25},desc:"\u6D77\u519B+25%"},
  {id:"t_print",name:"\u5370\u5237",era:"gunpowder",cost:450,req:["t_feudal"],fx:{research:20,pop:5},desc:"\u79D1\u7814+20%"},
  {id:"t_bank",name:"\u94F6\u884C",era:"gunpowder",cost:500,req:["t_guild"],fx:{eco:20},desc:"\u7ECF\u6D4E+20%"},
  // 工业
  {id:"t_steam",name:"\u84B8\u6C7D\u673A",era:"industrial",cost:800,req:["t_cannon"],fx:{eco:20,atk:10},desc:"\u7ECF\u6D4E+20%"},
  {id:"t_rifle",name:"\u6B65\u67AA",era:"industrial",cost:700,req:["t_gunpowder"],fx:{atk:20},desc:"\u653B\u51FB+20%"},
  {id:"t_rail",name:"\u94C1\u8DEF",era:"industrial",cost:900,req:["t_steam"],fx:{speed:30,eco:15},desc:"\u79FB\u901F+30%"},
  {id:"t_ironclad",name:"\u94C1\u7532\u8230",era:"industrial",cost:850,req:["t_galleon","t_steam"],fx:{naval:30},desc:"\u6D77\u519B+30%"},
  {id:"t_telegraph",name:"\u7535\u62A5",era:"industrial",cost:600,req:["t_print"],fx:{research:25},desc:"\u79D1\u7814+25%"},
  // 现代
  {id:"t_tank",name:"\u5766\u514B",era:"modern",cost:1200,req:["t_rifle","t_steam"],fx:{atk:25},desc:"\u653B\u51FB+25%"},
  {id:"t_plane",name:"\u98DE\u673A",era:"modern",cost:1500,req:["t_telegraph"],fx:{atk:20,speed:40},desc:"\u89E3\u9501\u7A7A\u519B"},
  {id:"t_nuke",name:"\u6838\u6B66\u5668",era:"modern",cost:3000,req:["t_tank","t_plane"],fx:{atk:50},desc:"\u7EC8\u6781\u5A01\u6155"},
  {id:"t_computer",name:"\u8BA1\u7B97\u673A",era:"modern",cost:1800,req:["t_telegraph"],fx:{research:40,eco:20},desc:"\u79D1\u7814+40%"},
  {id:"t_missile",name:"\u5BFC\u5F39",era:"modern",cost:2000,req:["t_nuke"],fx:{atk:35,naval:20},desc:"\u653B\u51FB+35%"}
];

// === 法律系统 — reqTech绑定科技，没有对应科技不能选 ===
var LAW_CATS=[
  {id:"gov",name:"\u653F\u4F53",ico:"\uD83C\uDFDB"},{id:"economy",name:"\u7ECF\u6D4E",ico:"\uD83D\uDCB0"},
  {id:"military",name:"\u5175\u5F79",ico:"\u2694"},{id:"tax",name:"\u7A0E\u6536",ico:"\uD83D\uDCCA"},
  {id:"religion",name:"\u5B97\u6559",ico:"\u26EA"},{id:"civil",name:"\u516C\u6C11\u6743",ico:"\uD83D\uDC64"},
  {id:"trade_law",name:"\u8D38\u6613",ico:"\u26F5"},{id:"edu",name:"\u6559\u80B2",ico:"\uD83D\uDCDA"}
];

var DEF_LAWS={
  gov:[
    {id:"l_tribe",name:"\u90E8\u843D\u5236",fx:{pop:5,eco:-5},desc:"\u539F\u59CB\u90E8\u843D",reqTech:""},
    {id:"l_monarchy",name:"\u541B\u4E3B\u5236",fx:{def:10,eco:5},desc:"\u738B\u6743\u7EDF\u6CBB",reqTech:"t_writing"},
    {id:"l_republic",name:"\u5171\u548C\u5236",fx:{eco:10,research:10},desc:"\u6C11\u4E3B\u6CBB\u7406",reqTech:"t_print"},
    {id:"l_theocracy",name:"\u795E\u6743\u5236",fx:{def:5,pop:10},desc:"\u5B97\u6559\u7EDF\u6CBB",reqTech:"t_writing"}
  ],
  economy:[
    {id:"l_subsist",name:"\u81EA\u7ED9\u81EA\u8DB3",fx:{},desc:"\u57FA\u7840\u751F\u4EA7",reqTech:""},
    {id:"l_agrar",name:"\u519C\u4E1A\u7ECF\u6D4E",fx:{pop:10,eco:5},desc:"\u4EE5\u519C\u4E3A\u672C",reqTech:"t_agri"},
    {id:"l_merch",name:"\u5546\u4E1A\u7ECF\u6D4E",fx:{eco:20},desc:"\u5546\u8D38\u7E41\u8363",reqTech:"t_trade"},
    {id:"l_indus",name:"\u5DE5\u4E1A\u7ECF\u6D4E",fx:{eco:30,pop:-5},desc:"\u5DE5\u4E1A\u5316",reqTech:"t_steam"}
  ],
  military:[
    {id:"l_levy",name:"\u5F81\u53EC\u5175",fx:{},desc:"\u4E34\u65F6\u5F81\u53EC",reqTech:""},
    {id:"l_profes",name:"\u804C\u4E1A\u519B",fx:{atk:15,def:10,eco:-5},desc:"\u4E13\u4E1A\u58EB\u5175",reqTech:"t_iron"},
    {id:"l_conscrip",name:"\u4E49\u52A1\u5175\u5F79",fx:{atk:10,pop:-5},desc:"\u5168\u6C11\u7686\u5175",reqTech:"t_gunpowder"},
    {id:"l_massarmy",name:"\u5927\u89C4\u6A21\u519B\u961F",fx:{atk:20,eco:-10},desc:"\u4EBA\u6D77\u6218\u672F",reqTech:"t_rifle"}
  ],
  tax:[
    {id:"l_notax",name:"\u514D\u7A0E",fx:{eco:-20,pop:15},desc:"\u65E0\u7A0E\u6536",reqTech:""},
    {id:"l_lowtax",name:"\u8F7B\u7A0E",fx:{eco:0,pop:5},desc:"\u4F4E\u7A0E\u7387",reqTech:""},
    {id:"l_medtax",name:"\u4E2D\u7A0E",fx:{eco:10},desc:"\u9002\u4E2D\u7A0E\u7387",reqTech:"t_math"},
    {id:"l_hightax",name:"\u91CD\u7A0E",fx:{eco:25,pop:-10},desc:"\u9AD8\u7A0E\u7387",reqTech:"t_bank"}
  ],
  religion:[
    {id:"l_freedom",name:"\u4FE1\u4EF0\u81EA\u7531",fx:{pop:5,research:5},desc:"\u5404\u6559\u5E76\u5B58",reqTech:""},
    {id:"l_state_rel",name:"\u56FD\u6559",fx:{def:10,pop:-5},desc:"\u56FD\u5BB6\u5B97\u6559",reqTech:"t_writing"},
    {id:"l_secular",name:"\u4E16\u4FD7\u5316",fx:{research:15},desc:"\u653F\u6559\u5206\u79BB",reqTech:"t_print"}
  ],
  civil:[
    {id:"l_serfdom",name:"\u519C\u5974\u5236",fx:{eco:5,pop:-10},desc:"\u675F\u7F1A\u4EBA\u6C11",reqTech:""},
    {id:"l_citizen",name:"\u516C\u6C11\u6743",fx:{pop:10,eco:5},desc:"\u57FA\u672C\u6743\u5229",reqTech:"t_feudal"},
    {id:"l_equal",name:"\u5E73\u7B49\u6743",fx:{pop:15,research:10},desc:"\u4EBA\u4EBA\u5E73\u7B49",reqTech:"t_print"}
  ],
  trade_law:[
    {id:"l_isolate",name:"\u95ED\u5173",fx:{def:5,eco:-10},desc:"\u95ED\u5173\u9501\u56FD",reqTech:""},
    {id:"l_protect",name:"\u4FDD\u62A4",fx:{eco:5},desc:"\u4FDD\u62A4\u5173\u7A0E",reqTech:"t_trade"},
    {id:"l_free_trade",name:"\u81EA\u7531\u8D38\u6613",fx:{eco:20,def:-5},desc:"\u5F00\u653E\u5E02\u573A",reqTech:"t_bank"}
  ],
  edu:[
    {id:"l_noedu",name:"\u65E0\u6559\u80B2",fx:{},desc:"\u65E0\u516C\u5171\u6559\u80B2",reqTech:""},
    {id:"l_basic",name:"\u57FA\u7840\u6559\u80B2",fx:{research:10,eco:-5},desc:"\u79C1\u587E\u5B66\u5802",reqTech:"t_writing"},
    {id:"l_public",name:"\u516C\u5171\u6559\u80B2",fx:{research:25,eco:-10},desc:"\u5168\u6C11\u6559\u80B2",reqTech:"t_print"}
  ]
};
