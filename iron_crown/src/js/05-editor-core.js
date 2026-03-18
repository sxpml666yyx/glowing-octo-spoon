// ===== editor-core.js — 编辑器核心：初始化/工具/地图点击/碰撞检测 =====

var ED={
  sc:null, // current scenario
  map:null, // MapCtrl instance
  tool:"select", // current tool: select, city, seapoint, searoute, bandit, delete
  selected:null, // {type:"city"|"sea"|"bandit", id:string}
  sideTab:"factions",

  init:function(){
    var self=this;
    this.map=new MapCtrl("edMap","edCanvas","edImg","edMini","edMiniImg","edMiniVp");

    // Tools
    var tools=[
      {id:"select",ico:"\u{1F5B1}",label:"\u9009\u62E9"},
      {id:"city",ico:"\uD83C\uDFDB",label:"\u57CE\u6C60"},
      {id:"bandit",ico:"\uD83D\uDC80",label:"\u5320\u5BC7"},
      {id:"delete",ico:"\u274C",label:"\u5220\u9664"}
    ];
    var tbEl=Q("edToolbar");
    tools.forEach(function(t){
      var btn=document.createElement("button");
      btn.className="ed-tool"+(t.id===self.tool?" on":"");
      btn.dataset.tool=t.id;
      btn.innerHTML="<span>"+t.ico+"</span>"+t.label;
      btn.addEventListener("click",function(){self.setTool(t.id)});
      tbEl.appendChild(btn);
    });

    // Side tabs
    var sideTabs=[
      {id:"factions",label:"\u52BF\u529B"},
      {id:"cities",label:"\u57CE\u6C60"},
      {id:"bandits",label:"\u5320\u5BC7"},
      {id:"chars",label:"\u4EBA\u7269"},
      {id:"cultures",label:"\u6587\u5316"},
      {id:"system",label:"\u4F53\u7CFB"},
      {id:"settings",label:"\u8BBE\u7F6E"}
    ];
    var stEl=Q("edSideTabs");
    sideTabs.forEach(function(t){
      var btn=document.createElement("button");
      btn.className="ed-side-tab"+(t.id===self.sideTab?" on":"");
      btn.textContent=t.label;
      btn.addEventListener("click",function(){self.setSideTab(t.id)});
      stEl.appendChild(btn);
    });

    // Map click handler
    this.map.onClick=function(mx,my,e){self.onMapClick(mx,my,e)};
    this.map.onContext=function(mx,my,sx,sy){self.onMapContext(mx,my,sx,sy)};

    // Top buttons
    Q("edBack").addEventListener("click",function(){self.close()});
    Q("edSave").addEventListener("click",function(){self.saveScenario()});
    Q("edPlay").addEventListener("click",function(){
      self.saveScenario();
      if(!self.sc.factions.length){notify("\u8BF7\u5148\u6DFB\u52A0\u52BF\u529B","war");return}
      MENU.factionSelect(J(self.sc));
    });

    // Keyboard
    document.addEventListener("keydown",function(e){
      if(!Q("editor").classList.contains("on"))return;
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT")return;
      if(e.key==="Escape"){
        if(Q("ov").classList.contains("on"))Modal.close();
        else if(self.selected){self.selected=null;self.render()}
        else self.close();
      }
      if(e.key==="1")self.setTool("select");
      if(e.key==="2")self.setTool("city");
      if(e.key==="3")self.setTool("bandit");
      if(e.key==="4")self.setTool("delete");
      if(e.key==="Delete"||e.key==="Backspace"){
        if(self.selected&&e.target.tagName!=="INPUT"){self.deleteSelected();e.preventDefault()}
      }
    });
  },

  open:function(scenario){
    this.sc=scenario;
    Q("edTitle").textContent="\u5267\u672C: "+E(scenario.name);
    Q("editor").classList.add("on");
    Q("menu").style.display="none";
    if(scenario.map){
      this.map.load(scenario.map);
    }else if(typeof DEFAULT_MAP!=="undefined"){
      scenario.map=DEFAULT_MAP;
      this.map.load(scenario.map);
    }else{
      // Fallback: simple blue canvas
      var c=document.createElement("canvas");c.width=1200;c.height=600;
      var ctx=c.getContext("2d");
      ctx.fillStyle="#6aaed6";ctx.fillRect(0,0,1200,600);
      scenario.map=c.toDataURL("image/jpeg",.7);
      this.map.load(scenario.map);
    }
    this.selected=null;
    this.tool="select";
    this.setTool("select");
    this.setSideTab("factions");
    this.render();
    this.updateStatus("");
  },

  close:function(){
    Q("editor").classList.remove("on");
    Q("menu").style.display="";
  },

  setTool:function(t){
    this.tool=t;
    var btns=Q("edToolbar").querySelectorAll(".ed-tool");
    for(var i=0;i<btns.length;i++)btns[i].classList.toggle("on",btns[i].dataset.tool===t);
    var hints={select:"\u62D6\u52A8\u5E73\u79FB\u5730\u56FE | \u70B9\u51FB\u9009\u4E2D\u5B9E\u4F53 | \u6EDA\u8F6E\u7F29\u653E",city:"\u70B9\u51FB\u5730\u56FE\u653E\u7F6E\u57CE\u6C60",bandit:"\u70B9\u51FB\u5730\u56FE\u653E\u7F6E\u5320\u5BC7",delete:"\u70B9\u51FB\u5B9E\u4F53\u5220\u9664"};
    this.updateStatus(hints[t]||"");
  },

  setSideTab:function(t){
    this.sideTab=t;
    var tabs=Q("edSideTabs").querySelectorAll(".ed-side-tab");
    for(var i=0;i<tabs.length;i++)tabs[i].classList.toggle("on",tabs[i].textContent===({factions:"\u52BF\u529B",cities:"\u57CE\u6C60",bandits:"\u5320\u5BC7",chars:"\u4EBA\u7269",cultures:"\u6587\u5316",system:"\u4F53\u7CFB",settings:"\u8BBE\u7F6E"}[t]));
    this.renderSide();
  },

  updateStatus:function(msg){Q("edStatus").textContent=msg||"\u5C31\u7EEA"},

  // ===== MAP CLICK =====
  onMapClick:function(mx,my,e){
    var sc=this.sc;

    if(this.tool==="city"){
      this.showCityTypePopup(mx,my);
    }else if(this.tool==="bandit"){
      var bn={id:U(),name:"\u5320\u5BC7\u636E\u70B9"+(sc.bandits.length+1),x:mx,y:my,n:R(30,300),atk:R(3,8),def:R(2,6),cul:"",fid:""};
      sc.bandits.push(bn);
      notify("\u5320\u5BC7\u636E\u70B9\u5DF2\u653E\u7F6E","ok");
      this.autoSave();this.render();
    }else if(this.tool==="select"){
      var ht=this.hitTest(mx,my);
      if(ht){
        this.selected=ht;
        this.render();
        this.showEntityEditor(ht);
      }else{
        this.selected=null;
        this.render();
      }
    }else if(this.tool==="delete"){
      var ht2=this.hitTest(mx,my);
      if(ht2)this.deleteEntity(ht2);
    }
  },

  onMapContext:function(mx,my,sx,sy){
    // Right-click: always pan mode, no menu needed since we have toolbar
  },

  hitTest:function(mx,my){
    var sc=this.sc;var best=null;var bestDist=30;
    sc.cities.forEach(function(c){var d=Math.hypot(c.x-mx,c.y-my);if(d<bestDist){bestDist=d;best={type:"city",id:c.id}}});
    sc.bandits.forEach(function(b){var d=Math.hypot(b.x-mx,b.y-my);if(d<bestDist){bestDist=d;best={type:"bandit",id:b.id}}});
    return best;
  },

  deleteSelected:function(){
    if(this.selected)this.deleteEntity(this.selected);
  },

  deleteEntity:function(ent){
    var sc=this.sc;
    if(ent.type==="city"){sc.cities=sc.cities.filter(function(c){return c.id!==ent.id})}
    else if(ent.type==="bandit"){sc.bandits=sc.bandits.filter(function(b){return b.id!==ent.id})}
    this.selected=null;
    notify("\u5DF2\u5220\u9664","war");this.autoSave();
    this.render();this.renderSide();
  },

  getPoint:function(ref){
    if(ref.type==="city"){var c=this.sc.cities.find(function(x){return x.id===ref.id});return c?{x:c.x,y:c.y}:null}
    return null;
  },
