/*:
@plugindesc ステート付与装備
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388?lang=ja)

@help
アイテムを装備している間、ステートを付与するプラグインです。
このプラグインを使用することで、装備すると常に混乱するようなアイテムを作ることができます。

[使い方]
武器/防具のメモ欄に、
<EquipState id=ステートID>
と入力すると装備している間、ステートIDに該当するステートにすることができます。
例えば、<EquipState id=4>と記述すると、装備している間、ID4のステートを付与します。
また、<EquipState id=[4, 5]>と指定することで、複数のステートを付与することもできます。

※注意
ステートを付与する装備を初期装備に指定すると、ステートが反映されません。
初期装備のステートは、「全回復」コマンドを実行させることで反映させられるため、
ステート付与装備を初期装備に指定する場合は、ゲーム開始時に「全回復」コマンドを実行してください。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.0.0 新規作成
*/
{
    "use strict";

    /* class Game_Item */
    const _Game_Item_setObject = Game_Item.prototype.setObject;
    Game_Item.prototype.setObject = function(item) {
        _Game_Item_setObject.call(this, item);
        this.setEquipStatesId(item);
    };

    const _Game_Item_setEquip = Game_Item.prototype.setEquip;
    Game_Item.prototype.setEquip = function(isWeapon, itemId) {
        _Game_Item_setEquip.call(this, isWeapon, itemId);
        this.setEquipStatesId(this.object());
    };

    Game_Item.prototype.equipStatesId = function() {
        return this._equipStatesId;
    };

    Game_Item.prototype.setEquipStatesId = function(item) {
        let matchData;
        this._equipStatesId = null;
        if (!item) return;
        if (this.isEquipItem()) {
            if (matchData = item.note.match(/<\s*EquipState\s+id\s*=\s*(\d+)\s*>/)) {
                this._equipStatesId = [parseInt(matchData[1])];
            } else if (matchData = item.note.match(/<\s*EquipState\s+id\s*=\s*\[\s*(.+)\s*\]\s*>/)) {
                this._equipStatesId = matchData[1].split(/\s*\,\s*/).map(s => parseInt(s));
            }
        }
    };


    /* class Game_Actor */
    const _Game_Actor_initialize = Game_Actor.prototype.initialize;
    Game_Actor.prototype.initialize = function(actorId) {
        _Game_Actor_initialize.call(this, actorId);
        this._equipStatesId = [];
    };

    const _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        this.updateEquipStates();
    };

    const _Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
    Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
        _Game_Actor_forceChangeEquip.call(this, slotId, item);
        this.updateEquipStates();
    };

    const _Game_Actor_clearStates = Game_Actor.prototype.clearStates;
    Game_Actor.prototype.clearStates = function() {
        _Game_Actor_clearStates.call(this);
        if (this._equips && this._equipStatesId) this.updateEquipStates();
    };

    Game_Actor.prototype.updateEquipStates = function() {
        let stateId;
        let equipStatesId = [];
        for (let equip of this._equips) {
            if (!equip.equipStatesId()) continue;
            equipStatesId = equipStatesId.concat(equip.equipStatesId());
        }
        for (stateId of equipStatesId) {
            if (this.isStateAddable(stateId)) this.addState(stateId);
        }
        for (stateId of this._equipStatesId) {
            if (equipStatesId.indexOf(stateId) === -1) {
                this.eraseState(stateId);
            }
        }
        this._equipStatesId = equipStatesId;
    };

    const _Game_Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
    Game_Actor.prototype.onBattleEnd = function() {
        _Game_Battler_onBattleEnd.call(this);
        this.updateEquipStates();
    }
};
