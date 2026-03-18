  // ===== editor-render.js — 地图实体渲染 =====

  render:function(){
    var sc=this.sc;var cvs=this.map.cvs;var self=this;
    var old=cvs.querySelectorAll(".city-mk,.bm");
    for(var i=0;i<old.length;i++)old[i].remove();

    // 城池
    sc.cities.forEach(function(c){
      var ct=CITY_TYPES.find(function(t){return t.id===c.type})||CITY_TYPES[0];
      var fac=sc.factions.find(function(f){return f.id===c.fid});
      var col=fac?fac.col:"#888";
      var sz=ct.size||10;
      var el=document.createElement("div");
      el.className="city-mk"+(self.selected&&self.selected.type==="city"&&self.selected.id===c.id?" selected":"");
      el.style.cssText="left:"+c.x+"px;top:"+c.y+"px";
      var dot=document.createElement("div");
      dot.className="city-dot "+(ct.shape||"circle");
      dot.style.cssText="width:"+sz+"px;height:"+sz+"px;background:"+col;
      el.appendChild(dot);
      var lbl=document.createElement("div");
      lbl.className="city-lbl";
      lbl.textContent=(c.port?"\u2693":"") +c.name;
      el.appendChild(lbl);
      el.addEventListener("mousedown",function(e){
        e.stopPropagation(); // 阻止地图拖拽
        self.map.entityClicked=true;
        self.onMapClick(c.x,c.y,e);
      });
      cvs.appendChild(el);
    });

    // 匪寇(显示图标+名称)
    sc.bandits.forEach(function(b){
      var el=document.createElement("div");
      el.className="bm";
      el.style.cssText="position:absolute;transform:translate(-50%,-50%);left:"+b.x+"px;top:"+b.y+"px;cursor:pointer;z-index:4;text-align:center";
      el.innerHTML="<div style=\"font-size:1rem;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))\">"+(b.ico||"\uD83D\uDC80")+"</div><div class=\"city-lbl\" style=\"font-size:.55rem\">"+E(b.name)+"</div>";
      el.addEventListener("mousedown",function(e){
        e.stopPropagation();
        self.map.entityClicked=true;
        self.onMapClick(b.x,b.y,e);
      });
      cvs.appendChild(el);
    });
  },
