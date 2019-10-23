/*:
@plugindesc 上位ステート ver1.1
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388?lang=ja)
@help
毒状態のときに毒攻撃を受けると、猛毒状態になる、というような上位のステートが作成できるようになるプラグインです。
[上位ステート]
ステートID3のステートときに当該ステートにする攻撃を受けた時、当該ステートを
ステートID4のステートにしたい場合、
ステートID3のステートのメモ欄に
<上位ステートID 4>
<共存不可ステートID 4>
と記述し、ステートID4のステートのメモ欄に
<共存不可ステートID 3>
と記述してください。

[共存不可ステート]
ステートID3のステートはステートID4のステートと共存できないようにする場合、
ステートID3のステートのメモ欄に
<共存不可ステートID 4>
と記述し、ステートID4のステートのメモ欄に
<共存不可ステートID 3>
と記述してください。共存不可の設定が片方のステートだけにならないように注意してください。
また、
<共存不可ステートID 5, 6>
というように記述することで、複数のステートと共存できないようにすることも可能です。
*/

(() =>{
  Game_Battler.prototype.SuperState__addState = Game_Battler.prototype.addState;

  let getCoexistanceStateId = (stateId) =>{
    let state = $dataStates[stateId];
    if(state.note.match(/<共存不可ステートID (.+)>/)){
      return RegExp.$1.replace(/[\s\r\n]/, "").split(",")
                   .map(s => parseInt(s));
    }
    return [];
  }

  let getSuperStateId = (stateId) =>{
    let state = $dataStates[stateId];
    if(state.note.match(/<上位ステートID (\d+)>/)){
      return parseInt(RegExp.$1);
    }
  }

  Game_Battler.prototype.addState = function(stateId){
    let notCoexistanceStateId = getCoexistanceStateId(stateId);
    let nowStateId = this.states().map(state => state.id);
    for(let id of notCoexistanceStateId){
      if(nowStateId.includes(id)) return;
    }
    if(this.isStateAffected(stateId)){
      let superStateId = getSuperStateId(stateId);
      if(superStateId){
        this.eraseState(stateId);
        this.SuperState__addState(superStateId);
        return;
      }
    }
    this.SuperState__addState(stateId);
  }
})();
