/*:
@plugindesc その場で行動する戦闘システム v1.2
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@help
自分のターンが来た時にコマンドを入力できるようにするスクリプトです。

@param addEscapeCommadToActorWindow
@type boolean
@default true
@desc
trueを指定すると、逃げるのコマンドをアクターウィンドウに追加します。

[使用方法]
このスクリプトは、導入するだけで使用できます。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.2 アクターが行動するたびにターンが増えてしまう不具合を修正
v1.1 プラグインパラメータ「addEscapeCommadToActorWindow」を追加
v1.0 新規作成
*/
{
    const param = PluginManager.parameters("InterruptBattleSystem");
    const addEscapeCommadToActorWindow = (param["addEscapeCommadToActorWindow"] === "true" ? true : false);

    // redefine
    const _Game_Battler_removeCurrentAction = Game_Battler.prototype.removeCurrentAction
    Game_Battler.prototype.removeCurrentAction = function() {
        if (!(this instanceof Game_Actor)) {
            _Game_Battler_removeCurrentAction.call(this);
        } else {
            if (BattleManager.isActorCommandSelected()) {
                _Game_Battler_removeCurrentAction.call(this);
                BattleManager.setActorCommandSelected(false);
            }
        }
    };

    // redefine
    const _Game_Action_prepare = Game_Action.prototype.prepare;
    Game_Action.prototype.prepare = function() {
        if (this.subject() instanceof Game_Actor && !BattleManager.isActorCommandSelected()) {
            _Game_Action_prepare.call(this);
            if (!(this.subject().isConfused() && !this._forcing)) {
                BattleManager.setActor(this.subject());
                BattleManager.startInputPhase();
            } else {
                BattleManager._actorCommandSelected = true;
            }
        } else {
            _Game_Action_prepare.call(this);
        }
    };

    // redefine
    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._actorCommandSelected = false;
        this._inputPartyCommandFinished = false;
        this._turnStarted = false;
    };

    BattleManager.inputPartyCommandFinish = function() {
        this._inputPartyCommandFinished = true;
    }

    BattleManager.isInputPartyCommandFinished = function() {
        return this._inputPartyCommandFinished;
    }

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

    BattleManager.resumeTurn = function() {
        this._phase = "turn";
        this.clearActor();
        this._logWindow.startTurn();
    };

    // redefine
    const _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        _BattleManager_endTurn.call(this);
        this._turnStarted = false;
    };

    const _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        var subject = this._subject;
        var action = subject.currentAction();
        if (subject instanceof Game_Actor) {
            if (this._actorCommandSelected) _BattleManager_startAction.call(this);
        } else {
            _BattleManager_startAction.call(this);
        }
    };

    // redefine
    BattleManager.selectNextCommand = function() {
        if (this._turnStarted) {
            this.resumeTurn();
        } else {
            this.startTurn();
            this._turnStarted = true;
        }
    };

    // redefine
    const _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        if (addEscapeCommadToActorWindow) {
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
        if (addEscapeCommadToActorWindow) {
            this._actorCommandWindow.setHandler("escape", this.commandEscape.bind(this));
            this.addWindow(this._actorCommandWindow);
        }
    };

    Scene_Battle.prototype.commandEscape = function() {
        BattleManager.processEscape();
        this.changeInputWindow();
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
        if (addEscapeCommadToActorWindow) {
            if (BattleManager.isInputPartyCommandFinished()) {
                this.selectNextCommand();
            } else {
                BattleManager.inputPartyCommandFinish();
                _Scene_Battle_startPartyCommandSelection.call(this);
            }
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
};
