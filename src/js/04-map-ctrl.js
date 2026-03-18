// ===== map-ctrl.js — 地图控制器(左键拖拽+点击共存) =====

function MapCtrl(containerId,canvasId,imgId,miniId,miniImgId,miniVpId){
  var self=this;
  this.s=1;this.ox=0;this.oy=0;this.iw=0;this.ih=0;
  this.con=Q(containerId);this.cvs=Q(canvasId);this.img=Q(imgId);
  this.mini=Q(miniId);this.miniImg=Q(miniImgId);this.miniVp=Q(miniVpId);
  this.onClick=null;
  this._dragging=false;
  this._startX=0;this._startY=0;
  this._moved=false;
  this.entityClicked=false; // 实体标记设置此标志防止穿透

  // mousedown: 开始拖拽追踪
  this.con.addEventListener("mousedown",function(e){
    if(e.target.closest(".ed-toolbar,.ed-side,.ed-mini,.ed-status,.g-panel,.g-actions,.g-mini,.g-hud,.g-nf,.nf"))return;
    self._dragging=true;
    self._moved=false;
    self._startX=e.clientX;self._startY=e.clientY;
    self._lastX=e.clientX;self._lastY=e.clientY;
    e.preventDefault();
  });

  // mousemove: 超过5px阈值才开始实际拖拽
  window.addEventListener("mousemove",function(e){
    if(!self._dragging)return;
    var dx=e.clientX-self._startX;
    var dy=e.clientY-self._startY;
    if(!self._moved&&(Math.abs(dx)>5||Math.abs(dy)>5)){
      self._moved=true;
      self.con.style.cursor="grabbing";
    }
    if(self._moved){
      self.ox+=e.clientX-self._lastX;
      self.oy+=e.clientY-self._lastY;
      self.apply();
    }
    self._lastX=e.clientX;self._lastY=e.clientY;
  });

  // mouseup: 结束拖拽；如果没有移动过则触发点击
  window.addEventListener("mouseup",function(e){
    if(!self._dragging)return;
    self._dragging=false;
    self.con.style.cursor="";

    // 如果实体已经处理了点击，跳过
    if(self.entityClicked){self.entityClicked=false;self._moved=false;return}

    // 没有拖拽过 → 视为点击
    if(!self._moved&&self.onClick){
      var ig=e.target.closest(".ed-toolbar,.ed-side,.ed-mini,.ed-status,.g-panel,.g-actions,.g-mini,.g-hud,.g-nf,.nf,button,.b");
      if(!ig){
        var r=self.con.getBoundingClientRect();
        var mx=(e.clientX-r.left-self.ox)/self.s;
        var my=(e.clientY-r.top-self.oy)/self.s;
        self.onClick(mx,my,e);
      }
    }
    self._moved=false;
  });

  // 滚轮缩放
  this.con.addEventListener("wheel",function(e){
    e.preventDefault();
    var r=self.con.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var os=self.s;
    self.s=CL(self.s*(e.deltaY>0?.88:1.12),.08,10);
    var rt=self.s/os;
    self.ox=mx-(mx-self.ox)*rt;self.oy=my-(my-self.oy)*rt;
    self.apply();
  },{passive:false});

  this.con.addEventListener("contextmenu",function(e){e.preventDefault()});

  this.img.onload=function(){
    self.iw=self.img.naturalWidth;self.ih=self.img.naturalHeight;
    var cw=self.con.clientWidth,ch=self.con.clientHeight;
    self.s=Math.min(cw/self.iw,ch/self.ih)*.85;
    self.ox=(cw-self.iw*self.s)/2;self.oy=(ch-self.ih*self.s)/2;
    self.apply();self.miniImg.src=self.img.src;
  };
}
MapCtrl.prototype.load=function(src){this.img.src=src};
MapCtrl.prototype.apply=function(){
  this.cvs.style.transform="translate("+this.ox+"px,"+this.oy+"px) scale("+this.s+")";
  if(!this.iw)return;
  var mw=this.mini.clientWidth,mh=this.mini.clientHeight;
  var sx=mw/this.iw,sy=mh/this.ih;
  var cw=this.con.clientWidth,ch=this.con.clientHeight;
  var vp=this.miniVp;
  vp.style.width=CL((cw/this.s)*sx,3,mw)+"px";
  vp.style.height=CL((ch/this.s)*sy,3,mh)+"px";
  vp.style.left=CL((-this.ox/this.s)*sx,0,mw)+"px";
  vp.style.top=CL((-this.oy/this.s)*sy,0,mh)+"px";
};
