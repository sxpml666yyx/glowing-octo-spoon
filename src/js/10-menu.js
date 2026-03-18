// ===== menu.js — 主菜单与启动 =====

var MENU={
  init:function(){
    var btns=[
      ["\uD83D\uDCDC","\u521B\u4F5C\u5267\u672C","\u81EA\u7531\u6253\u9020\u4F60\u7684\u5386\u53F2\u4E16\u754C",function(){MENU.scenarioList("edit")}],
      ["\u2694","\u5F00\u59CB\u6E38\u620F","\u9009\u62E9\u5267\u672C\u8E0F\u4E0A\u5F81\u9014",function(){MENU.scenarioList("play")}],
      ["\uD83D\uDCBE","\u5B58\u6863\u7BA1\u7406","\u8BFB\u53D6\u4E0E\u7BA1\u7406\u8FDB\u5EA6",function(){MENU.saveManager()}],
      ["\uD83C\uDF0D","\u4E16\u754C\u4F53\u7CFB\u7F16\u8F91","\u521B\u5EFA\u591A\u5957\u79D1\u6280\u6811+\u6CD5\u5F8B\u9884\u8BBE\u5305",function(){MENU.presetManager()}]
    ];
    var el=Q("menuBtns");
    btns.forEach(function(b){
      var btn=document.createElement("button");
      btn.className="m-btn";
      btn.innerHTML="<i>"+b[0]+"</i><em>"+b[1]+"<small>"+b[2]+"</small></em>";
      btn.addEventListener("click",b[3]);
      el.appendChild(btn);
    });
  },

  scenarioList:function(mode){
    var scs=LS.get("scenarios")||[];
    var h="<div class=\"sb\"><input class=\"fi\" placeholder=\"\u641C\u7D22...\" oninput=\"UI.fl(this,'scl')\"><button class=\"b bp\" id=\"newScBtn\">\u65B0\u5EFA\u5267\u672C</button></div><div id=\"scl\">";
    scs.forEach(function(s,i){
      h+="<div class=\"li\" data-s=\""+E(s.name)+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(s.name)+"</div><div class=\"li-d\">"+(s.factions?s.factions.length:0)+"\u52BF\u529B "+(s.cities?s.cities.length:0)+"\u57CE\u6C60</div></div><div class=\"li-a\">";
      if(mode==="play"){
        h+="<button class=\"b bsm bp\" data-act=\"play\" data-i=\""+i+"\">\u5F00\u59CB</button>";
      }
      h+="<button class=\"b bsm bs\" data-act=\"edit\" data-i=\""+i+"\">\u7F16\u8F91</button>";
      h+="<button class=\"b bsm bd\" data-act=\"del\" data-i=\""+i+"\">\u5220\u9664</button></div></div>";
    });
    if(!scs.length)h+="<div class=\"empty\">\u6682\u65E0\u5267\u672C\uFF0C\u70B9\u51FB\u4E0A\u65B9\u65B0\u5EFA</div>";
    h+="</div>";
    Modal.open(mode==="play"?"\u9009\u62E9\u5267\u672C":"\u5267\u672C\u7BA1\u7406",h,"",true);

    Q("newScBtn").addEventListener("click",function(){var sc=newScenario();Modal.close();ED.open(sc)});

    var editBtns=Q("mob").querySelectorAll("[data-act='edit']");
    for(var i=0;i<editBtns.length;i++){
      editBtns[i].addEventListener("click",function(e){
        e.stopPropagation();var idx=parseInt(this.dataset.i);
        var scs2=LS.get("scenarios")||[];Modal.close();ED.open(J(scs2[idx]));
      });
    }

    var playBtns=Q("mob").querySelectorAll("[data-act='play']");
    for(var p=0;p<playBtns.length;p++){
      playBtns[p].addEventListener("click",function(e){
        e.stopPropagation();var idx=parseInt(this.dataset.i);
        var scs2=LS.get("scenarios")||[];Modal.close();
        MENU.factionSelect(J(scs2[idx]));
      });
    }

    var delBtns=Q("mob").querySelectorAll("[data-act='del']");
    for(var j=0;j<delBtns.length;j++){
      delBtns[j].addEventListener("click",function(e){
        e.stopPropagation();if(!confirm("\u5220\u9664\u8BE5\u5267\u672C\uFF1F"))return;
        var idx=parseInt(this.dataset.i);var scs2=LS.get("scenarios")||[];
        scs2.splice(idx,1);LS.set("scenarios",scs2);Modal.close();MENU.scenarioList(mode);
      });
    }
  },

  factionSelect:function(scenario){
    if(!scenario.factions||!scenario.factions.length){
      notify("\u8BE5\u5267\u672C\u6CA1\u6709\u52BF\u529B\uFF0C\u8BF7\u5148\u5728\u7F16\u8F91\u5668\u4E2D\u6DFB\u52A0","war");return;
    }
    var h="<div style=\"font-size:.85rem;color:var(--tx2);margin-bottom:.8rem\">\u9009\u62E9\u4F60\u8981\u626E\u6F14\u7684\u52BF\u529B</div>";
    scenario.factions.forEach(function(f){
      var cities=scenario.cities.filter(function(c){return c.fid===f.id}).length;
      var totalPop=0;scenario.cities.forEach(function(c){if(c.fid===f.id)totalPop+=c.pop});
      h+="<div class=\"li fac-sel\" data-fid=\""+f.id+"\" style=\"cursor:pointer\">";
      h+="<div class=\"li-i\"><div class=\"li-n\"><span style=\"display:inline-block;width:16px;height:16px;background:"+f.col+";border-radius:3px;vertical-align:middle;margin-right:8px\"></span>"+E(f.name)+"</div>";
      h+="<div class=\"li-d\">"+cities+"\u57CE\u6C60 | \u4EBA\u53E3"+F(totalPop)+" | \u91D1\u5E01"+F(f.gold||1000)+"</div></div></div>";
    });
    Modal.open("\u9009\u62E9\u52BF\u529B \u2014 "+E(scenario.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button>");

    var items=Q("mob").querySelectorAll(".fac-sel");
    for(var i=0;i<items.length;i++){
      items[i].addEventListener("click",function(){
        var fid=this.dataset.fid;Modal.close();GAME.start(scenario,fid);
      });
    }
  },

  saveManager:function(){
    var keys=LS.keys("savegame_");
    var h="";
    if(!keys.length){
      h="<div class=\"empty\">\u6682\u65E0\u5B58\u6863</div>";
    }else{
      keys.forEach(function(k){
        var save=LS.get(k);if(!save)return;
        var facName="?";
        if(save.sc&&save.sc.factions){var f=save.sc.factions.find(function(x){return x.id===save.fid});if(f)facName=f.name}
        var scName=save.sc?save.sc.name:"\u672A\u77E5";
        h+="<div class=\"li\"><div class=\"li-i\"><div class=\"li-n\">"+E(scName)+" \u2014 "+E(facName)+"</div><div class=\"li-d\">"+(save.year||1)+"\u5E74"+(save.month||1)+"\u6708"+(save.day||1)+"\u65E5</div></div><div class=\"li-a\"><button class=\"b bsm bp save-load\" data-k=\""+E(k)+"\">\u8BFB\u53D6</button><button class=\"b bsm bd save-del\" data-k=\""+E(k)+"\">\u5220\u9664</button></div></div>";
      });
    }
    Modal.open("\u5B58\u6863\u7BA1\u7406",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u5173\u95ED</button>",true);

    var loadBtns=Q("mob").querySelectorAll(".save-load");
    for(var i=0;i<loadBtns.length;i++){
      loadBtns[i].addEventListener("click",function(e){
        e.stopPropagation();var k=this.dataset.k;var save=LS.get(k);
        if(!save){notify("\u5B58\u6863\u635F\u574F","war");return}
        Modal.close();GAME.loadGame(save);
      });
    }
    var delBtns=Q("mob").querySelectorAll(".save-del");
    for(var j=0;j<delBtns.length;j++){
      delBtns[j].addEventListener("click",function(e){
        e.stopPropagation();if(!confirm("\u5220\u9664\u8BE5\u5B58\u6863\uFF1F"))return;
        LS.del(this.dataset.k);Modal.close();MENU.saveManager();
      });
    }
  },

  // === 预设包管理器 ===
  // 预设包结构: {id, name, techs:[], laws:{}, units:[]}
  getPresets:function(){return LS.get("presets")||[{id:"default",name:"\u6807\u51C6\u4F53\u7CFB",techs:J(DEF_TECHS),laws:J(DEF_LAWS),units:J(DEF_UNIT)}]},
  savePresets:function(list){LS.set("presets",list)},

  presetManager:function(){
    var presets=this.getPresets();
    var h="<div style=\"font-size:.82rem;color:var(--tx2);margin-bottom:.6rem\">\u521B\u5EFA\u591A\u5957\u79D1\u6280\u6811+\u6CD5\u5F8B\u9884\u8BBE\u5305\uFF0C\u5728\u5267\u672C\u4E2D\u4E3A\u6BCF\u4E2A\u52BF\u529B\u5206\u914D\u4E0D\u540C\u4F53\u7CFB\u3002</div>";
    h+="<button class=\"b bp\" id=\"pNewPreset\" style=\"width:100%;margin-bottom:.6rem\">+ \u65B0\u5EFA\u9884\u8BBE\u5305</button>";
    presets.forEach(function(p,i){
      var tCount=p.techs?p.techs.length:0;
      var uCount=p.units?p.units.length:0;
      var lCount=0;if(p.laws){LAW_CATS.forEach(function(c){lCount+=(p.laws[c.id]||[]).length})}
      h+="<div class=\"li\" style=\"margin-bottom:.4rem\"><div class=\"li-i\"><div class=\"li-n\">"+E(p.name)+"</div><div class=\"li-d\">"+tCount+"\u79D1\u6280 | "+uCount+"\u5175\u79CD | "+lCount+"\u6CD5\u5F8B</div></div><div class=\"li-a\">";
      h+="<button class=\"b bsm bp p-edit\" data-i=\""+i+"\">\u7F16\u8F91</button>";
      h+="<button class=\"b bsm bs p-dup\" data-i=\""+i+"\">\u590D\u5236</button>";
      if(p.id!=="default")h+="<button class=\"b bsm bd p-del\" data-i=\""+i+"\">\u5220</button>";
      h+="</div></div>";
    });
    Modal.open("\u4E16\u754C\u4F53\u7CFB\u7F16\u8F91\u5668",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u5173\u95ED</button>",true);

    Q("pNewPreset").addEventListener("click",function(){
      var list=MENU.getPresets();
      list.push({id:U(),name:"\u65B0\u4F53\u7CFB"+(list.length),techs:J(DEF_TECHS),laws:J(DEF_LAWS),units:J(DEF_UNIT)});
      MENU.savePresets(list);Modal.close();MENU.presetManager();
    });
    var editBtns=Q("mob").querySelectorAll(".p-edit");
    for(var i=0;i<editBtns.length;i++){
      editBtns[i].addEventListener("click",function(e){
        e.stopPropagation();
        var idx=parseInt(this.dataset.i);
        Modal.close();MENU.editPreset(idx);
      });
    }
    var dupBtns=Q("mob").querySelectorAll(".p-dup");
    for(var d=0;d<dupBtns.length;d++){
      dupBtns[d].addEventListener("click",function(e){
        e.stopPropagation();
        var idx=parseInt(this.dataset.i);
        var list=MENU.getPresets();
        var src=J(list[idx]);src.id=U();src.name=src.name+"\u526F\u672C";
        list.push(src);MENU.savePresets(list);Modal.close();MENU.presetManager();
      });
    }
    var delBtns=Q("mob").querySelectorAll(".p-del");
    for(var j=0;j<delBtns.length;j++){
      delBtns[j].addEventListener("click",function(e){
        e.stopPropagation();if(!confirm("\u5220\u9664\u8FD9\u4E2A\u9884\u8BBE\u5305\uFF1F"))return;
        var idx=parseInt(this.dataset.i);
        var list=MENU.getPresets();list.splice(idx,1);MENU.savePresets(list);
        Modal.close();MENU.presetManager();
      });
    }
  },

  editPreset:function(idx){
    var presets=this.getPresets();
    var p=presets[idx];if(!p)return;
    this._editingPreset=p;
    this._editingPresetIdx=idx;
    this._presetTab="tech"; // tech or law
    this.renderPresetEditor();
  },

  renderPresetEditor:function(){
    var self=this;
    var p=this._editingPreset;
    var idx=this._editingPresetIdx;
    var presets=this.getPresets();
    var tab=this._presetTab;

    var h="<div class=\"fr\"><label class=\"fl\">\u9884\u8BBE\u5305\u540D\u79F0</label><input class=\"fi\" id=\"epName\" value=\""+E(p.name)+"\"></div>";
    if(!p.units)p.units=J(DEF_UNIT);
    // 标签切换
    h+="<div class=\"tabs\" style=\"margin-bottom:.6rem\">";
    h+="<div class=\"tab"+(tab==="tech"?" on":"")+"\" data-action=\"presetTab\" data-tab=\"tech\">\uD83D\uDD2C \u79D1\u6280 ("+p.techs.length+")</div>";
    h+="<div class=\"tab"+(tab==="unit"?" on":"")+"\" data-action=\"presetTab\" data-tab=\"unit\">\uD83D\uDEE1 \u5175\u79CD ("+(p.units?p.units.length:0)+")</div>";
    var lc=0;if(p.laws){LAW_CATS.forEach(function(c){lc+=(p.laws[c.id]||[]).length})}
    h+="<div class=\"tab"+(tab==="law"?" on":"")+"\" data-action=\"presetTab\" data-tab=\"law\">\uD83D\uDCDC \u6CD5\u5F8B ("+lc+")</div>";
    h+="</div>";

    if(tab==="tech"){
      h+="<button class=\"b bp bsm\" data-action=\"addPresetTech\" style=\"margin-bottom:.5rem\">+ \u65B0\u589E\u79D1\u6280</button>";
      h+="<div style=\"max-height:50vh;overflow-y:auto\">";
      TECH_ERAS.forEach(function(era){
        var arr=p.techs.filter(function(t){return t.era===era.id});
        if(!arr.length)return;
        h+="<div style=\"font-size:.75rem;font-weight:700;color:var(--gold);margin:.5rem 0 .2rem;border-bottom:1px solid var(--bd);padding-bottom:.15rem\">\u2606 "+E(era.name)+" ("+arr.length+")</div>";
        arr.forEach(function(t){
          var reqNames=t.req.map(function(rid){var rt=p.techs.find(function(x){return x.id===rid});return rt?rt.name:rid}).join(",");
          h+="<div class=\"li\" style=\"font-size:.8rem\" data-action=\"editPresetTech\" data-id=\""+t.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(t.name)+" <span class=\"tg tg-gold\">\u8D39"+t.cost+"</span></div><div class=\"li-d\">"+E(t.desc||"")+(reqNames?" | \u524D\u7F6E:"+reqNames:"")+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delPresetTech\" data-id=\""+t.id+"\">\u2715</button></div></div>";
        });
      });
      h+="</div>";
    }else if(tab==="unit"){
      h+="<button class=\"b bp bsm\" data-action=\"addPresetUnit\" style=\"margin-bottom:.5rem\">+ \u65B0\u589E\u5175\u79CD</button>";
      h+="<div style=\"max-height:50vh;overflow-y:auto\">";
      (p.units||[]).forEach(function(u){
        var techName="";if(u.reqTech){var rt2=p.techs.find(function(x){return x.id===u.reqTech});if(rt2)techName=" \u9700:"+rt2.name}
        h+="<div class=\"li\" style=\"font-size:.8rem\" data-action=\"editPresetUnit\" data-id=\""+u.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(u.name)+" <span class=\"tg tg-blue\">"+({land:"\u9646",naval:"\u6D77",air:"\u7A7A"}[u.tp]||u.tp)+"</span> <span class=\"tg tg-gold\">"+E(u.cul)+"</span></div><div class=\"li-d\">\u653B"+u.atk+" \u9632"+u.def+" \u8D39"+u.cost+E(techName)+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delPresetUnit\" data-id=\""+u.id+"\">\u2715</button></div></div>";
      });
      h+="</div>";
    }else{
      // 法律编辑
      h+="<div style=\"max-height:50vh;overflow-y:auto\">";
      LAW_CATS.forEach(function(cat){
        var items=(p.laws||{})[cat.id]||[];
        h+="<div style=\"font-size:.78rem;font-weight:700;color:var(--bd3);margin:.5rem 0 .2rem\">"+cat.ico+" "+E(cat.name)+" ("+items.length+")</div>";
        items.forEach(function(law,li){
          var tn="\u65E0";if(law.reqTech){var tt=p.techs.find(function(x){return x.id===law.reqTech});if(tt)tn=tt.name}
          var fxStr=Object.keys(law.fx||{}).map(function(k){return k+(law.fx[k]>0?"+":"")+law.fx[k]+"%"}).join(" ");
          h+="<div class=\"li\" style=\"font-size:.8rem\" data-action=\"editPresetLaw\" data-cat=\""+cat.id+"\" data-idx=\""+li+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(law.name)+"</div><div class=\"li-d\">"+(fxStr||"")+(" | \u9700:"+E(tn))+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delPresetLaw\" data-cat=\""+cat.id+"\" data-idx=\""+li+"\">\u2715</button></div></div>";
        });
        h+="<button class=\"b bs bxs\" data-action=\"addPresetLaw\" data-cat=\""+cat.id+"\" style=\"width:100%;margin-bottom:.4rem\">+ \u6DFB\u52A0"+E(cat.name)+"\u9009\u9879</button>";
      });
      h+="</div>";
    }

    // 底部工具
    h+="<div style=\"display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem;padding-top:.5rem;border-top:1px solid var(--bd)\">";
    h+="<button class=\"b bs bsm\" id=\"epExport\">\u5BFC\u51FAJSON</button>";
    h+="<label class=\"b bs bsm\" style=\"cursor:pointer\">\u5BFC\u5165<input type=\"file\" accept=\".json\" id=\"epImport\" style=\"display:none\"></label>";
    h+="<button class=\"b bd bsm\" id=\"epResetDef\">\u91CD\u7F6E\u9ED8\u8BA4</button>";
    h+="</div>";

    Modal.open("\u7F16\u8F91\u4F53\u7CFB: "+E(p.name),h,"<button class=\"b bs\" id=\"epBack\">\u8FD4\u56DE\u5217\u8868</button><button class=\"b bp\" id=\"epSave\">\u4FDD\u5B58</button>",true);

    // 替换mob节点清除旧事件
    var oldMob=Q("mob");
    var newMob=document.createElement("div");
    newMob.id="mob";newMob.className=oldMob.className;
    newMob.innerHTML=oldMob.innerHTML;
    oldMob.parentNode.replaceChild(newMob,oldMob);

    // 事件委托（绑在新节点上，不会重复）
    newMob.addEventListener("click",function(e){
      var tgt=e.target.closest("[data-action]");
      if(!tgt)return;
      var act=tgt.dataset.action;
      if(act==="presetTab"){self._presetTab=tgt.dataset.tab;self.renderPresetEditor();return}
      if(act==="addPresetTech"){self.addPresetTech();return}
      if(act==="editPresetTech"){self.editPresetTechItem(tgt.dataset.id);return}
      if(act==="delPresetTech"){e.stopPropagation();self.delPresetTechItem(tgt.dataset.id);return}
      if(act==="addPresetLaw"){self.addPresetLawItem(tgt.dataset.cat);return}
      if(act==="editPresetLaw"){self.editPresetLawItem(tgt.dataset.cat,parseInt(tgt.dataset.idx));return}
      if(act==="delPresetLaw"){e.stopPropagation();self.delPresetLawItem(tgt.dataset.cat,parseInt(tgt.dataset.idx));return}
      if(act==="addPresetUnit"){self.addPresetUnitItem();return}
      if(act==="editPresetUnit"){self.editPresetUnitItem(tgt.dataset.id);return}
      if(act==="delPresetUnit"){e.stopPropagation();self.delPresetUnitItem(tgt.dataset.id);return}
    });

    Q("epSave").addEventListener("click",function(){
      p.name=Q("epName").value||p.name;
      presets[idx]=p;MENU.savePresets(presets);
      notify("\u4F53\u7CFB\u5DF2\u4FDD\u5B58","ok");Modal.close();MENU.presetManager();
    });
    Q("epBack").addEventListener("click",function(){
      p.name=Q("epName").value||p.name;
      presets[idx]=p;MENU.savePresets(presets);
      Modal.close();MENU.presetManager();
    });
    Q("epExport").addEventListener("click",function(){
      var blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"});
      var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=p.name+".json";a.click();
    });
    Q("epImport").addEventListener("change",function(e){
      var f=e.target.files[0];if(!f)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        try{
          var data=JSON.parse(ev.target.result);
          if(data.techs&&data.laws){
            p.techs=data.techs;p.laws=data.laws;if(data.name)p.name=data.name;
            self._editingPreset=p;
            notify("\u5DF2\u5BFC\u5165","ok");self.renderPresetEditor();
          }else{notify("\u683C\u5F0F\u9519\u8BEF","war")}
        }catch(ex){notify("\u89E3\u6790\u5931\u8D25","war")}
      };reader.readAsText(f);
    });
    Q("epResetDef").addEventListener("click",function(){
      p.techs=J(DEF_TECHS);p.laws=J(DEF_LAWS);p.units=J(DEF_UNIT);self._editingPreset=p;
      notify("\u5DF2\u91CD\u7F6E","ok");self.renderPresetEditor();
    });
  },

  // === 科技项编辑 ===
  addPresetTech:function(){
    var p=this._editingPreset;
    p.techs.push({id:U(),name:"\u65B0\u79D1\u6280",era:"ancient",cost:100,req:[],fx:{},desc:""});
    this.renderPresetEditor();
  },
  delPresetTechItem:function(tid){
    var p=this._editingPreset;
    p.techs=p.techs.filter(function(t){return t.id!==tid});
    this.renderPresetEditor();
  },
  editPresetTechItem:function(tid){
    var self=this;var p=this._editingPreset;
    var tech=p.techs.find(function(t){return t.id===tid});if(!tech)return;
    var eraOpts=TECH_ERAS.map(function(e){return "<option value=\""+e.id+"\""+(e.id===tech.era?" selected":"")+">"+E(e.name)+"</option>"}).join("");
    var reqOpts=p.techs.filter(function(x){return x.id!==tid}).map(function(x){return "<option value=\""+x.id+"\""+(tech.req.indexOf(x.id)>=0?" selected":"")+">"+E(x.name)+"</option>"}).join("");
    var fxKeys=["atk","def","eco","pop","research","speed","naval","siege"];
    var h2="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"pt_n\" value=\""+E(tech.name)+"\"></div>";
    h2+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u65F6\u4EE3</label><select class=\"fsel\" id=\"pt_era\">"+eraOpts+"</select></div><div class=\"fr\"><label class=\"fl\">\u8D39\u7528</label><input type=\"number\" class=\"fi\" id=\"pt_cost\" value=\""+tech.cost+"\"></div></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u524D\u7F6E\u79D1\u6280(\u591A\u9009)</label><select class=\"fsel\" id=\"pt_req\" multiple style=\"min-height:60px\">"+reqOpts+"</select></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u63CF\u8FF0</label><input class=\"fi\" id=\"pt_desc\" value=\""+E(tech.desc||"")+"\"></div>";
    h2+="<div style=\"font-size:.78rem;font-weight:600;color:var(--tx2);margin-bottom:.3rem\">\u6548\u679C(%)</div><div class=\"frr\">";
    fxKeys.forEach(function(k){h2+="<div class=\"fr\" style=\"min-width:70px\"><label class=\"fl\">"+k+"</label><input type=\"number\" class=\"fi bsm\" id=\"pt_fx_"+k+"\" value=\""+(tech.fx[k]||0)+"\"></div>"});
    h2+="</div>";
    Modal.open("\u7F16\u8F91\u79D1\u6280",h2,"<button class=\"b bs\" id=\"ptCancel\">\u53D6\u6D88</button><button class=\"b bp\" id=\"ptOk\">\u786E\u5B9A</button>");
    Q("ptOk").addEventListener("click",function(){
      tech.name=Q("pt_n").value||tech.name;tech.era=Q("pt_era").value;tech.cost=parseInt(Q("pt_cost").value)||100;
      tech.desc=Q("pt_desc").value;tech.req=[];
      var sel=Q("pt_req");for(var i=0;i<sel.options.length;i++){if(sel.options[i].selected)tech.req.push(sel.options[i].value)}
      tech.fx={};fxKeys.forEach(function(k){var v=parseInt(Q("pt_fx_"+k).value);if(v)tech.fx[k]=v});
      Modal.close();self.renderPresetEditor();
    });
    Q("ptCancel").addEventListener("click",function(){Modal.close();self.renderPresetEditor()});
  },

  // === 法律项编辑 ===
  addPresetLawItem:function(catId){
    var p=this._editingPreset;
    if(!p.laws)p.laws={};if(!p.laws[catId])p.laws[catId]=[];
    p.laws[catId].push({id:U(),name:"\u65B0\u6CD5\u5F8B",fx:{},desc:"",reqTech:""});
    this.renderPresetEditor();
  },
  delPresetLawItem:function(catId,idx){
    var p=this._editingPreset;
    if(p.laws&&p.laws[catId])p.laws[catId].splice(idx,1);
    this.renderPresetEditor();
  },
  editPresetLawItem:function(catId,idx){
    var self=this;var p=this._editingPreset;
    var law=(p.laws[catId]||[])[idx];if(!law)return;
    var fxKeys=["atk","def","eco","pop","research","speed","naval"];
    var techOpts="<option value=\"\">\u65E0\u9700\u79D1\u6280</option>";
    p.techs.forEach(function(t){techOpts+="<option value=\""+t.id+"\""+(t.id===law.reqTech?" selected":"")+">"+E(t.name)+"</option>"});
    var h2="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"pl_n\" value=\""+E(law.name)+"\"></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u63CF\u8FF0</label><input class=\"fi\" id=\"pl_desc\" value=\""+E(law.desc||"")+"\"></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u9700\u8981\u79D1\u6280</label><select class=\"fsel\" id=\"pl_req\">"+techOpts+"</select></div>";
    h2+="<div style=\"font-size:.78rem;font-weight:600;color:var(--tx2);margin-bottom:.3rem\">\u6548\u679C(%)</div><div class=\"frr\">";
    fxKeys.forEach(function(k){h2+="<div class=\"fr\" style=\"min-width:70px\"><label class=\"fl\">"+k+"</label><input type=\"number\" class=\"fi bsm\" id=\"pl_fx_"+k+"\" value=\""+(law.fx[k]||0)+"\"></div>"});
    h2+="</div>";
    Modal.open("\u7F16\u8F91\u6CD5\u5F8B",h2,"<button class=\"b bs\" id=\"plCancel\">\u53D6\u6D88</button><button class=\"b bp\" id=\"plOk\">\u786E\u5B9A</button>");
    Q("plOk").addEventListener("click",function(){
      law.name=Q("pl_n").value||law.name;law.desc=Q("pl_desc").value;law.reqTech=Q("pl_req").value;
      law.fx={};fxKeys.forEach(function(k){var v=parseInt(Q("pl_fx_"+k).value);if(v)law.fx[k]=v});
      Modal.close();self.renderPresetEditor();
    });
    Q("plCancel").addEventListener("click",function(){Modal.close();self.renderPresetEditor()});
  },

  // === 兵种项编辑 ===
  addPresetUnitItem:function(){
    var p=this._editingPreset;
    if(!p.units)p.units=[];
    p.units.push({id:U(),name:"\u65B0\u5175\u79CD",cul:"\u901A\u7528",tp:"land",atk:5,def:5,cost:20,up:2,reqTech:""});
    this.renderPresetEditor();
  },
  delPresetUnitItem:function(uid){
    var p=this._editingPreset;
    p.units=(p.units||[]).filter(function(u){return u.id!==uid});
    this.renderPresetEditor();
  },
  editPresetUnitItem:function(uid){
    var self=this;var p=this._editingPreset;
    var u=(p.units||[]).find(function(x){return x.id===uid});if(!u)return;
    var techOpts="<option value=\"\">\u65E0\u9700\u79D1\u6280</option>";
    p.techs.forEach(function(t){techOpts+="<option value=\""+t.id+"\""+(t.id===u.reqTech?" selected":"")+">"+E(t.name)+"</option>"});
    var h2="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"pu_n\" value=\""+E(u.name)+"\"></div>";
    h2+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><input class=\"fi\" id=\"pu_cul\" value=\""+E(u.cul||"\u901A\u7528")+"\"></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u7C7B\u578B</label><select class=\"fsel\" id=\"pu_tp\"><option value=\"land\""+(u.tp==="land"?" selected":"")+">\u9646\u519B</option><option value=\"naval\""+(u.tp==="naval"?" selected":"")+">\u6D77\u519B</option><option value=\"air\""+(u.tp==="air"?" selected":"")+">\u7A7A\u519B</option></select></div></div>";
    h2+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u653B\u51FB</label><input type=\"number\" class=\"fi\" id=\"pu_atk\" value=\""+u.atk+"\"></div><div class=\"fr\"><label class=\"fl\">\u9632\u5FA1</label><input type=\"number\" class=\"fi\" id=\"pu_def\" value=\""+u.def+"\"></div></div>";
    h2+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u8D39\u7528</label><input type=\"number\" class=\"fi\" id=\"pu_cost\" value=\""+u.cost+"\"></div><div class=\"fr\"><label class=\"fl\">\u7EF4\u62A4</label><input type=\"number\" class=\"fi\" id=\"pu_up\" value=\""+(u.up||2)+"\"></div></div>";
    h2+="<div class=\"fr\"><label class=\"fl\">\u9700\u8981\u79D1\u6280</label><select class=\"fsel\" id=\"pu_req\">"+techOpts+"</select></div>";
    Modal.open("\u7F16\u8F91\u5175\u79CD",h2,"<button class=\"b bs\" id=\"puCancel\">\u53D6\u6D88</button><button class=\"b bp\" id=\"puOk\">\u786E\u5B9A</button>");
    Q("puOk").addEventListener("click",function(){
      u.name=Q("pu_n").value||u.name;u.cul=Q("pu_cul").value||"\u901A\u7528";
      u.tp=Q("pu_tp").value;u.atk=parseInt(Q("pu_atk").value)||5;
      u.def=parseInt(Q("pu_def").value)||5;u.cost=parseInt(Q("pu_cost").value)||20;
      u.up=parseInt(Q("pu_up").value)||2;u.reqTech=Q("pu_req").value;
      Modal.close();self.renderPresetEditor();
    });
    Q("puCancel").addEventListener("click",function(){Modal.close();self.renderPresetEditor()});
  }
};

// ===== UI helper =====
window.UI={fl:function(inp,cid){var v=inp.value.toLowerCase();var items=document.querySelectorAll("#"+cid+" .li");for(var i=0;i<items.length;i++){var el=items[i];el.style.display=(el.dataset.s||el.textContent).toLowerCase().indexOf(v)>=0?"":"none"}}};

// Expose globally
window.ED=ED;
window.Modal=Modal;
window.notify=notify;
window.Q=Q;window.U=U;window.P=P;window.R=R;window.CL=CL;window.F=F;window.E=E;window.J=J;window.LS=LS;

// ===== BOOT =====
ED.init();
MENU.init();
