// ===== ui.js — 通知系统与弹窗 =====

// ===== NOTIFICATION =====
function notify(msg,type){
  // 游戏运行时用gNf，编辑器用nf
  var gNf=Q("gNf");
  var nf=Q("nf");
  var game=Q("game");
  var container=(game&&game.classList.contains("on")&&gNf)?gNf:nf;
  if(!container)return;
  var el=document.createElement("div");
  el.className="nfi "+(type||"");
  el.textContent=msg;
  container.appendChild(el);
  setTimeout(function(){if(el.parentNode)el.remove()},4000);
}

// ===== MODAL =====
var Modal={
  open:function(title,body,footer,wide){
    Q("mot").textContent=title;
    Q("mob").innerHTML=body;
    Q("mof").innerHTML=footer||"";
    Q("moc").classList.toggle("w",!!wide);
    Q("ov").classList.add("on");
  },
  close:function(){Q("ov").classList.remove("on")}
};
Q("moX").addEventListener("click",function(){Modal.close()});
Q("ov").addEventListener("click",function(e){if(e.target===Q("ov"))Modal.close()});
