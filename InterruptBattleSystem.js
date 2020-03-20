/*:
@plugindesc その場で行動する戦闘システム v1.0
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@help
自分のターンが来た時にコマンドを入力できるようにするスクリプトです。

[使用方法]
このスクリプトは、導入するだけで使用できます。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.0 新規作成
*/
{
    // redefine
    const _Game_Action_prepare = Game_Action.prototype.prepare;
    Game_Action.prototype.prepare = function() {
        _Game_Action_prepare.call(this);
        if (this.subject() instanceof Game_Actor) {
            BattleManager.setActor(this.subject());
            BattleManager.startInputPhase();
        }
    };

    // redefine
    const _initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _initMembers.call(this);
        this._actorCommandSelected = false;
    };

    BattleManager.startInputPhase = function() {
        this._phase = "input";
    };

    BattleManager.setActor = function(actor) {
        this._actorIndex = $gameParty.members().indexOf(actor)
    };

    BattleManager.setActorCommandSelected = function(actorCommandSelected) {
        this._actorCommandSelected = actorCommandSelected;
    };

    BattleManager.isActorCommandSelected = function() {
        return this._actorCommandSelected;
    };

    // redefine
    BattleManager.selectNextCommand = function() {
        this.startTurn();
    };

    // redefine
    const _BattleManager_processTurn = BattleManager.processTurn;
    BattleManager.processTurn = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        if (action) {
            action.prepare();
            if (!(subject instanceof Game_Actor) || this._actorCommandSelected) {
                this._actorCommandSelected = false;
                _BattleManager_processTurn.call(this);
            }
        } else {
            subject.onAllActionsEnd();
            this.refreshStatus();
            this._logWindow.displayAutoAffectedStatus(subject);
            this._logWindow.displayCurrentState(subject);
            this._logWindow.displayRegeneration(subject);
            this._subject = this.getNextSubject();
        }
    };

    // redefine
    Scene_Battle.prototype.updateBattleProcess = function() {
        if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
                BattleManager.isBattleEnd()) {
            BattleManager.update();
            if (!BattleManager.isActorCommandSelected()) {
                this.changeInputWindow();
            }
        }
    };

    // redefine
    Scene_Battle.prototype.selectPreviousCommand = function() {
        this.changeInputWindow();
    };

    // redefine
    const _Scene_Battle_startActorCommandSelected = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _Scene_Battle_startActorCommandSelected.call(this);
        BattleManager.setActorCommandSelected(true);
    };
}
