  // ===== editor-crud.js — CRUD操作：势力/人物/文化/兵种/设置/保存 =====

  applySettings:function(){
    var sc=this.sc;
    var n=Q("setName");if(n)sc.name=n.value||sc.name;
    var y=Q("setYear");if(y)sc.sy=parseInt(y.value)||sc.sy;
    var mw=Q("setMapW");if(mw)sc.mapW=parseInt(mw.value)||1495;
    var mh=Q("setMapH");if(mh)sc.mapH=parseInt(mh.value)||1019;
    Q("edTitle").textContent="\u5267\u672C: "+E(sc.name);
    this.autoSave();
    notify("\u8BBE\u7F6E\u5DF2\u5E94\u7528","ok");
  },

  // ===== CRUD: FACTIONS =====
  addFaction:function(){
    var sc=this.sc;
    var col=COLORS[sc.factions.length%COLORS.length];
    sc.factions.push({id:U(),name:"\u65B0\u52BF\u529B"+(sc.factions.length+1),col:col,fc:[col,"#fff","#333"],gold:1000,presetId:"",initTechs:[],initLaws:{}});
    this.autoSave();this.renderSide();
  },
  editFaction:function(fid){
    var sc=this.sc;var self=this;
    var f=sc.factions.find(function(x){return x.id===fid});if(!f)return;
    if(!f.initTechs)f.initTechs=[];
    if(!f.initLaws)f.initLaws={};
    // 获取该势力对应的预设包
    var preset=null;
    if(f.presetId&&sc.presets){preset=sc.presets.find(function(p){return p.id===f.presetId})}
    if(!preset&&sc.presets&&sc.presets.length)preset=sc.presets[0];
    var facTechs=preset?preset.techs:(sc.techs||[]);
    var facLaws=preset?preset.laws:(sc.laws||{});

    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"ef_n\" value=\""+E(f.name)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u4EE3\u8868\u8272</label><div class=\"color-grid\">";
    COLORS.forEach(function(c){h+="<div class=\"color-sw"+(c===f.col?" on":"")+"\" style=\"background:"+c+"\" data-c=\""+c+"\"></div>"});
    h+="</div></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u521D\u59CB\u91D1\u5E01</label><input type=\"number\" class=\"fi\" id=\"ef_g\" value=\""+(f.gold||1000)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><select class=\"fsel\" id=\"ef_cul\"><option value=\"\">\u65E0</option>"+sc.cultures.map(function(cu){return "<option value=\""+cu.id+"\""+(cu.id===f.cul?" selected":"")+">"+E(cu.name)+"</option>"}).join("")+"</select></div></div>";
    // 预设体系
    var presets=sc.presets||[];
    var presetOpts="<option value=\"\">\u9ED8\u8BA4</option>";
    presets.forEach(function(p){presetOpts+="<option value=\""+p.id+"\""+(p.id===f.presetId?" selected":"")+">"+E(p.name)+"</option>"});
    h+="<div class=\"fr\"><label class=\"fl\">\u79D1\u6280+\u6CD5\u5F8B\u4F53\u7CFB</label><select class=\"fsel\" id=\"ef_preset\">"+presetOpts+"</select></div>";
    // 初始科技(多选)
    h+="<div class=\"fr\"><label class=\"fl\">\u521D\u59CB\u5DF2\u7814\u7A76\u79D1\u6280(\u591A\u9009)</label><select class=\"fsel\" id=\"ef_itechs\" multiple style=\"min-height:80px\">";
    facTechs.forEach(function(t){h+="<option value=\""+t.id+"\""+(f.initTechs.indexOf(t.id)>=0?" selected":"")+">"+E(t.name)+"</option>"});
    h+="</select></div>";
    // 初始法律(每类一个下拉)
    h+="<div style=\"font-size:.8rem;font-weight:600;color:var(--tx2);margin:.4rem 0 .2rem\">\u521D\u59CB\u6CD5\u5F8B</div>";
    LAW_CATS.forEach(function(cat){
      var laws=facLaws[cat.id]||[];
      if(!laws.length)return;
      h+="<div class=\"fr\"><label class=\"fl\">"+cat.ico+" "+E(cat.name)+"</label><select class=\"fsel\" id=\"ef_law_"+cat.id+"\">";
      laws.forEach(function(law,li){h+="<option value=\""+li+"\""+(f.initLaws[cat.id]===li?" selected":"")+">"+E(law.name)+"</option>"});
      h+="</select></div>";
    });

    Modal.open("\u7F16\u8F91\u52BF\u529B: "+E(f.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"efSave\">\u4FDD\u5B58</button>",true);
    var swatches=Q("mob").querySelectorAll(".color-sw");
    for(var i=0;i<swatches.length;i++){
      swatches[i].addEventListener("click",function(){
        for(var j=0;j<swatches.length;j++)swatches[j].classList.remove("on");
        this.classList.add("on");
      });
    }
    Q("efSave").addEventListener("click",function(){
      f.name=Q("ef_n").value||f.name;
      f.gold=parseInt(Q("ef_g").value)||1000;
      f.cul=Q("ef_cul")?Q("ef_cul").value:"";
      f.presetId=Q("ef_preset")?Q("ef_preset").value:"";
      var sel=Q("mob").querySelector(".color-sw.on");
      if(sel)f.col=sel.dataset.c;f.fc=[f.col,"#fff","#333"];
      // 保存初始科技
      f.initTechs=[];
      var itSel=Q("ef_itechs");
      if(itSel){for(var k=0;k<itSel.options.length;k++){if(itSel.options[k].selected)f.initTechs.push(itSel.options[k].value)}}
      // 保存初始法律
      f.initLaws={};
      LAW_CATS.forEach(function(cat){
        var lawSel=Q("ef_law_"+cat.id);
        if(lawSel)f.initLaws[cat.id]=parseInt(lawSel.value)||0;
      });
      self.autoSave();Modal.close();self.render();self.renderSide();notify("\u52BF\u529B\u5DF2\u66F4\u65B0","ok");
    });
  },
  delFaction:function(fid){if(!confirm("\u5220\u9664\u8BE5\u52BF\u529B\uFF1F"))return;this.sc.factions=this.sc.factions.filter(function(f){return f.id!==fid});this.autoSave();this.renderSide();this.render()},

  // ===== CRUD: CHARACTERS (带绑定+BUFF) =====
  addChar:function(){
    this.sc.characters.push({id:U(),name:"\u65B0\u4EBA\u7269",fid:"",cul:"",role:"",
      sk:{cmd:50,pol:50,dip:50,eco:50,eng:50},
      bindType:"",bindId:"",alive:true});
    this.autoSave();this.renderSide();
  },
  editChar:function(cid){
    var sc=this.sc;var self=this;
    var ch=sc.characters.find(function(x){return x.id===cid});if(!ch)return;
    if(!ch.sk)ch.sk={cmd:50,pol:50,dip:50,eco:50,eng:50};
    var facOpts="<option value=\"\">\u65E0</option>"+sc.factions.map(function(f){return "<option value=\""+f.id+"\""+(f.id===ch.fid?" selected":"")+">"+E(f.name)+"</option>"}).join("");
    var culOpts="<option value=\"\">\u65E0</option>"+sc.cultures.map(function(cu){return "<option value=\""+cu.id+"\""+(cu.id===ch.cul?" selected":"")+">"+E(cu.name)+"</option>"}).join("");
    // 绑定选项
    var bindOpts="<option value=\"\">\u672A\u5206\u914D</option>";
    bindOpts+="<optgroup label=\"\u9A7B\u5B88\u57CE\u6C60\">";
    sc.cities.forEach(function(c){bindOpts+="<option value=\"city:"+c.id+"\""+(ch.bindType==="city"&&ch.bindId===c.id?" selected":"")+">"+E(c.name)+"</option>"});
    bindOpts+="</optgroup>";

    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"ech_n\" value=\""+E(ch.name)+"\"></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u52BF\u529B</label><select class=\"fsel\" id=\"ech_f\">"+facOpts+"</select></div><div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><select class=\"fsel\" id=\"ech_cu\">"+culOpts+"</select></div></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u804C\u4F4D</label><input class=\"fi\" id=\"ech_r\" value=\""+E(ch.role||"")+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u5206\u914D\u4F4D\u7F6E\uFF08\u9A7B\u57CE/\u5E26\u5175\uFF09</label><select class=\"fsel\" id=\"ech_bind\">"+bindOpts+"</select></div>";
    h+="<div style=\"font-size:.8rem;font-weight:600;color:var(--tx2);margin:.5rem 0 .2rem\">\u80FD\u529B\u503C (0-100\uFF0C\u5F71\u54CD\u52A0\u6210)</div>";
    h+="<div class=\"frr\">";
    h+="<div class=\"fr\"><label class=\"fl\">\u7EDF\u7387</label><input type=\"number\" class=\"fi\" id=\"ech_cmd\" value=\""+(ch.sk.cmd||50)+"\" title=\"\u63D0\u5347\u519B\u961F\u6218\u6597\u529B\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u653F\u6CBB</label><input type=\"number\" class=\"fi\" id=\"ech_pol\" value=\""+(ch.sk.pol||50)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u5916\u4EA4</label><input type=\"number\" class=\"fi\" id=\"ech_dip\" value=\""+(ch.sk.dip||50)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u7ECF\u6D4E</label><input type=\"number\" class=\"fi\" id=\"ech_eco\" value=\""+(ch.sk.eco||50)+"\" title=\"\u63D0\u5347\u57CE\u6C60\u7ECF\u6D4E\u6536\u5165\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u5DE5\u7A0B</label><input type=\"number\" class=\"fi\" id=\"ech_eng\" value=\""+(ch.sk.eng||50)+"\" title=\"\u63D0\u5347\u57CE\u6C60\u9632\u5FA1\"></div>";
    h+="</div>";
    h+="<div style=\"font-size:.7rem;color:var(--tx3);margin-top:.3rem\">\u7EDF\u7387:\u519B\u961F\u6218\u529B+% | \u7ECF\u6D4E:\u57CE\u6C60\u6536\u5165+% | \u5DE5\u7A0B:\u57CE\u6C60\u9632\u5FA1+%</div>";

    Modal.open("\u7F16\u8F91\u4EBA\u7269: "+E(ch.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"echSave\">\u4FDD\u5B58</button>");
    Q("echSave").addEventListener("click",function(){
      ch.name=Q("ech_n").value||ch.name;ch.fid=Q("ech_f").value;ch.cul=Q("ech_cu").value;ch.role=Q("ech_r").value;
      ch.sk={
        cmd:CL(parseInt(Q("ech_cmd").value)||50,0,100),
        pol:CL(parseInt(Q("ech_pol").value)||50,0,100),
        dip:CL(parseInt(Q("ech_dip").value)||50,0,100),
        eco:CL(parseInt(Q("ech_eco").value)||50,0,100),
        eng:CL(parseInt(Q("ech_eng").value)||50,0,100)
      };
      // 解析绑定
      var bindVal=Q("ech_bind").value;
      if(bindVal){
        var parts=bindVal.split(":");
        ch.bindType=parts[0];ch.bindId=parts[1]||"";
      }else{ch.bindType="";ch.bindId=""}
      self.autoSave();Modal.close();self.renderSide();notify("\u4EBA\u7269\u5DF2\u66F4\u65B0","ok");
    });
  },
  delChar:function(cid){this.sc.characters=this.sc.characters.filter(function(c){return c.id!==cid});this.autoSave();this.renderSide()},

  // ===== CRUD: CULTURES =====
  addCulture:function(){this.sc.cultures.push({id:U(),name:"\u65B0\u6587\u5316",desc:""});this.renderSide()},
  editCulture:function(cid){
    var sc=this.sc;var self=this;
    var cu=sc.cultures.find(function(x){return x.id===cid});if(!cu)return;
    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"ecu_n\" value=\""+E(cu.name)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u63CF\u8FF0</label><textarea class=\"ft\" id=\"ecu_d\">"+E(cu.desc||"")+"</textarea></div>";
    Modal.open("\u7F16\u8F91\u6587\u5316",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"ecuSave\">\u4FDD\u5B58</button>");
    Q("ecuSave").addEventListener("click",function(){cu.name=Q("ecu_n").value||cu.name;cu.desc=Q("ecu_d").value;self.autoSave();Modal.close();self.renderSide();notify("\u6587\u5316\u5DF2\u66F4\u65B0","ok")});
  },
  delCulture:function(cid){this.sc.cultures=this.sc.cultures.filter(function(c){return c.id!==cid});this.renderSide()},

  // ===== CRUD: UNITS =====
  addUnit:function(){this.sc.units.push({id:U(),name:"\u65B0\u5175\u79CD",cul:"\u901A\u7528",tp:"land",atk:5,def:5,cost:20,up:2});this.renderSide()},
  editUnit:function(uid){
    var sc=this.sc;var self=this;
    var u=sc.units.find(function(x){return x.id===uid});if(!u)return;
    var culOpts=sc.cultures.map(function(c){return "<option"+(c.name===u.cul?" selected":"")+">"+E(c.name)+"</option>"}).join("");
    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"eu_n\" value=\""+E(u.name)+"\"></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><select class=\"fsel\" id=\"eu_cu\"><option>\u901A\u7528</option>"+culOpts+"</select></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u7C7B\u578B</label><select class=\"fsel\" id=\"eu_t\"><option value=\"land\""+(u.tp==="land"?" selected":"")+">\u9646\u519B</option><option value=\"naval\""+(u.tp==="naval"?" selected":"")+">\u6D77\u519B</option><option value=\"air\""+(u.tp==="air"?" selected":"")+">\u7A7A\u519B</option><option value=\"bandit\""+(u.tp==="bandit"?" selected":"")+">\u5320\u5BC7</option></select></div></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u653B\u51FB</label><input type=\"number\" class=\"fi\" id=\"eu_a\" value=\""+u.atk+"\"></div><div class=\"fr\"><label class=\"fl\">\u9632\u5FA1</label><input type=\"number\" class=\"fi\" id=\"eu_d\" value=\""+u.def+"\"></div></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u8D39\u7528</label><input type=\"number\" class=\"fi\" id=\"eu_c\" value=\""+u.cost+"\"></div><div class=\"fr\"><label class=\"fl\">\u7EF4\u62A4</label><input type=\"number\" class=\"fi\" id=\"eu_u\" value=\""+u.up+"\"></div></div>";
    // 需要科技下拉
    var techOpts="<option value=\"\">\u65E0\u9700\u79D1\u6280</option>";
    if(sc.techs){sc.techs.forEach(function(tech){techOpts+="<option value=\""+tech.id+"\""+(tech.id===u.reqTech?" selected":"")+">"+E(tech.name)+"</option>"});}
    h+="<div class=\"fr\"><label class=\"fl\">\u9700\u8981\u79D1\u6280</label><select class=\"fsel\" id=\"eu_rt\">"+techOpts+"</select></div>";
    Modal.open("\u7F16\u8F91\u5175\u79CD",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"euSave\">\u4FDD\u5B58</button>");
    Q("euSave").addEventListener("click",function(){u.name=Q("eu_n").value||u.name;u.cul=Q("eu_cu").value;u.tp=Q("eu_t").value;u.atk=parseInt(Q("eu_a").value)||5;u.def=parseInt(Q("eu_d").value)||5;u.cost=parseInt(Q("eu_c").value)||20;u.up=parseInt(Q("eu_u").value)||2;u.reqTech=Q("eu_rt").value;self.autoSave();Modal.close();self.renderSide();notify("\u5175\u79CD\u5DF2\u66F4\u65B0","ok")});
  },
  delUnit:function(uid){this.sc.units=this.sc.units.filter(function(u){return u.id!==uid});this.renderSide()},

  // ===== CRUD: TECHS =====
  addTech:function(){
    if(!this.sc.techs)this.sc.techs=[];
    this.sc.techs.push({id:U(),name:"\u65B0\u79D1\u6280",era:"ancient",cost:100,req:[],fx:{},desc:""});
    this.renderSide();
  },
  editTech:function(tid){
    var sc=this.sc;var self=this;
    var tech=sc.techs.find(function(x){return x.id===tid});if(!tech)return;
    var eraOpts=TECH_ERAS.map(function(e){return "<option value=\""+e.id+"\""+(e.id===tech.era?" selected":"")+">"+E(e.name)+"</option>"}).join("");
    // 前置科技多选
    var reqOpts=sc.techs.filter(function(x){return x.id!==tid}).map(function(x){var sel=tech.req.indexOf(x.id)>=0?" selected":"";return "<option value=\""+x.id+"\""+sel+">"+E(x.name)+"</option>"}).join("");
    // 效果字段
    var fxKeys=["atk","def","eco","pop","research","speed","naval","siege"];
    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"et_n\" value=\""+E(tech.name)+"\"></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u65F6\u4EE3</label><select class=\"fsel\" id=\"et_era\">"+eraOpts+"</select></div><div class=\"fr\"><label class=\"fl\">\u8D39\u7528</label><input type=\"number\" class=\"fi\" id=\"et_cost\" value=\""+tech.cost+"\"></div></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u524D\u7F6E\u79D1\u6280(\u591A\u9009)</label><select class=\"fsel\" id=\"et_req\" multiple style=\"min-height:80px\">"+reqOpts+"</select></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u63CF\u8FF0</label><textarea class=\"ft\" id=\"et_desc\">"+E(tech.desc||"")+"</textarea></div>";
    h+="<div style=\"font-size:.8rem;font-weight:600;color:var(--tx2);margin-bottom:.4rem\">\u6548\u679C\u52A0\u6210(%)</div><div class=\"frr\">";
    fxKeys.forEach(function(k){
      h+="<div class=\"fr\" style=\"min-width:80px\"><label class=\"fl\">"+k+"</label><input type=\"number\" class=\"fi\" id=\"et_fx_"+k+"\" value=\""+(tech.fx[k]||0)+"\"></div>";
    });
    h+="</div>";
    // 解锁兵种
    var unlockOpts="<option value=\"\">\u65E0</option>";
    sc.units.forEach(function(u){unlockOpts+="<option value=\""+u.id+"\""+(u.id===tech.unlock?" selected":"")+">"+E(u.name)+"</option>"});
    h+="<div class=\"fr\"><label class=\"fl\">\u89E3\u9501\u5175\u79CD</label><select class=\"fsel\" id=\"et_unlock\">"+unlockOpts+"</select></div>";
    Modal.open("\u7F16\u8F91\u79D1\u6280: "+E(tech.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"etSave\">\u4FDD\u5B58</button>");
    Q("etSave").addEventListener("click",function(){
      tech.name=Q("et_n").value||tech.name;
      tech.era=Q("et_era").value;
      tech.cost=parseInt(Q("et_cost").value)||100;
      // 多选前置
      var selReq=Q("et_req");
      tech.req=[];
      for(var i=0;i<selReq.options.length;i++){if(selReq.options[i].selected)tech.req.push(selReq.options[i].value)}
      tech.desc=Q("et_desc").value;
      tech.fx={};
      fxKeys.forEach(function(k){var v=parseInt(Q("et_fx_"+k).value);if(v)tech.fx[k]=v});
      tech.unlock=Q("et_unlock").value;
      self.autoSave();Modal.close();self.renderSide();notify("\u79D1\u6280\u5DF2\u66F4\u65B0","ok");
    });
  },
  delTech:function(tid){this.sc.techs=this.sc.techs.filter(function(t){return t.id!==tid});this.renderSide()},

  // ===== CRUD: LAWS =====
  addLaw:function(catId){
    if(!this.sc.laws)this.sc.laws=J(DEF_LAWS);
    if(!this.sc.laws[catId])this.sc.laws[catId]=[];
    this.sc.laws[catId].push({id:U(),name:"\u65B0\u6CD5\u5F8B",fx:{},desc:""});
    this.renderSide();
  },
  editLaw:function(catId,idx){
    var sc=this.sc;var self=this;
    if(!sc.laws||!sc.laws[catId])return;
    var law=sc.laws[catId][idx];if(!law)return;
    var fxKeys=["atk","def","eco","pop","research","speed","naval"];
    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"el_n\" value=\""+E(law.name)+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u63CF\u8FF0</label><textarea class=\"ft\" id=\"el_desc\">"+E(law.desc||"")+"</textarea></div>";
    h+="<div style=\"font-size:.8rem;font-weight:600;color:var(--tx2);margin-bottom:.4rem\">\u6548\u679C\u52A0\u6210(%)</div><div class=\"frr\">";
    fxKeys.forEach(function(k){
      h+="<div class=\"fr\" style=\"min-width:80px\"><label class=\"fl\">"+k+"</label><input type=\"number\" class=\"fi\" id=\"el_fx_"+k+"\" value=\""+(law.fx[k]||0)+"\"></div>";
    });
    h+="</div>";
    Modal.open("\u7F16\u8F91\u6CD5\u5F8B: "+E(law.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"elSave\">\u4FDD\u5B58</button>");
    Q("elSave").addEventListener("click",function(){
      law.name=Q("el_n").value||law.name;
      law.desc=Q("el_desc").value;
      law.fx={};
      fxKeys.forEach(function(k){var v=parseInt(Q("el_fx_"+k).value);if(v)law.fx[k]=v});
      self.autoSave();Modal.close();self.renderSide();notify("\u6CD5\u5F8B\u5DF2\u66F4\u65B0","ok");
    });
  },
  delLaw:function(catId,idx){
    if(!this.sc.laws||!this.sc.laws[catId])return;
    this.sc.laws[catId].splice(idx,1);
    this.renderSide();
  },

  // ===== SAVE (自动保存) =====
  autoSave:function(){
    // 每次编辑操作后自动保存到localStorage
    var sc=this.sc;if(!sc)return;
    sc.name=Q("setName")?Q("setName").value||sc.name:sc.name;
    var scs=LS.get("scenarios")||[];
    var idx=scs.findIndex(function(s){return s.id===sc.id});
    if(idx>=0)scs[idx]=sc;else scs.push(sc);
    LS.set("scenarios",scs);
  },
  saveScenario:function(){
    this.autoSave();
    notify("\u5267\u672C\u5DF2\u4FDD\u5B58\uFF01","ok");
  },

  // === 海域颜色吸取 ===
  pickSeaColor:function(){
    var self=this;
    notify("\u70B9\u51FB\u5730\u56FE\u4E0A\u7684\u6D77\u57DF\u533A\u57DF\u5438\u53D6\u989C\u8272","info");
    // 临时覆盖地图点击
    var oldClick=this.map.onClick;
    this.map.onClick=function(mx,my,e){
      // 从地图图片读取像素颜色
      var img=self.map.img;
      var cvs=document.createElement("canvas");
      cvs.width=img.naturalWidth;cvs.height=img.naturalHeight;
      var ctx=cvs.getContext("2d");
      ctx.drawImage(img,0,0);
      var px=Math.round(CL(mx,0,cvs.width-1));
      var py=Math.round(CL(my,0,cvs.height-1));
      var pixel=ctx.getImageData(px,py,1,1).data;
      var hex="#"+((1<<24)+(pixel[0]<<16)+(pixel[1]<<8)+pixel[2]).toString(16).slice(1);
      self.sc.seaColor=hex;
      var colorInput=Q("setSeaColor");
      if(colorInput)colorInput.value=hex;
      notify("\u5DF2\u5438\u53D6\u989C\u8272: "+hex,"ok");
      // 恢复原来的点击处理
      self.map.onClick=oldClick;
    };
  },

  // === 海域自动检测(网格位图) ===
  detectSea:function(){
    var sc=this.sc;
    var seaColor=Q("setSeaColor")?Q("setSeaColor").value:(sc.seaColor||"#4a90d9");
    var tolerance=parseInt(Q("setSeaTol")?Q("setSeaTol").value:35)||35;
    sc.seaColor=seaColor;sc.seaTolerance=tolerance;
    var tr=parseInt(seaColor.slice(1,3),16),tg2=parseInt(seaColor.slice(3,5),16),tb=parseInt(seaColor.slice(5,7),16);
    var img=this.map.img;
    if(!img.naturalWidth){notify("\u8BF7\u5148\u4E0A\u4F20\u5730\u56FE","war");return}
    notify("\u68C0\u6D4B\u4E2D...","info");
    var cvs=document.createElement("canvas");
    var w=img.naturalWidth,ht=img.naturalHeight,step=8;
    var gw=Math.ceil(w/step),gh=Math.ceil(ht/step);
    cvs.width=gw;cvs.height=gh;
    var ctx=cvs.getContext("2d");ctx.drawImage(img,0,0,gw,gh);
    var data=ctx.getImageData(0,0,gw,gh).data;
    var grid="";var seaN=0;var tolSq=tolerance*tolerance*3;
    for(var j=0;j<data.length;j+=4){
      var dr=data[j]-tr,dg=data[j+1]-tg2,db2=data[j+2]-tb;
      if(dr*dr+dg*dg+db2*db2<tolSq){grid+="1";seaN++}else{grid+="0"}
    }
    sc.seaGrid=grid;sc.seaGridW=gw;sc.seaGridH=gh;sc.seaStep=step;
    delete sc.seaMask;
    this.autoSave();
    notify("\u6D77\u57DF\u68C0\u6D4B\u5B8C\u6210 "+seaN+"/"+gw*gh+"\u683C","ok");
    this.renderSide();
  },

  // === 查看/编辑剧本内预设(不影响全局) ===
  viewScenarioPreset:function(idx){
    var sc=this.sc;var self=this;
    var p=sc.presets[idx];if(!p)return;
    if(!p.units)p.units=J(DEF_UNIT);
    var h="<div style=\"font-size:.78rem;color:var(--tx3);margin-bottom:.4rem\">\u4FEE\u6539\u4EC5\u5F71\u54CD\u672C\u5267\u672C</div>";
    h+="<div style=\"font-size:.88rem;font-weight:700;color:var(--bd3);margin:.3rem 0 .2rem\">\uD83D\uDEE1 \u5175\u79CD ("+p.units.length+")</div>";
    p.units.forEach(function(u,ui){
      h+="<div class=\"li\" style=\"font-size:.8rem\"><div class=\"li-i\"><div class=\"li-n\">"+E(u.name)+" <span class=\"tg tg-blue\">"+({land:"\u9646",naval:"\u6D77",air:"\u7A7A"}[u.tp]||u.tp)+"</span></div><div class=\"li-d\">\u653B"+u.atk+" \u9632"+u.def+" \u901F"+(u.spd||2)+" "+E(u.cul||"\u901A\u7528")+"</div></div><div class=\"li-a\"><button class=\"b bxs bp sp-eu\" data-pi=\""+idx+"\" data-ui=\""+ui+"\">\u7F16</button><button class=\"b bxs bd sp-du\" data-pi=\""+idx+"\" data-ui=\""+ui+"\">\u2715</button></div></div>";
    });
    h+="<button class=\"b bs bxs sp-au\" data-pi=\""+idx+"\" style=\"width:100%;margin:.3rem 0\">+ \u5175\u79CD</button>";
    h+="<div style=\"font-size:.88rem;font-weight:700;color:var(--bd3);margin:.5rem 0 .2rem\">\uD83D\uDD2C \u79D1\u6280 ("+p.techs.length+")</div>";
    h+="<div style=\"max-height:18vh;overflow-y:auto;font-size:.75rem;color:var(--tx2);border:1px solid var(--bd);border-radius:4px;padding:.3rem\">";
    TECH_ERAS.forEach(function(era){var arr=p.techs.filter(function(t){return t.era===era.id});if(arr.length)h+="<b style=\"color:var(--gold)\">\u2606"+E(era.name)+"</b> "+arr.map(function(t){return E(t.name)}).join(", ")+"<br>"});
    h+="</div>";
    var lc=0;if(p.laws)LAW_CATS.forEach(function(c){lc+=(p.laws[c.id]||[]).length});
    h+="<div style=\"font-size:.88rem;font-weight:700;color:var(--bd3);margin:.5rem 0 .2rem\">\uD83D\uDCDC \u6CD5\u5F8B ("+lc+")</div>";
    h+="<div style=\"max-height:12vh;overflow-y:auto;font-size:.75rem;color:var(--tx2);border:1px solid var(--bd);border-radius:4px;padding:.3rem\">";
    LAW_CATS.forEach(function(cat){var items=(p.laws||{})[cat.id]||[];if(items.length)h+=cat.ico+E(cat.name)+": "+items.map(function(l){return E(l.name)}).join(", ")+"<br>"});
    h+="</div>";
    Modal.open("\u4F53\u7CFB: "+E(p.name),h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u5173\u95ED</button>",true);
    // 兵种CRUD绑定
    Q("mob").addEventListener("click",function(e2){
      var tgt=e2.target.closest("[class*='sp-']");if(!tgt)return;
      var pi=parseInt(tgt.dataset.pi),ui=parseInt(tgt.dataset.ui);
      if(tgt.classList.contains("sp-au")){
        sc.presets[pi].units.push({id:U(),name:"\u65B0\u5175\u79CD",cul:"\u901A\u7528",tp:"land",atk:5,def:5,cost:20,up:2,reqTech:"",spd:2});
        self.autoSave();Modal.close();self.viewScenarioPreset(pi);
      }else if(tgt.classList.contains("sp-du")){
        e2.stopPropagation();sc.presets[pi].units.splice(ui,1);
        self.autoSave();Modal.close();self.viewScenarioPreset(pi);
      }else if(tgt.classList.contains("sp-eu")){
        e2.stopPropagation();self.editScenarioUnit(pi,ui);
      }
    });
  },
  editScenarioUnit:function(presetIdx,unitIdx){
    var sc=this.sc;var self=this;
    var u=sc.presets[presetIdx].units[unitIdx];if(!u)return;
    var p=sc.presets[presetIdx];
    var techOpts="<option value=\"\">\u65E0\u9700\u79D1\u6280</option>";
    p.techs.forEach(function(t){techOpts+="<option value=\""+t.id+"\""+(t.id===u.reqTech?" selected":"")+">"+E(t.name)+"</option>"});
    var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"su_n\" value=\""+E(u.name)+"\"></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><input class=\"fi\" id=\"su_cul\" value=\""+E(u.cul||"\u901A\u7528")+"\"></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u7C7B\u578B</label><select class=\"fsel\" id=\"su_tp\"><option value=\"land\""+(u.tp==="land"?" selected":"")+">\u9646\u519B</option><option value=\"naval\""+(u.tp==="naval"?" selected":"")+">\u6D77\u519B</option><option value=\"air\""+(u.tp==="air"?" selected":"")+">\u7A7A\u519B</option></select></div></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u653B\u51FB</label><input type=\"number\" class=\"fi\" id=\"su_atk\" value=\""+u.atk+"\"></div><div class=\"fr\"><label class=\"fl\">\u9632\u5FA1</label><input type=\"number\" class=\"fi\" id=\"su_def\" value=\""+u.def+"\"></div><div class=\"fr\"><label class=\"fl\">\u79FB\u901F</label><input type=\"number\" class=\"fi\" id=\"su_spd\" value=\""+(u.spd||2)+"\" step=\"0.5\"></div></div>";
    h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u8D39\u7528</label><input type=\"number\" class=\"fi\" id=\"su_cost\" value=\""+u.cost+"\"></div><div class=\"fr\"><label class=\"fl\">\u7EF4\u62A4</label><input type=\"number\" class=\"fi\" id=\"su_up\" value=\""+(u.up||2)+"\"></div></div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u9700\u8981\u79D1\u6280</label><select class=\"fsel\" id=\"su_req\">"+techOpts+"</select></div>";
    Modal.open("\u7F16\u8F91\u5175\u79CD",h,"<button class=\"b bs\" id=\"suBack\">\u8FD4\u56DE</button><button class=\"b bp\" id=\"suOk\">\u4FDD\u5B58</button>");
    Q("suOk").addEventListener("click",function(){
      u.name=Q("su_n").value||u.name;u.cul=Q("su_cul").value||"\u901A\u7528";u.tp=Q("su_tp").value;
      u.atk=parseInt(Q("su_atk").value)||5;u.def=parseInt(Q("su_def").value)||5;u.spd=parseFloat(Q("su_spd").value)||2;
      u.cost=parseInt(Q("su_cost").value)||20;u.up=parseInt(Q("su_up").value)||2;u.reqTech=Q("su_req").value;
      self.autoSave();Modal.close();self.viewScenarioPreset(presetIdx);
    });
    Q("suBack").addEventListener("click",function(){Modal.close();self.viewScenarioPreset(presetIdx)});
  }
};
