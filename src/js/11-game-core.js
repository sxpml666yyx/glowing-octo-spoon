// ===== game-core.js — 游戏运行时核心：状态/时间/经济/HUD =====

var GAME={
  sc:null,       // 剧本数据(深拷贝)
  fid:null,      // 玩家势力ID
  fac:null,      // 玩家势力引用
  running:false,
  speed:0,       // 0=暂停,1=1x,2=2x,3=3x
  tick:0,        // 累计tick
  day:1,month:1,year:1,
  armies:[],     // [{id,fid,units:[{uid,count}],x,y,targetX,targetY,moving}]
  wars:[],       // [{a:fid,b:fid}]
  researched:{}, // {fid:{techId:true}}
  researching:{},// {fid:{techId:str,progress:num}}
  activeLaws:{}, // {fid:{catId:lawIdx}}
  map:null,      // MapCtrl
  timer:null,
  battleCooldown:{},

  // === 启动游戏 ===
  start:function(scenario,factionId){
    var self=this;
    this.sc=J(scenario);
    this.fid=factionId;
    this.fac=this.sc.factions.find(function(f){return f.id===factionId});
    if(!this.fac){notify("\u627E\u4E0D\u5230\u52BF\u529B","war");return}

    // 初始化状态
    this.day=1;this.month=1;this.year=this.sc.sy||1;
    this.speed=0;this.tick=0;this.running=true;
    this.armies=[];this.wars=[];this.battleCooldown={};
    this.researched={};this.researching={};this.activeLaws={};

    // 为每个势力初始化
    this.sc.factions.forEach(function(f){
      self.researched[f.id]={};
      self.researching[f.id]={techId:"",progress:0};
      // 应用初始科技
      if(f.initTechs&&f.initTechs.length){
        f.initTechs.forEach(function(tid){self.researched[f.id][tid]=true});
      }
      // 应用初始法律(从势力设置或默认第一个)
      self.activeLaws[f.id]={};
      var fLaws=self.getFactionLaws(f.id);
      LAW_CATS.forEach(function(cat){
        var opts=fLaws[cat.id];
        if(opts&&opts.length){
          self.activeLaws[f.id][cat.id]=(f.initLaws&&f.initLaws[cat.id]!==undefined)?f.initLaws[cat.id]:0;
        }
      });
      if(!f.gold)f.gold=1000;
    });

    // 显示游戏界面
    Q("menu").style.display="none";
    Q("editor").classList.remove("on");
    Q("game").classList.add("on");
    Modal.close();

    // 初始化地图
    if(!this.map){
      this.map=new MapCtrl("gMap","gCanvas","gImg","gMini","gMiniImg","gMiniVp");
    }
    this.map.load(this.sc.map);

    // 地图点击
    this.map.onClick=function(mx,my,e){self.onMapClick(mx,my,e)};

    // 按钮绑定
    this.bindUI();
    this.setSpeed(0);
    this.updateHUD();
    this.renderMap();
    notify("\u6E38\u620F\u5F00\u59CB\uFF01\u4F60\u626E\u6F14 "+E(this.fac.name),"ok");
  },

  bindUI:function(){
    var self=this;
    // 辅助：移除旧事件绑定
    function rebind(id,evt,fn){
      var el=Q(id);if(!el)return;
      var n=el.cloneNode(true);
      el.parentNode.replaceChild(n,el);
      n.id=id; // 确保ID不丢失
      n.addEventListener(evt,fn);
      return n;
    }

    // 速度控制
    rebind("gPause","click",function(){self.setSpeed(0)});
    rebind("gSpeed1","click",function(){self.setSpeed(1)});
    rebind("gSpeed2","click",function(){self.setSpeed(2)});
    rebind("gSpeed3","click",function(){self.setSpeed(3)});

    // 面板按钮
    var panelBinds=[
      ["gBtnTech","gPanelTech","gCloseTech"],
      ["gBtnLaw","gPanelLaw","gCloseLaw"],
      ["gBtnDiplo","gPanelDiplo","gCloseDiplo"]
    ];
    panelBinds.forEach(function(pb){
      var panel=Q(pb[1]);
      rebind(pb[0],"click",function(){
        // 关闭其他面板
        panelBinds.forEach(function(p2){if(p2[1]!==pb[1])Q(p2[1]).classList.remove("on")});
        panel.classList.toggle("on");
        if(panel.classList.contains("on"))self.renderPanel(pb[1]);
      });
      rebind(pb[2],"click",function(){panel.classList.remove("on")});
    });

    // 菜单按钮
    rebind("gMenuBtn","click",function(){self.showGameMenu()});

    // 键盘 - 先移除旧的
    if(this._keyHandler){document.removeEventListener("keydown",this._keyHandler)}
    this._keyHandler=function(e){
      if(!self.running)return;
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      if(e.key===" "){e.preventDefault();self.setSpeed(self.speed===0?1:0)}
      if(e.key==="Escape"){
        Q("gPanelTech").classList.remove("on");
        Q("gPanelLaw").classList.remove("on");
        Q("gPanelDiplo").classList.remove("on");
      }
    };
    document.addEventListener("keydown",this._keyHandler);
  },

  // === 速度控制 ===
  setSpeed:function(s){
    this.speed=s;
    var btns=Q("game").querySelectorAll(".g-speed");
    for(var i=0;i<btns.length;i++)btns[i].classList.toggle("on",i===s);

    if(this.timer){clearInterval(this.timer);this.timer=null}
    if(s>0){
      var interval=[0,500,250,120][s];
      var self=this;
      this.timer=setInterval(function(){self.gameTick()},interval);
    }
  },

  // === 每日tick ===
  gameTick:function(){
    if(!this.running)return;
    this.tick++;
    this.day++;
    if(this.day>30){this.day=1;this.month++;this.onMonthEnd()}
    if(this.month>12){this.month=1;this.year++;this.onYearEnd()}

    // 移动军队
    this.moveArmies();
    // 检查战斗
    this.checkBattles();
    // 匪寇游荡
    if(this.tick%10===0)this.wanderBandits();
    // AI每5天
    if(this.tick%5===0)this.aiTick();

    // 更新显示
    this.updateDate();
    if(this.tick%3===0)this.renderMap();
  },

  // === 月末处理 ===
  onMonthEnd:function(){
    var self=this;
    this.sc.factions.forEach(function(f){
      // 经济：税收 + 人物经济加成
      var income=0,expense=0;
      var mods=self.getFactionMods(f.id);
      self.sc.cities.forEach(function(c){
        if(c.fid===f.id){
          var charBonus=0;
          // 驻城人物的经济/工程加成
          (self.sc.characters||[]).forEach(function(ch){
            if(ch.alive!==false&&ch.bindType==="city"&&ch.bindId===c.id&&ch.sk){
              charBonus+=((ch.sk.eco||0)-50)/100; // 50为基准，超过50给正加成
              // 工程加成城防(每月微量)
              c.def=Math.max(c.def,c.def+Math.round(((ch.sk.eng||0)-50)*0.01));
            }
          });
          income+=Math.round(c.pop/100*c.eco*(1+mods.eco/100+charBonus));
        }
      });
      // 军队维护
      self.armies.forEach(function(a){
        if(a.fid===f.id){
          a.units.forEach(function(u){
            var unit=self.sc.units.find(function(x){return x.id===u.uid});
            if(unit)expense+=unit.up*u.count;
          });
        }
      });
      f.gold+=(income-expense);
      f._income=income;f._expense=expense;

      // 金币为负：军队逃散
      if(f.gold<0){
        self.armies.forEach(function(a){
          if(a.fid===f.id){
            a.units.forEach(function(u){u.count=Math.max(1,Math.floor(u.count*0.8))});
          }
        });
        if(f.id===self.fid)notify("\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u519B\u961F\u9003\u6563\u4E2D\uFF01","war");
      }

      // 科研
      var rp=self.getResearchPoints(f.id);
      var res=self.researching[f.id];
      if(res&&res.techId){
        res.progress+=rp;
        var tech=self.getFactionTechs(f.id).find(function(t){return t.id===res.techId});
        if(tech&&res.progress>=tech.cost){
          self.researched[f.id][tech.id]=true;
          res.techId="";res.progress=0;
          if(f.id===self.fid)notify("\u79D1\u6280\u300C"+tech.name+"\u300D\u7814\u7A76\u5B8C\u6210\uFF01","ok");
        }
      }

      // 人口增长
      self.sc.cities.forEach(function(c){
        if(c.fid===f.id){
          var growth=Math.max(0,Math.round(c.pop*0.002*(1+mods.pop/100)));
          c.pop+=growth;
        }
      });
    });
    this.updateHUD();
  },

  onYearEnd:function(){
    // 年度总结（简化）
  },

  // === 获取势力对应的科技/法律列表（根据预设包） ===
  getFactionTechs:function(fid){
    var fac=this.sc.factions.find(function(f){return f.id===fid});
    if(fac&&fac.presetId&&this.sc.presets){
      var preset=this.sc.presets.find(function(p){return p.id===fac.presetId});
      if(preset&&preset.techs)return preset.techs;
    }
    return this.sc.techs||[];
  },
  getFactionUnits:function(fid){
    var fac=this.sc.factions.find(function(f){return f.id===fid});
    if(fac&&fac.presetId&&this.sc.presets){
      var preset=this.sc.presets.find(function(p){return p.id===fac.presetId});
      if(preset&&preset.units)return preset.units;
    }
    return this.sc.units||[];
  },
  getFactionLaws:function(fid){
    var fac=this.sc.factions.find(function(f){return f.id===fid});
    if(fac&&fac.presetId&&this.sc.presets){
      var preset=this.sc.presets.find(function(p){return p.id===fac.presetId});
      if(preset&&preset.laws)return preset.laws;
    }
    return this.sc.laws||{};
  },

  // === 获取势力修正值 ===
  getFactionMods:function(fid){
    var mods={atk:0,def:0,eco:0,pop:0,research:0,speed:0,naval:0,siege:0};
    var self=this;
    // 科技加成 — 使用势力对应的科技列表
    var rd=this.researched[fid]||{};
    this.getFactionTechs(fid).forEach(function(tech){
      if(rd[tech.id]&&tech.fx){
        Object.keys(tech.fx).forEach(function(k){if(mods[k]!==undefined)mods[k]+=tech.fx[k]});
      }
    });
    // 法律加成 — 使用势力对应的法律列表
    var al=this.activeLaws[fid]||{};
    var fLaws=this.getFactionLaws(fid);
    LAW_CATS.forEach(function(cat){
      var idx=al[cat.id];
      if(idx!==undefined&&fLaws[cat.id]){
        var law=fLaws[cat.id][idx];
        if(law&&law.fx){
          Object.keys(law.fx).forEach(function(k){if(mods[k]!==undefined)mods[k]+=law.fx[k]});
        }
      }
    });
    return mods;
  },

  getResearchPoints:function(fid){
    var base=5;
    var mods=this.getFactionMods(fid);
    return Math.round(base*(1+mods.research/100));
  },

  // === HUD更新 ===
  updateHUD:function(){
    var f=this.fac;
    Q("gFacName").textContent=f.name;
    Q("gFacColor").style.background=f.col;
    Q("gGold").textContent=F(Math.round(f.gold));
    var netInc=(f._income||0)-(f._expense||0);
    var incEl=Q("gIncome");
    incEl.textContent=(netInc>=0?"+":"")+F(netInc);
    incEl.className=netInc>=0?"pos":"neg";

    var totalPop=0;var self=this;
    this.sc.cities.forEach(function(c){if(c.fid===self.fid)totalPop+=c.pop});
    Q("gPop").textContent=F(totalPop);

    var totalArmy=0;
    this.armies.forEach(function(a){
      if(a.fid===self.fid)a.units.forEach(function(u){totalArmy+=u.count});
    });
    Q("gArmy").textContent=F(totalArmy);

    var techCount=Object.keys(this.researched[this.fid]||{}).length;
    Q("gTech").textContent=String(techCount);
  },

  updateDate:function(){
    Q("gDate").textContent=this.year+"\u5E74"+this.month+"\u6708"+this.day+"\u65E5";
  },

  // === 游戏通知 ===
  renderGameNotify:function(msg,type){
    var el=document.createElement("div");
    el.className="nfi "+(type||"");
    el.textContent=msg;
    Q("gNf").appendChild(el);
    setTimeout(function(){if(el.parentNode)el.remove()},4000);
  },

  // === 游戏菜单 ===
  showGameMenu:function(){
    var self=this;
    var oldSpeed=this.speed;
    this.setSpeed(0);
    var h="<div style=\"text-align:center;padding:1rem\">";
    h+="<div style=\"font-size:1.2rem;font-weight:700;color:var(--bd3);margin-bottom:1rem\">\u6E38\u620F\u83DC\u5355</div>";
    h+="<button class=\"b bp\" id=\"gmResume\" style=\"width:100%;margin-bottom:.5rem\">\u7EE7\u7EED\u6E38\u620F</button>";
    h+="<button class=\"b bs\" id=\"gmSave\" style=\"width:100%;margin-bottom:.5rem\">\u4FDD\u5B58\u6E38\u620F</button>";
    h+="<button class=\"b bd\" id=\"gmQuit\" style=\"width:100%\">\u9000\u51FA\u5230\u4E3B\u83DC\u5355</button>";
    h+="</div>";
    Modal.open("\u83DC\u5355",h,"");
    Q("gmResume").addEventListener("click",function(){Modal.close();self.setSpeed(oldSpeed||1)});
    Q("gmSave").addEventListener("click",function(){self.saveGame();notify("\u6E38\u620F\u5DF2\u4FDD\u5B58","ok")});
    Q("gmQuit").addEventListener("click",function(){
      if(!confirm("\u786E\u5B9A\u9000\u51FA\uFF1F\u672A\u4FDD\u5B58\u8FDB\u5EA6\u5C06\u4E22\u5931"))return;
      self.quit();
    });
  },

  saveGame:function(){
    var save={
      sc:this.sc,fid:this.fid,day:this.day,month:this.month,year:this.year,
      armies:this.armies,wars:this.wars,researched:this.researched,
      researching:this.researching,activeLaws:this.activeLaws,tick:this.tick
    };
    LS.set("savegame_"+this.sc.id,save);
  },

  loadGame:function(saveData){
    this.sc=saveData.sc;this.fid=saveData.fid;
    this.fac=this.sc.factions.find(function(f){return f.id===saveData.fid});
    this.day=saveData.day;this.month=saveData.month;this.year=saveData.year;
    this.armies=saveData.armies||[];this.wars=saveData.wars||[];
    this.researched=saveData.researched||{};this.researching=saveData.researching||{};
    this.activeLaws=saveData.activeLaws||{};this.tick=saveData.tick||0;
    this.running=true;this.speed=0;
    Q("menu").style.display="none";Q("editor").classList.remove("on");
    Q("game").classList.add("on");Modal.close();
    if(!this.map)this.map=new MapCtrl("gMap","gCanvas","gImg","gMini","gMiniImg","gMiniVp");
    this.map.load(this.sc.map);
    this.bindUI();this.setSpeed(0);this.updateHUD();this.updateDate();this.renderMap();
  },

  quit:function(){
    this.running=false;
    if(this.timer){clearInterval(this.timer);this.timer=null}
    if(this._keyHandler){document.removeEventListener("keydown",this._keyHandler);this._keyHandler=null}
    Q("game").classList.remove("on");
    Q("menu").style.display="";
    Modal.close();
  },
