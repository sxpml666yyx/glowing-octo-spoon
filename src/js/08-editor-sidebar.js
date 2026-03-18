  // ===== editor-sidebar.js — 侧边栏(体系CRUD替换兵种) =====

  renderSide:function(){
    var sc=this.sc;var self=this;
    var oldBody=Q("edSideBody");
    var body=oldBody.cloneNode(false);
    oldBody.parentNode.replaceChild(body,oldBody);
    body.id="edSideBody";
    var t=this.sideTab;
    var h="";

    if(t==="factions"){
      h+="<button class=\"b bp\" style=\"width:100%;margin-bottom:.8rem\" data-action=\"addFaction\">+ \u65B0\u5EFA\u52BF\u529B</button>";
      sc.factions.forEach(function(f){
        var preset="";
        if(f.presetId&&sc.presets){var pp=sc.presets.find(function(x){return x.id===f.presetId});if(pp)preset=" | \u4F53\u7CFB:"+pp.name}
        h+="<div class=\"li\" data-action=\"editFaction\" data-id=\""+f.id+"\"><div class=\"li-i\"><div class=\"li-n\"><span style=\"display:inline-block;width:14px;height:14px;background:"+f.col+";border-radius:3px;vertical-align:middle;margin-right:6px\"></span>"+E(f.name)+"</div><div class=\"li-d\">"+sc.cities.filter(function(c){return c.fid===f.id}).length+"\u57CE \u91D1"+F(f.gold||1000)+E(preset)+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delFaction\" data-id=\""+f.id+"\">\u2715</button></div></div>";
      });
      if(!sc.factions.length)h+="<div class=\"empty\">\u6682\u65E0\u52BF\u529B</div>";

    }else if(t==="cities"){
      h+="<div style=\"font-size:.78rem;color:var(--tx3);margin-bottom:.5rem\">\u70B9\u51FB\u57CE\u6C60\u5DE5\u5177\u653E\u7F6E\uFF0C\u70B9\u5217\u8868\u7F16\u8F91</div>";
      sc.cities.forEach(function(c){
        var ct=CITY_TYPES.find(function(tt){return tt.id===c.type})||CITY_TYPES[0];
        var fac=sc.factions.find(function(f){return f.id===c.fid});
        h+="<div class=\"li\" data-action=\"selCity\" data-id=\""+c.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+(c.port?"\u2693":"")+E(ct.name)+" "+E(c.name)+"</div><div class=\"li-d\">"+(fac?fac.name:"\u65E0\u52BF\u529B")+" | \u4EBA\u53E3"+F(c.pop)+"</div></div></div>";
      });
      if(!sc.cities.length)h+="<div class=\"empty\">\u6682\u65E0\u57CE\u6C60</div>";

    }else if(t==="bandits"){
      h+="<div style=\"font-size:.78rem;color:var(--tx3);margin-bottom:.5rem\">\u5320\u5BC7\u5DE5\u5177\u653E\u7F6E\u636E\u70B9\uFF0C\u70B9\u5217\u8868\u7F16\u8F91</div>";
      sc.bandits.forEach(function(b){
        var culName="";if(b.cul){var cu=sc.cultures.find(function(x){return x.id===b.cul});if(cu)culName=cu.name}
        h+="<div class=\"li\" data-action=\"selBandit\" data-id=\""+b.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+(b.ico||"\uD83D\uDC80")+" "+E(b.name)+"</div><div class=\"li-d\">\u5175\u529B"+b.n+" "+(culName?E(culName):"")+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delBandit\" data-id=\""+b.id+"\">\u2715</button></div></div>";
      });
      if(!sc.bandits.length)h+="<div class=\"empty\">\u6682\u65E0</div>";

    }else if(t==="chars"){
      h+="<button class=\"b bp\" style=\"width:100%;margin-bottom:.8rem\" data-action=\"addChar\">+ \u65B0\u5EFA\u4EBA\u7269</button>";
      sc.characters.forEach(function(ch){
        var fac=sc.factions.find(function(f){return f.id===ch.fid});
        var loc=ch.bindType==="city"?"\u5728\u57CE":ch.bindType==="army"?"\u5E26\u5175":"";
        h+="<div class=\"li\" data-action=\"editChar\" data-id=\""+ch.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(ch.name)+"</div><div class=\"li-d\">"+(fac?fac.name:"\u65E0")+" | "+(ch.role||"\u65E0\u804C\u4F4D")+(loc?" | "+loc:"")+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delChar\" data-id=\""+ch.id+"\">\u2715</button></div></div>";
      });
      if(!sc.characters.length)h+="<div class=\"empty\">\u6682\u65E0</div>";

    }else if(t==="cultures"){
      h+="<button class=\"b bp\" style=\"width:100%;margin-bottom:.8rem\" data-action=\"addCulture\">+ \u65B0\u5EFA\u6587\u5316</button>";
      sc.cultures.forEach(function(cu){
        h+="<div class=\"li\" data-action=\"editCulture\" data-id=\""+cu.id+"\"><div class=\"li-i\"><div class=\"li-n\">"+E(cu.name)+"</div><div class=\"li-d\">"+E(cu.desc||"")+"</div></div><div class=\"li-a\"><button class=\"b bxs bd\" data-action=\"delCulture\" data-id=\""+cu.id+"\">\u2715</button></div></div>";
      });

    }else if(t==="system"){
      // === 体系CRUD: 查看/编辑当前剧本内的预设包（临时修改，不影响全局） ===
      if(!sc.presets||!sc.presets.length){sc.presets=[{id:"default",name:"\u6807\u51C6\u4F53\u7CFB",techs:J(DEF_TECHS),laws:J(DEF_LAWS),units:J(DEF_UNIT)}]}
      h+="<div style=\"font-size:.78rem;color:var(--tx3);margin-bottom:.5rem\">\u5267\u672C\u5185\u4F53\u7CFB\u526F\u672C\uFF0C\u4FEE\u6539\u4E0D\u5F71\u54CD\u5168\u5C40\u6A21\u677F</div>";
      sc.presets.forEach(function(p,pi){
        var tc=p.techs?p.techs.length:0;
        var uc=p.units?p.units.length:0;
        var lc2=0;if(p.laws){LAW_CATS.forEach(function(c2){lc2+=(p.laws[c2.id]||[]).length})}
        h+="<div class=\"li\" data-action=\"viewPreset\" data-idx=\""+pi+"\"><div class=\"li-i\"><div class=\"li-n\">\uD83C\uDF0D "+E(p.name)+"</div><div class=\"li-d\">"+tc+"\u79D1\u6280 "+uc+"\u5175\u79CD "+lc2+"\u6CD5\u5F8B</div></div></div>";
      });

    }else if(t==="settings"){
      h+="<div class=\"fr\"><label class=\"fl\">\u5267\u672C\u540D\u79F0</label><input class=\"fi\" id=\"setName\" value=\""+E(sc.name)+"\"></div>";
      h+="<div class=\"fr\"><label class=\"fl\">\u8D77\u59CB\u5E74\u4EFD</label><input type=\"number\" class=\"fi\" id=\"setYear\" value=\""+(sc.sy||1)+"\"></div>";
      h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u5730\u56FE\u5BBD(px)</label><input type=\"number\" class=\"fi\" id=\"setMapW\" value=\""+(sc.mapW||1495)+"\"></div><div class=\"fr\"><label class=\"fl\">\u5730\u56FE\u9AD8(px)</label><input type=\"number\" class=\"fi\" id=\"setMapH\" value=\""+(sc.mapH||1019)+"\"></div></div>";
      h+="<div class=\"fr\"><label class=\"fl\">\u66F4\u6362\u5730\u56FE\u5E95\u56FE</label><input type=\"file\" accept=\"image/*\" id=\"setMap\"></div>";
      h+="<div style=\"margin-top:.6rem;padding-top:.5rem;border-top:1px solid var(--bd)\">";
      h+="<div style=\"font-size:.85rem;font-weight:700;color:var(--bd3);margin-bottom:.3rem\">\uD83C\uDF0A \u6D77\u57DF\u68C0\u6D4B</div>";
      h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u6D77\u57DF\u989C\u8272</label><input type=\"color\" id=\"setSeaColor\" value=\""+(sc.seaColor||"#4a90d9")+"\" style=\"width:100%;height:30px;border:1px solid var(--bd);border-radius:4px\"></div>";
      h+="<div class=\"fr\"><label class=\"fl\">\u5BB9\u5DEE</label><input type=\"number\" class=\"fi\" id=\"setSeaTol\" value=\""+(sc.seaTolerance||35)+"\"></div></div>";
      h+="<div style=\"display:flex;gap:.3rem;margin-top:.3rem\"><button class=\"b bs bxs\" data-action=\"pickSeaColor\">\u5438\u53D6</button><button class=\"b bp bxs\" data-action=\"detectSea\">\u68C0\u6D4B\u6D77\u57DF</button></div>";
      if(sc.seaGrid){var seaN2=0;for(var si=0;si<sc.seaGrid.length;si++){if(sc.seaGrid.charAt(si)==="1")seaN2++}h+="<div style=\"font-size:.72rem;color:var(--green);margin-top:.2rem\">\u2713 \u5DF2\u68C0\u6D4B "+seaN2+"/"+(sc.seaGridW*sc.seaGridH)+"\u683C\u6D77\u57DF</div>"}
      h+="</div>";
      h+="<button class=\"b bs\" data-action=\"applySettings\" style=\"margin-top:.6rem;width:100%\">\u5E94\u7528\u8BBE\u7F6E</button>";
    }

    body.innerHTML=h;

    body.addEventListener("click",function(e){
      var target=e.target.closest("[data-action]");
      if(!target)return;
      var act=target.dataset.action;
      var id=target.dataset.id;
      if(act.indexOf("del")===0||act.indexOf("add")===0)e.stopPropagation();
      switch(act){
        case "addFaction":self.addFaction();break;
        case "editFaction":self.editFaction(id);break;
        case "delFaction":self.delFaction(id);break;
        case "selCity":self.selected={type:"city",id:id};self.render();self.showEntityEditor(self.selected);break;
        case "selBandit":self.selected={type:"bandit",id:id};self.render();self.showEntityEditor(self.selected);break;
        case "delBandit":self.deleteEntity({type:"bandit",id:id});break;
        case "addChar":self.addChar();break;
        case "editChar":self.editChar(id);break;
        case "delChar":self.delChar(id);break;
        case "addCulture":self.addCulture();break;
        case "editCulture":self.editCulture(id);break;
        case "delCulture":self.delCulture(id);break;
        case "viewPreset":self.viewScenarioPreset(parseInt(target.dataset.idx));break;
        case "applySettings":self.applySettings();break;
        case "pickSeaColor":self.pickSeaColor();break;
        case "detectSea":self.detectSea();break;
      }
    });

    if(t==="settings"&&Q("setMap")){
      Q("setMap").addEventListener("change",function(e){
        var f=e.target.files[0];if(!f)return;
        var r=new FileReader();
        r.onload=function(ev){sc.map=ev.target.result;self.map.load(sc.map);self.autoSave();notify("\u5730\u56FE\u5DF2\u66F4\u6362","ok")};
        r.readAsDataURL(f);
      });
    }
  },
