/*:
  @plugindesc ゴースト ver1.0
  @author うなぎおおとろ(http://twitter.com/unagiootoro8388)
  @help
  正体不明の敵キャラ「ゴースト」を実現するスクリプトです。
  このスクリプトが適用された敵キャラは指定された範囲内の他の敵キャラに
  化けて出現します。

  [使用方法]
  例えば、敵キャラＩＤ１、３、５の敵を正体の対象にしたい場合は
  敵キャラのメモ欄に
  <ゴースト 1, 3, 5>
  と記述してください。
  また、
  <ゴースト 1..20, 25, 30..40>
  というように記述した場合は、ＩＤ１～２０、２５、３０～４０
  までの敵キャラが正体となります。
*/

Game_Enemy.prototype.isGhost = function(){
    var note = $dataEnemies[this._enemyId].note;
    var enemyIds = [];
    if(this._isGhost === undefined){
        if(note.match(/^<ゴースト(.+)>/m)){
            var ary = RegExp.$1.replace(/\s\r\n/, "").split(",");
            var first, last;
            for(var i=0; i<ary.length; i++){
                if(ary[i].match(/(\d+)..(\d)/)){
                  first = parseInt(RegExp.$1);
                  last = parseInt(RegExp.$2);
                  for(var x=first; x<=last; x++){
                    enemyIds.push(x);
                  }
              }else{
                  enemyIds.push(parseInt(ary[i]));
              }
            }
            this._isGhost = enemyIds;
        }else{
          this._isGhost = false;
        }
    }
    return this._isGhost;
}

Game_Enemy.prototype.ghost__initialize = Game_Enemy.prototype.initialize;

Game_Enemy.prototype.initialize = function(enemyId, x, y){
    this._ghostEnemyId = enemyId;
    var enemyIds;
    this.ghost__initialize(enemyId, x, y);
    if(enemyIds = this.isGhost()){
        var i = Math.floor(Math.random() * enemyIds.length);
        this._enemyId = enemyIds[i];
        this._hp = this.mhp;
        this._mp = this.mmp;
    }
}

Game_Enemy.prototype.ghostEnemy = function(){
    return $dataEnemies[this._ghostEnemyId];
}

Game_Enemy.prototype.ghost__battlerName = Game_Enemy.prototype.battlerName;

Game_Enemy.prototype.battlerName = function() {
    if(this.isGhost()){
        return this.ghostEnemy().battlerName;
    }else{
        return this.ghost__battlerName();
    }
};

Game_Enemy.prototype.ghost__battlerHue = Game_Enemy.prototype.battlerHue;

Game_Enemy.prototype.battlerHue = function() {
    if(this.isGhost()){
        return this.ghostEnemy().battlerHue;
    }else{
        return this.ghost__battlerHue();
    }
};

Game_Enemy.prototype.ghost__originalName = Game_Enemy.prototype.originalName;

Game_Enemy.prototype.originalName = function() {
    if(this.isGhost()){
        return this.ghostEnemy().name;
    }else{
        return this.ghost__originalName();
    }
};
