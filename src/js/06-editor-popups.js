  // ===== editor-popups.js — 城池放置/实体编辑/港口属性 =====

  showCityTypePopup:function(mx,my){
    var self=this;
    var h="<div style=\"font-size:.88rem;font-weight:700;color:var(--bd3);margin-bottom:.5rem\">\u9009\u62E9\u57CE\u6C60\u7C7B\u578B</div>";
    h+="<div style=\"display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.7rem\">";
    CITY_TYPES.forEach(function(ct){
      h+="<button class=\"b bs\" style=\"font-size:.95rem;padding:.5rem 1rem\" data-ct=\""+ct.id+"\">"+E(ct.name)+"</button>";
    });
    h+="</div>";
    h+="<div class=\"fr\"><label class=\"fl\">\u6240\u5C5E\u52BF\u529B</label><select class=\"fsel\" id=\"popFac\">";
    h+="<option value=\"\">\u65E0</option>";
    this.sc.factions.forEach(function(f){
      h+="<option value=\""+f.id+"\">"+E(f.name)+"</option>";
    });
    h+="</select></div>";
    h+="<div class=\"fr\"><label style=\"font-size:.82rem;display:flex;align-items:center;gap:.4rem;cursor:pointer\"><input type=\"checkbox\" id=\"popPort\"> \u6E2F\u53E3\u57CE\u5E02\uFF08\u53EF\u5EFA\u9020\u6D77\u519B\uFF09</label></div>";

    Modal.open("\u653E\u7F6E\u57CE\u6C60",h,"<button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button>");

    var btns=Q("mob").querySelectorAll("[data-ct]");
    for(var i=0;i<btns.length;i++){
      btns[i].addEventListener("click",function(){
        var ct=this.dataset.ct;
        var type=CITY_TYPES.find(function(t){return t.id===ct});
        var fid2=Q("popFac")?Q("popFac").value:"";
        var isPort=Q("popPort")?Q("popPort").checked:false;
        var city={id:U(),name:(type?type.name:"\u57CE\u6C60")+(self.sc.cities.length+1),x:mx,y:my,type:ct,fid:fid2,
          pop:ct==="capital"?50000:ct==="town"?15000:ct==="castle"?5000:3000,
          eco:ct==="capital"?5:ct==="town"?3:ct==="castle"?1:1,
          def:ct==="castle"?30:ct==="capital"?20:ct==="town"?10:3,
          gar:ct==="castle"?500:ct==="capital"?200:50,cul:"",port:isPort};
        self.sc.cities.push(city);
        Modal.close();
        notify(city.name+" \u5DF2\u653E\u7F6E","ok");
        self.autoSave();self.render();self.renderSide();
      });
    }
  },

  showEntityEditor:function(ent){
    var sc=this.sc;var self=this;
    if(ent.type==="city"){
      var c=sc.cities.find(function(x){return x.id===ent.id});
      if(!c)return;
      var typeOpts=CITY_TYPES.map(function(t){return "<option value=\""+t.id+"\""+(t.id===c.type?" selected":"")+">"+E(t.name)+"</option>"}).join("");
      var facOpts="<option value=\"\">\u65E0</option>"+sc.factions.map(function(f){return "<option value=\""+f.id+"\""+(f.id===c.fid?" selected":"")+">"+E(f.name)+"</option>"}).join("");
      var culOpts="<option value=\"\">\u65E0</option>"+sc.cultures.map(function(cu){return "<option value=\""+cu.id+"\""+(cu.id===c.cul?" selected":"")+">"+E(cu.name)+"</option>"}).join("");

      var h="<div class=\"fr\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"ec_n\" value=\""+E(c.name)+"\"></div>";
      h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u7C7B\u578B</label><select class=\"fsel\" id=\"ec_t\">"+typeOpts+"</select></div><div class=\"fr\"><label class=\"fl\">\u52BF\u529B</label><select class=\"fsel\" id=\"ec_f\">"+facOpts+"</select></div></div>";
      h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u4EBA\u53E3</label><input type=\"number\" class=\"fi\" id=\"ec_p\" value=\""+c.pop+"\"></div><div class=\"fr\"><label class=\"fl\">\u7ECF\u6D4E</label><input type=\"number\" class=\"fi\" id=\"ec_e\" value=\""+c.eco+"\"></div></div>";
      h+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u9632\u5FA1</label><input type=\"number\" class=\"fi\" id=\"ec_d\" value=\""+c.def+"\"></div><div class=\"fr\"><label class=\"fl\">\u9A7B\u519B</label><input type=\"number\" class=\"fi\" id=\"ec_g\" value=\""+(c.gar||0)+"\"></div></div>";
      h+="<div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><select class=\"fsel\" id=\"ec_cu\">"+culOpts+"</select></div>";
      h+="<div class=\"fr\"><label style=\"font-size:.85rem;display:flex;align-items:center;gap:.5rem;cursor:pointer\"><input type=\"checkbox\" id=\"ec_port\""+(c.port?" checked":"")+">\u2693 \u6E2F\u53E3\u57CE\u5E02\uFF08\u53EF\u5EFA\u9020\u6D77\u519B\uFF09</label></div>";

      Modal.open("\u7F16\u8F91\u57CE\u6C60: "+E(c.name),h,"<button class=\"b bd\" id=\"ecDel\">\u5220\u9664</button><button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"ecSave\">\u4FDD\u5B58</button>");

      Q("ecSave").addEventListener("click",function(){
        c.name=Q("ec_n").value||c.name;c.type=Q("ec_t").value;c.fid=Q("ec_f").value;
        c.pop=Math.max(0,parseInt(Q("ec_p").value))||c.pop;c.eco=CL(parseInt(Q("ec_e").value)||1,1,100);
        c.def=Math.max(0,parseInt(Q("ec_d").value)||0);c.gar=Math.max(0,parseInt(Q("ec_g").value)||0);
        c.cul=Q("ec_cu").value;c.port=Q("ec_port")?Q("ec_port").checked:false;
        self.autoSave();Modal.close();self.render();self.renderSide();notify("\u57CE\u6C60\u5DF2\u66F4\u65B0","ok");
      });
      Q("ecDel").addEventListener("click",function(){self.deleteEntity(ent);Modal.close()});

    }else if(ent.type==="bandit"){
      var b=sc.bandits.find(function(x){return x.id===ent.id});
      if(!b)return;
      var culOpts2="<option value=\"\">\u65E0</option>"+sc.cultures.map(function(cu){return "<option value=\""+cu.id+"\""+(cu.id===b.cul?" selected":"")+">"+E(cu.name)+"</option>"}).join("");
      var facOpts2="<option value=\"\">\u65E0(\u72EC\u7ACB\u5320\u5BC7)</option>"+sc.factions.map(function(f){return "<option value=\""+f.id+"\""+(f.id===b.fid?" selected":"")+">"+E(f.name)+"</option>"}).join("");
      var h2="<div class=\"frr\"><div class=\"fr\" style=\"flex:3\"><label class=\"fl\">\u540D\u79F0</label><input class=\"fi\" id=\"eb_n\" value=\""+E(b.name)+"\"></div><div class=\"fr\" style=\"flex:1\"><label class=\"fl\">\u56FE\u6807</label><input class=\"fi\" id=\"eb_ico\" value=\""+E(b.ico||"\uD83D\uDC80")+"\" style=\"text-align:center;font-size:1.1rem\"></div></div>";
      h2+="<div class=\"frr\"><div class=\"fr\"><label class=\"fl\">\u5175\u529B</label><input type=\"number\" class=\"fi\" id=\"eb_num\" value=\""+b.n+"\"></div><div class=\"fr\"><label class=\"fl\">\u653B\u51FB</label><input type=\"number\" class=\"fi\" id=\"eb_a\" value=\""+b.atk+"\"></div><div class=\"fr\"><label class=\"fl\">\u9632\u5FA1</label><input type=\"number\" class=\"fi\" id=\"eb_d\" value=\""+b.def+"\"></div></div>";
      h2+="<div class=\"fr\"><label class=\"fl\">\u6587\u5316</label><select class=\"fsel\" id=\"eb_cul\">"+culOpts2+"</select></div>";
      h2+="<div class=\"fr\"><label class=\"fl\">\u6240\u5C5E\u52BF\u529B</label><select class=\"fsel\" id=\"eb_fac\">"+facOpts2+"</select></div>";
      Modal.open("\u7F16\u8F91\u5320\u5BC7\u636E\u70B9: "+E(b.name),h2,"<button class=\"b bd\" id=\"ebDel\">\u5220\u9664</button><button class=\"b bs\" onclick=\"Modal.close()\">\u53D6\u6D88</button><button class=\"b bp\" id=\"ebSave\">\u4FDD\u5B58</button>");
      Q("ebSave").addEventListener("click",function(){
        b.name=Q("eb_n").value||b.name;b.ico=Q("eb_ico")?Q("eb_ico").value:"\uD83D\uDC80";
        b.n=Math.max(1,parseInt(Q("eb_num").value))||b.n;
        b.atk=Math.max(0,parseInt(Q("eb_a").value))||b.atk;
        b.def=Math.max(0,parseInt(Q("eb_d").value))||b.def;
        b.cul=Q("eb_cul").value;b.fid=Q("eb_fac").value;
        self.autoSave();Modal.close();self.render();self.renderSide();notify("\u5320\u5BC7\u5DF2\u66F4\u65B0","ok");
      });
      Q("ebDel").addEventListener("click",function(){self.deleteEntity(ent);Modal.close()});
    }
  },
