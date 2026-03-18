  // ===== game-map.js — 游戏地图渲染/军队显示/城池交互 =====

  renderMap:function(){
    var sc=this.sc;var cvs=this.map.cvs;var self=this;
    var old=cvs.querySelectorAll(".city-mk,.army-mk,.bandit-gm");
    for(var i=0;i<old.length;i++)old[i].remove();

    // 城池 — 色块
    sc.cities.forEach(function(c){
      var ct=CITY_TYPES.find(function(t){return t.id===c.type})||CITY_TYPES[0];
      var fac=sc.factions.find(function(f){return f.id===c.fid});
      var col=fac?fac.col:"#888";
      var sz=ct.size||10;
      var el=document.createElement("div");
      el.className="city-mk";
      el.style.cssText="left:"+c.x+"px;top:"+c.y+"px";
      var dot=document.createElement("div");
      dot.className="city-dot "+(ct.shape||"circle");
      dot.style.cssText="width:"+sz+"px;height:"+sz+"px;background:"+col;
      el.appendChild(dot);
      var lbl=document.createElement("div");lbl.className="city-lbl";
      lbl.textContent=(c.port?"\u2693":"")+c.name;
      el.appendChild(lbl);
      el.addEventListener("mousedown",function(e){e.stopPropagation();self.map.entityClicked=true;self.onCityClick(c)});
      cvs.appendChild(el);
    });

    // 海权点
    // 军队(显示兵种名称)
    this.armies.forEach(function(a){
      var total=0;a.units.forEach(function(u){total+=u.count});
      if(total<=0)return;
      var fac=sc.factions.find(function(f){return f.id===a.fid});
      var col=fac?fac.col:"#888";
      // 生成兵种标签文字
      var unitLabels=a.units.map(function(au){
        var unit=sc.units.find(function(x){return x.id===au.uid});
        return(unit?unit.name:"")+au.count;
      }).join(" ");
      var el=document.createElement("div");
      el.className="army-mk"+(self._selArmy===a.id?" sel":"");
      el.style.cssText="left:"+a.x+"px;top:"+a.y+"px;border-color:"+col;
      el.innerHTML="<span class=\"army-ico\">\u2694</span><span class=\"army-cnt\">"+F(total)+"</span>";
      // 兵种名称标签
      var lbl=document.createElement("div");
      lbl.style.cssText="position:absolute;top:100%;left:50%;transform:translateX(-50%);font-size:.5rem;white-space:nowrap;color:var(--tx2);text-shadow:0 0 2px #fff,0 0 2px #fff;pointer-events:none;max-width:80px;overflow:hidden;text-overflow:ellipsis";
      lbl.textContent=unitLabels;
      el.appendChild(lbl);
      el.addEventListener("mousedown",function(e){e.stopPropagation();self.map.entityClicked=true;self.onArmyClick(a)});
      cvs.appendChild(el);
    });

    // 匪寇
    sc.bandits.forEach(function(b){
      if(b.n<=0)return;
      var el=document.createElement("div");
      el.className="bandit-gm";
      el.style.cssText="left:"+b.x+"px;top:"+b.y+"px";
      el.textContent="\uD83D\uDC80";
      el.title=b.name+" \u5175\u529B"+b.n;
      cvs.appendChild(el);
    });
  },

  getPoint:function(ref){
    if(ref.type==="city"){var c=this.sc.cities.find(function(x){return x.id===ref.id});return c?{x:c.x,y:c.y}:null}
    return null;
  },

  _selArmy:null,

  // === 地图点击(移动选中军队) ===
  onMapClick:function(mx,my,e){
    var self=this;
    if(this._selArmy){
      var army=this.armies.find(function(a){return a.id===self._selArmy});
      if(army&&army.fid===this.fid){
        army.targetX=mx;army.targetY=my;army.moving=true;
        notify("\u519B\u961F\u51FA\u53D1","info");
      }
      this._selArmy=null;
      this.renderMap();
    }
  },

  // === 城池点击 ===
  onCityClick:function(city){
    var self=this;var sc=this.sc;
    var isOwn=city.fid===this.fid;
    var isEnemy=city.fid&&city.fid!==this.fid;
    var fac=sc.factions.find(function(f){return f.id===city.fid});
    var facName=fac?fac.name:"\u65E0\u4E3B";
    var ct=CITY_TYPES.find(function(t){return t.id===city.type})||CITY_TYPES[0];

    // 如果有选中军队且点击敌方城池 → 自动攻击
    if(this._selArmy&&isEnemy){
      var army=this.armies.find(function(a){return a.id===self._selArmy});
      if(army&&army.fid===this.fid){
        army.targetX=city.x;army.targetY=city.y;army.moving=true;
        notify("\u519B\u961F\u8FDB\u653B "+city.name,"war");
      }
      this._selArmy=null;
      this.renderMap();
      return;
    }

    var h="<div style=\"display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem\"><span style=\"font-size:1.2rem\">"+E(ct.name)+"</span><div><div style=\"font-weight:700;font-size:.95rem\">"+(city.port?"\u2693":"")+E(city.name)+"</div><div style=\"font-size:.75rem;color:var(--tx3)\">"+E(facName)+"</div></div></div>";
    h+="<div class=\"frr\" style=\"margin-bottom:.5rem\">";
    h+="<div style=\"font-size:.8rem\">\u4EBA\u53E3: <b>"+F(city.pop)+"</b></div>";
    h+="<div style=\"font-size:.8rem\">\u7ECF\u6D4E: <b>"+city.eco+"</b></div>";
    h+="<div style=\"font-size:.8rem\">\u9632\u5FA1: <b>"+city.def+"</b></div>";
    h+="<div style=\"font-size:.8rem\">\u9A7B\u519B: <b>"+(city.gar||0)+"</b></div>";
    h+="</div>";

    var footer="";
    if(isOwn){
      footer="<button class=\"b bp\" id=\"gcRecruit\">\u62DB\u52DF\u519B\u961F</button>";
    }
    footer+="<button class=\"b bs\" onclick=\"Modal.close()\">\u5173\u95ED</button>";

    Modal.open(""+E(city.name),h,footer);

    if(isOwn&&Q("gcRecruit")){
      Q("gcRecruit").addEventListener("click",function(){
        Modal.close();
        self.showRecruitPanel(city);
      });
    }
  },

  // === 招募面板 ===
  showRecruitPanel:function(city){
    var self=this;var sc=this.sc;
    var facCul=this.fac.cul;
    var cityCul=city.cul;
    // 可招募兵种：文化匹配 + 科技解锁 + 海军需要港口
    var available=sc.units.filter(function(u){
      // 海军只能在港口城市建造
      if(u.tp==="naval"&&!city.port)return false;
      // 文化限制
      if(u.cul!=="\u901A\u7528"){
        var culMatch=false;
        if(facCul){var fc=sc.cultures.find(function(x){return x.id===facCul});if(fc&&fc.name===u.cul)culMatch=true}
        if(cityCul){var cc=sc.cultures.find(function(x){return x.id===cityCul});if(cc&&cc.name===u.cul)culMatch=true}
        if(!culMatch)return false;
      }
      // 科技限制
      if(u.reqTech&&!self.researched[self.fid][u.reqTech])return false;
      return true;
    });

    var portNote=city.port?"":"\uFF08\u975E\u6E2F\u53E3\uFF0C\u65E0\u6CD5\u5EFA\u9020\u6D77\u519B\uFF09";
    var h="<div style=\"font-size:.8rem;color:var(--tx3);margin-bottom:.6rem\">\u5728 "+E(city.name)+" \u62DB\u52DF\u519B\u961F"+portNote+"\uFF08\u91D1\u5E01: "+F(Math.round(self.fac.gold))+"\uFF09</div>";
    available.forEach(function(u,i){
      h+="<div class=\"li\" data-uid=\""+u.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(u.name)+" <span class=\"tg tg-blue\">"+({land:"\u9646",naval:"\u6D77",air:"\u7A7A"}[u.tp]||u.tp)+"</span></div><div class=\"li-d\">\u653B"+u.atk+" \u9632"+u.def+" | \u8D39\u7528"+u.cost+" \u7EF4\u62A4"+u.up+"</div></div><div class=\"li-a\"><input type=\"number\" min=\"0\" max=\"999\" value=\"0\" style=\"width:60px\" class=\"fi bsm\" id=\"rc_"+i+"\"><button class=\"b bsm bp rc-btn\" data-i=\""+i+"\" data-uid=\""+u.id+"\">\u62DB</button></div></div>";
    });
    if(!available.length)h+="<div class=\"empty\">\u6CA1\u6709\u53EF\u62DB\u52DF\u5175\u79CD</div>";
    // 指派将领
    var freeChars=(sc.characters||[]).filter(function(ch){return ch.alive!==false&&ch.fid===self.fid&&ch.bindType!==""&&ch.bindType!=="army"||!ch.bindType});
    if(freeChars.length){
      h+="<div class=\"fr\" style=\"margin-top:.5rem\"><label class=\"fl\">\u6307\u6D3E\u5C06\u9886(\u53EF\u9009)</label><select class=\"fsel\" id=\"rc_cmd\"><option value=\"\">\u65E0</option>";
      freeChars.forEach(function(ch){h+="<option value=\""+ch.id+"\">"+E(ch.name)+" \u7EDF"+((ch.sk&&ch.sk.cmd)||50)+"</option>"});
      h+="</select></div>";
    }
    Modal.open("\u62DB\u52DF\u519B\u961F",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u5173\u95ED</button>");

    // 绑定招募按钮
    var rcBtns=Q("mob").querySelectorAll(".rc-btn");
    for(var i=0;i<rcBtns.length;i++){
      rcBtns[i].addEventListener("click",function(){
        var idx=parseInt(this.dataset.i);
        var uid=this.dataset.uid;
        var count=parseInt(Q("rc_"+idx).value)||0;
        if(count<=0)return;
        var unit=sc.units.find(function(x){return x.id===uid});
        if(!unit)return;
        var totalCost=unit.cost*count;
        if(self.fac.gold<totalCost){
          notify("\u91D1\u5E01\u4E0D\u8DB3\uFF01\u9700\u8981"+F(totalCost)+"\uFF0C\u5F53\u524D"+F(Math.round(self.fac.gold)),"war");
          return;
        }
        self.fac.gold-=totalCost;
        // 查找城池现有军队或创建新军队
        var army=self.armies.find(function(a){return a.fid===self.fid&&Math.hypot(a.x-city.x,a.y-city.y)<20&&!a.moving});
        if(!army){
          army={id:U(),fid:self.fid,units:[],x:city.x,y:city.y+20,targetX:0,targetY:0,moving:false};
          self.armies.push(army);
        }
        var eu=army.units.find(function(x){return x.uid===uid});
        if(eu){eu.count+=count}else{army.units.push({uid:uid,count:count})}
        // 绑定将领
        var cmdSel=Q("rc_cmd");
        if(cmdSel&&cmdSel.value){
          var ch=(sc.characters||[]).find(function(x){return x.id===cmdSel.value});
          if(ch){ch.bindType="army";ch.bindId=army.id}
        }
        notify("\u62DB\u52DF "+count+" "+unit.name,"ok");
        self.updateHUD();
        self.renderMap();
        Modal.close();
      });
    }
  },

  // === 军队点击 ===
  onArmyClick:function(army){
    var self=this;
    if(army.fid===this.fid){
      this._selArmy=army.id;
      this.renderMap();
      notify("\u5DF2\u9009\u4E2D\u519B\u961F\uFF0C\u70B9\u5730\u56FE\u79FB\u52A8\uFF0C\u70B9\u6572\u519B/\u6572\u57CE\u8FDB\u653B","info");
    }else{
      if(this._selArmy){
        var myArmy=this.armies.find(function(a){return a.id===self._selArmy});
        if(myArmy&&myArmy.fid===this.fid){
          myArmy.targetX=army.x;myArmy.targetY=army.y;myArmy.moving=true;
          notify("\u519B\u961F\u8FDB\u653B\u6572\u519B","war");
        }
        this._selArmy=null;this.renderMap();
      }else{
        var total=0;army.units.forEach(function(u){total+=u.count});
        var fac=this.sc.factions.find(function(f){return f.id===army.fid});
        notify((fac?fac.name:"\u672A\u77E5")+"\u519B\u961F: "+F(total)+"\u5175","info");
      }
    }
  },
