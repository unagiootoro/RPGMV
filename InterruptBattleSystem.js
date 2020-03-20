/*:
@plugindesc その場で行動する戦闘システム v1.0
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@help
自分のターンが来た時にコマンドを入力できるようにするスクリプトです。

@param disablePartyCommand
@type boolean
@default true
@desc
trueを指定すると、逃げるのコマンドをアクターウィンドウに追加します。

[使用方法]
このスクリプトは、導入するだけで使用できます。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.1 プラグインパラメータ「disablePartyCommand」を追加
v1.0 新規作成
*/
{
    const param = PluginManager.parameters("InterruptBattleSystem");
    const disablePartyCommand = (param["disablePartyCommand"] === "true" ? true : false);

    // redefine
    const _Game_Battler_removeCurrentAction = Game_Battler.prototype.removeCurrentAction
    Game_Battler.prototype.removeCurrentAction = function() {
        if (!(this instanceof Game_Actor)) {
            _Game_Battler_removeCurrentAction.call(this);
        }
        if (BattleManager.isActorCommandSelected()) {
            _Game_Battler_removeCurrentAction.call(this);
            BattleManager.setActorCommandSelected(false);
        }
    };

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
    const _Game_Action_isValid = Game_Action.prototype.isValid;
    Game_Action.prototype.isValid = function() {
        const valid = _Game_Action_isValid.call(this);
        if (!(this.subject() instanceof Game_Actor)) return valid;
        if (BattleManager.isActorCommandSelected()) return valid;
        return false;
    };

    // redefine
    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
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
    const _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        if (disablePartyCommand) {
            if (this._actor) {
                this.addEscapeCommand();
            }
        }
    };

    Window_ActorCommand.prototype.addEscapeCommand = function() {
        this.addCommand(TextManager.escape, "escape", BattleManager.canEscape());
    };

    // redefine
    const _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        if (disablePartyCommand) {
            this._actorCommandWindow.setHandler("escape", this.commandEscape.bind(this));
            this.addWindow(this._actorCommandWindow);
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
    const _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        if (disablePartyCommand) {
            this.selectNextCommand();
        } else {
            _Scene_Battle_startPartyCommandSelection.call(this);
        }
    };

    // redefine
    const _Scene_Battle_startActorCommandSelected = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _Scene_Battle_startActorCommandSelected.call(this);
        BattleManager.setActorCommandSelected(true);
    };
}
