/*:
@plugindesc その場で行動する戦闘システム v1.3.0
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@help
自分のターンが来た時にコマンドを入力できるようにするプラグインです。

[使用方法]
このプラグインは、導入するだけで使用できます。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.3.0 アクターコマンドでキャンセルするとパーティコマンドに遷移するように変更
       プラグインパラメータ「addEscapeCommadToActorWindow」を削除
v1.2.1 プラグインヘルプを修正
v1.2 アクターが行動するたびにターンが増えてしまう不具合を修正
v1.1 プラグインパラメータ「addEscapeCommadToActorWindow」を追加
v1.0 新規作成
*/
{
    /* static class BattleManager */
    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._actorCommandSelected = false;
        this._inputPartyCommandSelecting = false;
        this._firstInputPartyCommandFinished = false;
        this._turnStarted = false;
    };

    BattleManager.firstInputPartyCommandFinish = function() {
        this._firstInputPartyCommandFinished = true;
    }

    BattleManager.isFirstInputPartyCommandFinished = function() {
        return this._firstInputPartyCommandFinished;
    }

    BattleManager.setInputPartyCommandSelecting = function(inputPartyCommandSelecting) {
        return this._inputPartyCommandSelecting = inputPartyCommandSelecting;
    }

    BattleManager.isInputPartyCommandSelecting = function() {
        return this._inputPartyCommandSelecting;
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

    BattleManager.processTurn = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        if (action) {
            if (subject instanceof Game_Actor) {
                this.actorPrepareAction();
            } else {
                this.enemyPrepareAction();
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

    BattleManager.actorPrepareAction = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        if (this._actorCommandSelected) {
            if (action.isValid()) {
                this.startAction();
            }
            subject.removeCurrentAction();
            this._actorCommandSelected = false;
        } else {
            action.prepare();
            if (action.item()) {
                this._actorCommandSelected = true;
            } else {
                this.setActor(subject);
                this.startInputPhase();
            }
        }
    };

    BattleManager.enemyPrepareAction = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject.removeCurrentAction();
    };

    BattleManager.resumeTurn = function() {
        this._phase = "turn";
        this.clearActor();
        this._logWindow.startTurn();
    };

    const _BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        _BattleManager_endTurn.call(this);
        this._turnStarted = false;
    };

    const _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        if (this._subject instanceof Game_Actor) {
            if (this._actorCommandSelected) _BattleManager_startAction.call(this);
        } else {
            _BattleManager_startAction.call(this);
        }
    };

    BattleManager.selectNextCommand = function() {
        if (this._turnStarted) {
            this.resumeTurn();
        } else {
            this.startTurn();
            this._turnStarted = true;
        }
    };


    /* class Scene_Battle */
    const _Scene_Battle_commandFight = Scene_Battle.prototype.commandFight;
    Scene_Battle.prototype.commandFight = function() {
        BattleManager.setInputPartyCommandSelecting(false);
        if (BattleManager.isInputPartyCommandSelecting()) {
            this.changeInputWindow();
        } else {
            _Scene_Battle_commandFight.call(this);
        }
        BattleManager.firstInputPartyCommandFinish();
    };

    const _Scene_Battle_commandEscape = Scene_Battle.prototype.commandEscape;
    Scene_Battle.prototype.commandEscape = function() {
        BattleManager.setInputPartyCommandSelecting(false);
        BattleManager.setActorCommandSelected(false);
        _Scene_Battle_commandEscape.call(this);
    };

    Scene_Battle.prototype.updateBattleProcess = function() {
        if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
                BattleManager.isBattleEnd()) {
            BattleManager.update();
            if (!BattleManager.isActorCommandSelected()) {
                this.changeInputWindow();
            }
        }
    };

    Scene_Battle.prototype.selectPreviousCommand = function() {
        BattleManager.setInputPartyCommandSelecting(true);
        this.startPartyCommandSelection();
    };

    const _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        if (BattleManager.isFirstInputPartyCommandFinished()) {
            if (BattleManager.isInputPartyCommandSelecting()) {
                _Scene_Battle_startPartyCommandSelection.call(this);
            } else {
                this.selectNextCommand();
            }
        } else {
            BattleManager.setInputPartyCommandSelecting(true);
            _Scene_Battle_startPartyCommandSelection.call(this);
        }
    };

    const _Scene_Battle_startActorCommandSelected = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _Scene_Battle_startActorCommandSelected.call(this);
        BattleManager.setActorCommandSelected(true);
    };
};
