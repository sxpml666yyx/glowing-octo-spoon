  // ===== game-panels.js — 科技/法律/外交面板 =====

  renderPanel:function(panelId){
    if(panelId==="gPanelTech")this.renderTechPanel();
    else if(panelId==="gPanelLaw")this.renderLawPanel();
    else if(panelId==="gPanelDiplo")this.renderDiploPanel();
  },

  // === 科技面板 ===
  renderTechPanel:function(){
    var self=this;
    var body=Q("gTechBody");
    var rd=this.researched[this.fid]||{};
    var res=this.researching[this.fid]||{techId:"",progress:0};
    var rp=this.getResearchPoints(this.fid);

    var h="<div style=\"font-size:.8rem;color:var(--tx3);margin-bottom:.5rem\">\u6BCF\u6708\u79D1\u7814\u70B9: <b>"+rp+"</b></div>";
    var myTechs=this.getFactionTechs(this.fid);
    if(res.techId){
      var ct=myTechs.find(function(t){return t.id===res.techId});
      if(ct){
        var pct=Math.min(100,Math.round(res.progress/ct.cost*100));
        h+="<div style=\"padding:.5rem;background:var(--goldBg);border:1px solid var(--gold);border-radius:5px;margin-bottom:.8rem;font-size:.82rem\">\u6B63\u5728\u7814\u7A76: <b>"+E(ct.name)+"</b> ("+pct+"%)<div class=\"g-tech-bar\"><div class=\"g-tech-bar-fill\" style=\"width:"+pct+"%\"></div></div></div>";
      }
    }

    TECH_ERAS.forEach(function(era){
      var techs=myTechs.filter(function(t){return t.era===era.id});
      if(!techs.length)return;
      h+="<div style=\"font-size:.78rem;font-weight:700;color:var(--gold);margin:.5rem 0 .2rem\">\u2606 "+E(era.name)+"</div>";
      techs.forEach(function(tech){
        var isRes=!!rd[tech.id];
        var isActive=res.techId===tech.id;
        // 检查前置是否满足
        var canResearch=!isRes&&tech.req.every(function(r){return!!rd[r]});
        var cls="g-tech-item"+(isRes?" researched":"")+(isActive?" active":"");
        h+="<div class=\""+cls+"\" data-tid=\""+tech.id+"\">";
        h+="<div><div style=\"font-weight:600\">"+E(tech.name)+(isRes?" \u2713":"")+"</div><div style=\"font-size:.72rem;color:var(--tx3)\">"+E(tech.desc||"")+" | \u8D39"+tech.cost+"</div></div>";
        if(canResearch&&!isActive)h+="<button class=\"b bxs bp tech-sel\" data-tid=\""+tech.id+"\">\u7814\u7A76</button>";
        h+="</div>";
      });
    });

    body.innerHTML=h;

    // 绑定研究按钮
    var btns=body.querySelectorAll(".tech-sel");
    for(var i=0;i<btns.length;i++){
      btns[i].addEventListener("click",function(e){
        e.stopPropagation();
        var tid=this.dataset.tid;
        self.researching[self.fid]={techId:tid,progress:0};
        notify("\u5F00\u59CB\u7814\u7A76\u79D1\u6280","ok");
        self.renderTechPanel();
      });
    }
  },

  // === 法律面板 ===
  renderLawPanel:function(){
    var self=this;
    var body=Q("gLawBody");
    var al=this.activeLaws[this.fid]||{};
    var rd=this.researched[this.fid]||{};

    var h="<div style=\"font-size:.8rem;color:var(--tx3);margin-bottom:.5rem\">\u70B9\u51FB\u5207\u6362\u6CD5\u5F8B\uFF08\u9700\u8981\u5BF9\u5E94\u79D1\u6280\uFF09</div>";
    var myLaws=this.getFactionLaws(this.fid);
    var myTechs=this.getFactionTechs(this.fid);
    LAW_CATS.forEach(function(cat){
      var laws=myLaws[cat.id];
      if(!laws||!laws.length)return;
      h+="<div class=\"g-law-cat\"><div class=\"g-law-cat-title\">"+cat.ico+" "+E(cat.name)+"</div>";
      laws.forEach(function(law,idx){
        var isActive=al[cat.id]===idx;
        var locked=false;
        var lockReason="";
        // 检查科技需求
        if(law.reqTech){
          if(!rd[law.reqTech]){
            locked=true;
            var reqT=myTechs.find(function(t){return t.id===law.reqTech});
            lockReason="\u9700\u8981\u79D1\u6280: "+(reqT?reqT.name:law.reqTech);
          }
        }
        var fxStr=Object.keys(law.fx||{}).map(function(k){return k+":"+((law.fx[k]>0?"+":"")+law.fx[k])+"%"}).join(" ");
        if(locked){
          h+="<div class=\"g-law-opt locked\" style=\"opacity:.4;cursor:not-allowed\" title=\""+E(lockReason)+"\"><span>\uD83D\uDD12 "+E(law.name)+"</span><span class=\"g-law-fx\">"+E(lockReason)+"</span></div>";
        }else{
          h+="<div class=\"g-law-opt"+(isActive?" active":"")+"\" data-cat=\""+cat.id+"\" data-idx=\""+idx+"\"><span>"+E(law.name)+"</span><span class=\"g-law-fx\">"+fxStr+"</span></div>";
        }
      });
      h+="</div>";
    });
    body.innerHTML=h;

    // 绑定切换（跳过locked）
    var opts=body.querySelectorAll(".g-law-opt:not(.locked)");
    for(var i=0;i<opts.length;i++){
      opts[i].addEventListener("click",function(){
        var catId=this.dataset.cat;
        var idx=parseInt(this.dataset.idx);
        if(!catId||isNaN(idx))return;
        if(!self.activeLaws[self.fid])self.activeLaws[self.fid]={};
        self.activeLaws[self.fid][catId]=idx;
        var fLaws=self.getFactionLaws(self.fid);
        var law=(fLaws[catId]||[])[idx];
        notify("\u6CD5\u5F8B\u5207\u6362: "+law.name,"info");
        self.renderLawPanel();
        self.updateHUD();
      });
    }
  },

  // === 外交面板 ===
  renderDiploPanel:function(){
    var self=this;
    var body=Q("gDiploBody");

    var h="<div style=\"font-size:.8rem;color:var(--tx3);margin-bottom:.5rem\">\u5916\u4EA4\u5173\u7CFB</div>";
    this.sc.factions.forEach(function(f){
      if(f.id===self.fid)return;
      var atWar=self.isAtWar(self.fid,f.id);
      h+="<div class=\"g-diplo-item\"><div><span class=\"fc\" style=\"background:"+f.col+"\"></span>"+E(f.name);
      if(atWar)h+=" <span class=\"tg tg-red\">\u6218\u4E89</span>";
      else h+=" <span class=\"tg tg-green\">\u548C\u5E73</span>";
      // 城池数和军力
      var cities=self.sc.cities.filter(function(c){return c.fid===f.id}).length;
      var mil=0;self.armies.forEach(function(a){if(a.fid===f.id)a.units.forEach(function(u){mil+=u.count})});
      h+="<div style=\"font-size:.72rem;color:var(--tx3)\">"+cities+"\u57CE | "+F(mil)+"\u5175 | \u91D1"+F(Math.round(f.gold))+"</div>";
      h+="</div><div>";
      if(atWar){
        h+="<button class=\"b bsm bs diplo-peace\" data-fid=\""+f.id+"\">\u6C42\u548C</button>";
      }else{
        h+="<button class=\"b bsm bd diplo-war\" data-fid=\""+f.id+"\">\u5BA3\u6218</button>";
      }
      h+="</div></div>";
    });
    body.innerHTML=h;

    // 绑定
    var warBtns=body.querySelectorAll(".diplo-war");
    for(var i=0;i<warBtns.length;i++){
      warBtns[i].addEventListener("click",function(){
        var fid=this.dataset.fid;
        var fac=self.sc.factions.find(function(f){return f.id===fid});
        if(!confirm("\u786E\u5B9A\u5411 "+(fac?fac.name:"")+"\u5BA3\u6218\uFF1F\u8FD9\u5C06\u65E0\u6CD5\u64A4\u56DE\uFF01"))return;
        self.declareWar(fid);
        self.renderDiploPanel();
      });
    }
    var peaceBtns=body.querySelectorAll(".diplo-peace");
    for(var j=0;j<peaceBtns.length;j++){
      peaceBtns[j].addEventListener("click",function(){
        var fid=this.dataset.fid;
        self.makePeace(fid);
        self.renderDiploPanel();
      });
    }
  },
