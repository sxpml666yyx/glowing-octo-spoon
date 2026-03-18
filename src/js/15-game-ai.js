  // ===== game-ai.js — AI系统：自动招兵/经济/宣战/攻城/剿匪 =====

  aiTick:function(){
    var self=this;
    this.sc.factions.forEach(function(f){
      if(f.id===self.fid)return; // 跳过玩家

      // AI自动选择研究
      var res=self.researching[f.id];
      if(res&&!res.techId){
        var rd=self.researched[f.id]||{};
        var available=self.getFactionTechs(f.id).filter(function(t){
          return!rd[t.id]&&t.req.every(function(r){return!!rd[r]});
        });
        if(available.length){
          res.techId=available[Math.floor(Math.random()*available.length)].id;
          res.progress=0;
        }
      }

      // AI招兵(有钱时)
      if(f.gold>300&&Math.random()<0.3){
        var myCities=self.sc.cities.filter(function(c){return c.fid===f.id});
        if(myCities.length){
          var city=P(myCities);
          var cheapUnits=self.sc.units.filter(function(u){return u.tp!=="bandit"&&u.cost<=f.gold*0.3&&(u.cul==="\u901A\u7528"||true)});
          if(cheapUnits.length){
            var unit=P(cheapUnits);
            var count=Math.min(50,Math.floor(f.gold*0.15/unit.cost));
            if(count>0){
              f.gold-=unit.cost*count;
              var army=self.armies.find(function(a){return a.fid===f.id&&Math.hypot(a.x-city.x,a.y-city.y)<30&&!a.moving});
              if(!army){
                army={id:U(),fid:f.id,units:[],x:city.x,y:city.y+15,targetX:0,targetY:0,moving:false};
                self.armies.push(army);
              }
              var eu=army.units.find(function(x){return x.uid===unit.id});
              if(eu)eu.count+=count;else army.units.push({uid:unit.id,count:count});
            }
          }
        }
      }

      // AI宣战（实力比较）
      if(Math.random()<0.05){
        var myStr=self.getAIFactionStrength(f.id);
        self.sc.factions.forEach(function(target){
          if(target.id===f.id)return;
          if(self.isAtWar(f.id,target.id))return;
          var tStr=self.getAIFactionStrength(target.id);
          // 只在明显优势时宣战
          if(myStr>tStr*1.5&&Math.random()<0.2){
            self.wars.push({a:f.id,b:target.id});
            if(target.id===self.fid){
              var facName=f.name||"\u672A\u77E5";
              notify(facName+" \u5411\u6211\u4EEC\u5BA3\u6218\uFF01","war");
            }
          }
        });
      }

      // AI求和（弱势时）
      if(Math.random()<0.08){
        self.wars.forEach(function(w){
          var enemyId=(w.a===f.id)?w.b:((w.b===f.id)?w.a:null);
          if(!enemyId)return;
          var myStr2=self.getAIFactionStrength(f.id);
          var eStr=self.getAIFactionStrength(enemyId);
          if(myStr2<eStr*0.4&&Math.random()<0.3){
            // AI求和
            self.wars=self.wars.filter(function(ww){
              return!((ww.a===f.id&&ww.b===enemyId)||(ww.a===enemyId&&ww.b===f.id));
            });
            if(enemyId===self.fid){
              notify(f.name+" \u8BF7\u6C42\u8BAE\u548C\uFF0C\u5DF2\u63A5\u53D7","ok");
            }
          }
        });
      }

      // AI军队移动：攻击敌方城池
      self.armies.forEach(function(a){
        if(a.fid!==f.id||a.moving)return;
        var total=self.getArmyTotal(a);
        if(total<10)return;

        // 寻找可攻击的敌方城池
        var targets=self.sc.cities.filter(function(c){
          return c.fid!==f.id&&self.isAtWar(f.id,c.fid);
        });
        // 或者无主城池
        var neutral=self.sc.cities.filter(function(c){return!c.fid});
        targets=targets.concat(neutral);

        if(targets.length&&Math.random()<0.4){
          // 选最近的
          var best=null,bestDist=Infinity;
          targets.forEach(function(c){
            var d=Math.hypot(c.x-a.x,c.y-a.y);
            if(d<bestDist){bestDist=d;best=c}
          });
          if(best){
            a.targetX=best.x;a.targetY=best.y;a.moving=true;
          }
        }
      });

      // AI剿匪
      if(Math.random()<0.1){
        self.armies.forEach(function(a){
          if(a.fid!==f.id||a.moving)return;
          var total=self.getArmyTotal(a);
          if(total<20)return;
          // 寻找附近匪寇
          var nearBandit=null,nearDist=200;
          self.sc.bandits.forEach(function(b){
            if(b.n<=0)return;
            var d=Math.hypot(b.x-a.x,b.y-a.y);
            if(d<nearDist){nearDist=d;nearBandit=b}
          });
          if(nearBandit){
            a.targetX=nearBandit.x;a.targetY=nearBandit.y;a.moving=true;
          }
        });
      }

      // 匪寇与军队碰撞检测
      self.armies.forEach(function(a){
        self.sc.bandits.forEach(function(b){
          if(b.n<=0)return;
          if(Math.hypot(a.x-b.x,a.y-b.y)>25)return;
          // 战斗
          var armyStr=0;
          a.units.forEach(function(u){
            var unit=self.sc.units.find(function(x){return x.id===u.uid});
            if(unit)armyStr+=unit.atk*u.count;
          });
          var banditStr=b.atk*b.n;
          if(armyStr>banditStr*0.5){
            var losses=Math.round(self.getArmyTotal(a)*0.05);
            self.applyDamage(a,losses);
            b.n=Math.max(0,b.n-Math.round(b.n*0.6));
            if(a.fid===self.fid){
              notify("\u6211\u519B\u4E0E "+b.name+" \u4EA4\u6218\uFF01","war");
            }
          }else{
            var losses2=Math.round(self.getArmyTotal(a)*0.15);
            self.applyDamage(a,losses2);
            b.n=Math.max(0,b.n-Math.round(b.n*0.2));
          }
        });
      });
    });
  },

  getAIFactionStrength:function(fid){
    var self=this;
    var str=0;
    this.sc.cities.forEach(function(c){if(c.fid===fid)str+=c.pop/100+c.def});
    this.armies.forEach(function(a){
      if(a.fid===fid){
        a.units.forEach(function(u){
          var unit=self.sc.units.find(function(x){return x.id===u.uid});
          if(unit)str+=unit.atk*u.count;
        });
      }
    });
    return str;
  },
