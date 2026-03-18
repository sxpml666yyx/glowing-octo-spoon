  // ===== game-military.js — 军队移动/战斗/攻城/匪寇 =====

  moveArmies:function(){
    var self=this;
    this.armies.forEach(function(a){
      if(!a.moving)return;
      // 计算军队平均移速(取最慢单位)
      var minSpd=99;
      var hasNaval=false,hasLand=false,hasAir=false;
      a.units.forEach(function(u){
        var unit=self.sc.units.find(function(x){return x.id===u.uid});
        if(unit){
          var s=unit.spd||2;if(s<minSpd)minSpd=s;
          if(unit.tp==="naval")hasNaval=true;
          if(unit.tp==="land")hasLand=true;
          if(unit.tp==="air")hasAir=true;
        }
      });
      var mods=self.getFactionMods(a.fid);
      var spd=minSpd*(1+(mods.speed||0)/100);

      var dx=a.targetX-a.x,dy=a.targetY-a.y;
      var dist=Math.hypot(dx,dy);
      if(dist<spd+1){
        a.x=a.targetX;a.y=a.targetY;a.moving=false;
      }else{
        var nx=a.x+dx/dist*spd;
        var ny=a.y+dy/dist*spd;

        // 地形检测(如果有seaGrid)
        if(self.sc.seaGrid&&!hasAir){
          var onSea=self.isPointSea(nx,ny);
          if(hasNaval&&!hasLand&&!onSea){
            // 纯海军不能上陆地
            a.moving=false;
            if(a.fid===self.fid)notify("\u6D77\u519B\u65E0\u6CD5\u767B\u9646\uFF01","war");
            return;
          }
          if(hasLand&&!hasNaval&&onSea){
            // 纯陆军在海上减速50%
            spd=spd*0.5;
            nx=a.x+dx/dist*spd;
            ny=a.y+dy/dist*spd;
          }
        }
        a.x=nx;a.y=ny;
      }
    });
  },

  // 检测某点是否在海域(O(1)网格查询)
  isPointSea:function(px,py){
    var sc=this.sc;
    if(!sc.seaGrid||!sc.seaGridW)return false;
    var gx=Math.floor(px/sc.seaStep);
    var gy=Math.floor(py/sc.seaStep);
    if(gx<0||gy<0||gx>=sc.seaGridW||gy>=sc.seaGridH)return false;
    return sc.seaGrid.charAt(gy*sc.seaGridW+gx)==="1";
  },

  checkBattles:function(){
    var self=this;
    // 军队vs军队
    for(var i=0;i<this.armies.length;i++){
      var a=this.armies[i];
      if(!a||self.getArmyTotal(a)<=0)continue;
      for(var j=i+1;j<this.armies.length;j++){
        var b=this.armies[j];
        if(!b||self.getArmyTotal(b)<=0)continue;
        if(a.fid===b.fid)continue;
        if(!self.isAtWar(a.fid,b.fid))continue;
        if(Math.hypot(a.x-b.x,a.y-b.y)>30)continue;
        var key=[a.id,b.id].sort().join("-");
        if(self.battleCooldown[key]&&self.tick-self.battleCooldown[key]<8)continue;
        self.doBattle(a,b);
        self.battleCooldown[key]=self.tick;
      }
    }

    // 军队vs匪寇
    for(var k=0;k<this.armies.length;k++){
      var army=this.armies[k];
      if(!army||self.getArmyTotal(army)<=0)continue;
      for(var m=0;m<this.sc.bandits.length;m++){
        var ban=this.sc.bandits[m];
        if(!ban||ban.n<=0)continue;
        if(Math.hypot(army.x-ban.x,army.y-ban.y)>25)continue;
        var bkey="b_"+army.id+"_"+ban.id;
        if(self.battleCooldown[bkey]&&self.tick-self.battleCooldown[bkey]<15)continue;
        self.doBanditBattle(army,ban);
        self.battleCooldown[bkey]=self.tick;
      }
    }

    // 军队攻城
    for(var n=0;n<this.armies.length;n++){
      var sa=this.armies[n];
      if(!sa||self.getArmyTotal(sa)<=0||sa.moving)continue;
      self.checkSiege(sa);
    }

    // 清除空军队 + 击杀绑定人物
    var deadArmyIds={};
    this.armies.forEach(function(a){
      if(self.getArmyTotal(a)<=0)deadArmyIds[a.id]=true;
    });
    if(Object.keys(deadArmyIds).length){
      (this.sc.characters||[]).forEach(function(ch){
        if(ch.alive!==false&&ch.bindType==="army"&&deadArmyIds[ch.bindId]){
          ch.alive=false;
          if(ch.fid===self.fid)notify("\u4EBA\u7269 "+ch.name+" \u968F\u519B\u961F\u8986\u706D\uFF01","war");
        }
      });
    }
    this.armies=this.armies.filter(function(a){return self.getArmyTotal(a)>0});
  },

  getArmyTotal:function(army){
    var t=0;if(!army||!army.units)return 0;
    army.units.forEach(function(u){t+=u.count});return t;
  },

  getArmyStrength:function(army,fid){
    var self=this;var atk=0,def=0;
    var mods=this.getFactionMods(fid);
    army.units.forEach(function(u){
      var unit=self.sc.units.find(function(x){return x.id===u.uid});
      if(unit){
        atk+=unit.atk*u.count;
        def+=unit.def*u.count;
      }
    });
    // 人物统帅加成: 绑定此军队的人物cmd属性
    var cmdBonus=0;
    (this.sc.characters||[]).forEach(function(ch){
      if(ch.alive!==false&&ch.bindType==="army"&&ch.bindId===army.id&&ch.sk){
        cmdBonus+=((ch.sk.cmd||50)-50)/100;
      }
    });
    return{
      atk:Math.round(atk*(1+(mods.atk||0)/100+cmdBonus)),
      def:Math.round(def*(1+(mods.def||0)/100+cmdBonus*0.5)),
      total:self.getArmyTotal(army)
    };
  },

  doBattle:function(a,b){
    var self=this;
    var sa=this.getArmyStrength(a,a.fid);
    var sb=this.getArmyStrength(b,b.fid);

    // 伤亡公式：攻击方造成 atk*0.2 ~ atk*0.4 的伤害，被防御减免
    var dmgToB=Math.max(1,Math.round((sa.atk*R(20,40)/100)-(sb.def*0.08)));
    var dmgToA=Math.max(1,Math.round((sb.atk*R(20,40)/100)-(sa.def*0.08)));

    this.applyDamage(b,dmgToB);
    this.applyDamage(a,dmgToA);

    // 战败方后退
    var taAfter=this.getArmyTotal(a);
    var tbAfter=this.getArmyTotal(b);
    if(taAfter<tbAfter&&taAfter>0){a.x+=R(-30,30);a.y+=R(-30,30);a.moving=false}
    if(tbAfter<taAfter&&tbAfter>0){b.x+=R(-30,30);b.y+=R(-30,30);b.moving=false}

    // 通知（只通知玩家相关的）
    if(a.fid===this.fid||b.fid===this.fid){
      var facA=this.sc.factions.find(function(f){return f.id===a.fid});
      var facB=this.sc.factions.find(function(f){return f.id===b.fid});
      notify("\u2694 "+(facA?facA.name:"?")+"\u2694"+(facB?facB.name:"?")+" \u6b8b"+F(taAfter)+"vs"+F(tbAfter),"war");
    }
  },

  doBanditBattle:function(army,bandit){
    var self=this;
    var sa=this.getArmyStrength(army,army.fid);
    var banditStr=bandit.atk*bandit.n;
    var banditDef=bandit.def*bandit.n;

    var dmgToBandit=Math.max(1,Math.round(sa.atk*0.3-banditDef*0.05));
    var dmgToArmy=Math.max(1,Math.round(banditStr*0.2-sa.def*0.05));

    this.applyDamage(army,dmgToArmy);
    var killed=Math.min(bandit.n,Math.round(dmgToBandit/Math.max(1,bandit.def)));
    bandit.n=Math.max(0,bandit.n-killed);

    if(army.fid===this.fid){
      if(bandit.n<=0){
        notify("\u5320\u5BC7 "+bandit.name+" \u88AB\u6D88\u706D\uFF01","ok");
      }else{
        notify("\u4E0E "+bandit.name+" \u4EA4\u6218\uFF0C\u5320\u5BC7\u6b8b"+bandit.n,"war");
      }
    }
  },

  applyDamage:function(army,dmg){
    var total=this.getArmyTotal(army);
    if(total<=0||dmg<=0)return;
    // 按比例分配伤亡给各兵种
    army.units.forEach(function(u){
      var ratio=u.count/total;
      var loss=Math.min(u.count,Math.max(1,Math.round(dmg*ratio)));
      u.count=Math.max(0,u.count-loss);
    });
    army.units=army.units.filter(function(u){return u.count>0});
  },

  checkSiege:function(army){
    var self=this;
    this.sc.cities.forEach(function(c){
      if(c.fid===army.fid)return; // 自己的城
      if(Math.hypot(c.x-army.x,c.y-army.y)>35)return; // 太远
      // 必须处于战争状态（或城池无主）
      if(c.fid&&!self.isAtWar(army.fid,c.fid))return;

      var skey="siege_"+army.id+"_"+c.id;
      if(self.battleCooldown[skey]&&self.tick-self.battleCooldown[skey]<15)return;
      self.battleCooldown[skey]=self.tick;

      var sa=self.getArmyStrength(army,army.fid);
      var mods=self.getFactionMods(army.fid);
      var siegeBonus=1+(mods.siege||0)/100;
      var attackPower=Math.round(sa.atk*siegeBonus);
      var cityDef=(c.def||10)*10+(c.gar||0)*3;

      if(attackPower>cityDef){
        // 攻克！
        var losses=Math.round(self.getArmyTotal(army)*R(8,18)/100);
        self.applyDamage(army,losses);
        var oldFid=c.fid;
        c.fid=army.fid;
        c.gar=0;
        c.def=Math.max(5,Math.round(c.def*0.7));

        // 驻城人物死亡
        (self.sc.characters||[]).forEach(function(ch){
          if(ch.alive!==false&&ch.bindType==="city"&&ch.bindId===c.id&&ch.fid===oldFid){
            ch.alive=false;
            if(oldFid===self.fid)notify("\u4EBA\u7269 "+ch.name+" \u5728 "+c.name+" \u9635\u4EA1\uFF01","war");
          }
        });

        if(army.fid===self.fid){
          notify("\u2694 \u653B\u514B "+c.name+"\uFF01","ok");
        }else if(oldFid===self.fid){
          notify("\u2694 "+c.name+" \u5931\u5B88\uFF01","war");
        }
      }else{
        // 攻城失败，双方损耗
        var armyLoss=Math.round(self.getArmyTotal(army)*R(5,12)/100);
        self.applyDamage(army,armyLoss);
        c.gar=Math.max(0,(c.gar||0)-Math.round(attackPower*0.02));

        if(army.fid===self.fid){
          notify("\u653B\u57CE "+c.name+" \u53D7\u963B\uFF0C\u635F\u5931"+armyLoss,"war");
        }
      }
    });
  },

  wanderBandits:function(){
    this.sc.bandits.forEach(function(b){
      if(b.n<=0)return;
      b.x+=R(-12,12);
      b.y+=R(-12,12);
    });
  },

  isAtWar:function(fidA,fidB){
    if(!fidA||!fidB)return false;
    return this.wars.some(function(w){
      return(w.a===fidA&&w.b===fidB)||(w.a===fidB&&w.b===fidA);
    });
  },

  declareWar:function(targetFid){
    if(this.isAtWar(this.fid,targetFid))return;
    this.wars.push({a:this.fid,b:targetFid});
    var fac=this.sc.factions.find(function(f){return f.id===targetFid});
    notify("\u5411 "+(fac?fac.name:"\u672A\u77E5")+" \u5BA3\u6218\uFF01","war");
  },

  makePeace:function(targetFid){
    var self=this;
    this.wars=this.wars.filter(function(w){
      return!((w.a===self.fid&&w.b===targetFid)||(w.a===targetFid&&w.b===self.fid));
    });
    var fac=this.sc.factions.find(function(f){return f.id===targetFid});
    notify("\u4E0E "+(fac?fac.name:"\u672A\u77E5")+" \u8BAE\u548C","ok");
  },
