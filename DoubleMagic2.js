/*:
@plugindesc 連続魔法2
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@param magicSkillTypeId
@type number
@default 1
@desc
「魔法」のスキルタイプIDを指定します。

@help
自分のターンに魔法を2回選択できるようにするプラグインです。
FFの連続魔みたいなのを作ることができます。

[使い方]
連続魔法を可能にしたいステートのメモ欄に
<連続魔法2>
と記述してください。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.0.0 新規作成
*/
{
    "use strict";

    const param = PluginManager.parameters("DoubleMagic2");
    const magicSkillTypeId = parseInt(param["magicSkillTypeId"]);

    Game_Action.prototype.isMagicSkill = function() {
        return this.item().stypeId === magicSkillTypeId;
    };

    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._doubleMagicEndSelectState = "none";
    };

    Game_Actor.prototype.isContinuousMagic2 = function() {
        for (let stateId of this._states) {
            if ($dataStates[stateId].note.match(/<\s*連続魔法2\s*>/)) {
                return true;
            }
        }
        return false;
    };

    const _Game_Actor_clearActions = Game_Actor.prototype.clearActions;
    Game_Actor.prototype.clearActions = function() {
        _Game_Actor_clearActions.call(this);
        this._doubleMagicEndSelectState = "none";
    };

    Game_Actor.prototype.cancelDoubleMagicSelect = function() {
        this._doubleMagicEndSelectState = "none";
        this._actionInputIndex--;
        this._actions.splice(this._actions.length - 1, 1);
    };

    Game_Actor.prototype.addAction = function(action) {
        this._actions.push(action);
    };

    Game_Actor.prototype.doubleMagicEndSelectState = function() {
        return this._doubleMagicEndSelectState;
    };

    Game_Actor.prototype.setDoubleMagicEndSelectState = function(doubleMagicEndSelectState) {
        this._doubleMagicEndSelectState = doubleMagicEndSelectState;
    };

    const _BattleManager_selectNextCommand = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function(opt = null) {
        const actor = this.actor();
        if (opt && opt.doubleMagic) {
            if (actor.doubleMagicEndSelectState() === "selecting") {
                actor.setDoubleMagicEndSelectState("selected");
            } else {
                actor.addAction(new Game_Action(actor));
                actor.setDoubleMagicEndSelectState("selecting");
            }
            _BattleManager_selectNextCommand.call(this);
        } else {
            _BattleManager_selectNextCommand.call(this);
        }
    };

    const _BattleManager_selectPreviousCommand = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
        _BattleManager_selectPreviousCommand.call(this);
        const actor = BattleManager.actor();
        if (actor.doubleMagicEndSelectState() === "selected") actor.cancelDoubleMagicSelect();
    };

    const _Scene_Battle_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
    Scene_Battle.prototype.selectNextCommand = function() {
        const actor = BattleManager.actor();
        const action = BattleManager.inputtingAction();
        if (action && !action.isMagicSkill() && actor.isContinuousMagic2()) {
            BattleManager.selectNextCommand({doubleMagic: true});
            if (actor.doubleMagicEndSelectState() === "selecting") {
                this.commandSkill();
            } else {
                this.changeInputWindow();
            }
        } else {
            _Scene_Battle_selectNextCommand.call(this);
        }
    };

    const _Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function() {
        const actor = BattleManager.actor();
        if (actor.doubleMagicEndSelectState() === "selecting") actor.cancelDoubleMagicSelect();
        _Scene_Battle_onSkillCancel.call(this);
    };
};
