// ===== utils.js — 工具函数与存储 =====

var Q=function(id){return document.getElementById(id)};
var U=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
var P=function(a){return a.length?a[Math.floor(Math.random()*a.length)]:null};
var R=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};
var CL=function(v,a,b){return Math.max(a,Math.min(b,v))};
var F=function(n){if(n==null)return "0";var a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(1)+"B";if(a>=1e6)return(n/1e6).toFixed(1)+"M";if(a>=1e3)return(n/1e3).toFixed(1)+"K";return String(Math.round(n))};
var E=function(s){var d=document.createElement("div");d.textContent=s||"";return d.innerHTML};
var J=function(o){return JSON.parse(JSON.stringify(o))};

// Storage
var LS={
  set:function(k,v){try{localStorage.setItem("ic_"+k,JSON.stringify(v));return true}catch(e){return false}},
  get:function(k){try{var d=localStorage.getItem("ic_"+k);return d?JSON.parse(d):null}catch(e){return null}},
  del:function(k){localStorage.removeItem("ic_"+k)},
  keys:function(pre){var r=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("ic_"+pre)===0)r.push(k.slice(3))}return r}
};
