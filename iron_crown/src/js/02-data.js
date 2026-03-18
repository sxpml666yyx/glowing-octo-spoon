// ===== data.js — 常量/默认数据/剧本结构 =====

// City type icons
var CITY_TYPES=[
  {id:"capital",name:"\u90FD\u57CE",size:16,shape:"circle"},
  {id:"town",name:"\u57CE\u9547",size:12,shape:"circle"},
  {id:"castle",name:"\u57CE\u5821",size:11,shape:"square"},
  {id:"village",name:"\u6751\u5E84",size:7,shape:"circle"}
];

// Default cultures
var DEF_CUL=[{id:"c_han",name:"\u6C49\u65CF",desc:"\u4E2D\u539F\u5927\u5730"},{id:"c_nomad",name:"\u6E38\u7267",desc:"\u8349\u539F\u52C7\u58EB"},{id:"c_viking",name:"\u7EF4\u4EAC",desc:"\u5317\u6D77\u6218\u58EB"},{id:"c_roman",name:"\u7F57\u9A6C",desc:"\u79E9\u5E8F\u7F14\u9020\u8005"},{id:"c_arab",name:"\u963F\u62C9\u4F2F",desc:"\u5546\u8D38\u4FE1\u4EF0"}];

// Default units
var DEF_UNIT=[
  {id:"u_mil",name:"\u6C11\u5175",cul:"\u901A\u7528",tp:"land",atk:3,def:2,cost:10,up:1,reqTech:"",spd:2},
  {id:"u_jian",name:"\u5251\u58EB",cul:"\u6C49\u65CF",tp:"land",atk:8,def:5,cost:30,up:3,reqTech:"t_iron",spd:2},
  {id:"u_qi",name:"\u94C1\u9A91",cul:"\u6E38\u7267",tp:"land",atk:12,def:6,cost:50,up:5,reqTech:"t_horse",spd:3.5},
  {id:"u_ship",name:"\u6218\u8239",cul:"\u901A\u7528",tp:"naval",atk:10,def:8,cost:80,up:6,reqTech:"t_sail",spd:3}
];

// Scenario data structure
function newScenario(name){
  // 使用第一个预设包作为默认
  var presets=LS.get("presets")||[{id:"default",techs:J(DEF_TECHS),laws:J(DEF_LAWS)}];
  var p=presets[0]||{techs:J(DEF_TECHS),laws:J(DEF_LAWS)};
  return {
    id:U(),name:name||"\u65B0\u5267\u672C",sy:1,
    map:(typeof DEFAULT_MAP!=="undefined")?DEFAULT_MAP:"",
    cultures:J(DEF_CUL),
    units:J(DEF_UNIT),
    techs:J(p.techs),
    laws:J(p.laws),
    presets:J(presets), // 存储所有预设包供势力选择
    factions:[],
    cities:[],
    characters:[],
    bandits:[]
  };
}

// Colors palette
var COLORS=["#c05040","#d07030","#d4a030","#80a040","#409060","#308080","#4070a0","#5050a0","#7050a0","#a04080","#c06080","#a08060","#607080","#505050","#b08050","#d4aa44"];
