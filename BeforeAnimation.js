/*:
@plugindesc スキル実行前アニメーション ver1.1
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388?lang=ja)

@param beforeAction
@type boolean
@default true
@desc
trueを指定すると、スキル実行前アニメーション表示時に、アクター・敵キャラが前に出るようになります。

@param beforeDisplayMessage
@type boolean
@default true
@desc
trueを指定すると、スキル実行前アニメーション表示時に、スキル使用メッセージを表示します。

@param MOG_BattlerMotion_beforeAction
@type boolean
@default false
@desc
trueを指定すると、MOG_BattlerMotion使用時、スキル実行前アニメーション表示前に、アクター・敵キャラのアニメーションを表示します。

@help
スキル発動前にアニメーションを表示するプラグインです。
アイテム使用前にアニメーションを表示することもできます。

[使い方]
スキルのメモ欄に、
<BeforeAnimation id=スキルID>
と入力するとスキル発動前に使用者にアニメーションを表示します。
例えば、ファイアのスキル欄に<BeforeAnimation id=117>と記述すると、
ファイア発動前にアニメーション117を再生できます。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。

[更新履歴]
v1.1 MOG_BattlerMotionに対応
v1.0 新規作成
*/
{
    const param = PluginManager.parameters("BeforeAnimation");
    const beforeAction = (param["beforeAction"] === "true" ? true : false);
    const beforeDisplayMessage = (param["beforeDisplayMessage"] === "true" ? true : false);
    const MOG_BattlerMotion_beforeAction = (param["MOG_BattlerMotion_beforeAction"] === "true" ? true : false);

    Game_Item.prototype.beforeAnimationId = function() {
        if (this._beforeAnimationId === undefined) {
            const matchData = this.object().note.match(/<\s*BeforeAnimation\s+id\s*=\s*(\d+)\s*>/);
            if (matchData) {
                this._beforeAnimationId = parseInt(matchData[1]);
            } else {
                this._beforeAnimationId = null;
            }
        }
        return this._beforeAnimationId;
    };

    Game_Action.prototype.beforeAnimationId = function() {
        return this._item.beforeAnimationId();
    };

    // redefine
    Window_BattleLog.prototype.startAction = function(subject, action, targets) {
        const item = action.item();
        if (!beforeAction || !action.beforeAnimationId()) {
            this.push("performActionStart", subject, action);
            this.push("waitForMovement");
        }
        this.push("performAction", subject, action);   
        this.push("showAnimation", subject, targets.clone(), item.animationId);
        if (!beforeDisplayMessage || !action.beforeAnimationId()) {
            this.displayAction(subject, item);
        } else {
            this.push("wait");
        }
    };

    Window_BattleLog.prototype.startBeforeAnimation = function(subject, action, targets) {
        if (beforeAction) {
            this.push("performActionStart", subject, action);
            this.push("waitForMovement");
        }
        this.push("showAnimation", subject, targets.clone(), action.beforeAnimationId());
        if (beforeDisplayMessage) {
            this.displayAction(subject, action.item());
        } else {
            this.push("wait");
        }
    };

    // redefine
    const _initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _initMembers.call(this);
        this._showBeforeAnimationFinish = false;
        this._showMOGBeforeActionFinish = false;
    };

    // redefine
    BattleManager.processTurn = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        if (action) {
            this.processTurnAction(subject, action);
        } else {
            subject.onAllActionsEnd();
            this.refreshStatus();
            this._logWindow.displayAutoAffectedStatus(subject);
            this._logWindow.displayCurrentState(subject);
            this._logWindow.displayRegeneration(subject);
            this._subject = this.getNextSubject();
        }
    };

    BattleManager.processTurnAction = function(subject, action) {
        // Enable MOG_BattlerMotion
        if (MOG_BattlerMotion_beforeAction) {
            if (!this._showMOGBeforeActionFinish) {
                action.prepare();
                this._showMOGBeforeActionFinish = true;
            } else if (action.beforeAnimationId() && !this._showBeforeAnimationFinish) {
                this.startBeforeAnimation();
                this._showBeforeAnimationFinish = true;
            } else {
                if (action.isValid()) {
                    this.startAction();
                }
                subject.removeCurrentAction();
                this._showBeforeAnimationFinish = false;
                this._showMOGBeforeActionFinish = false;
            }
        // Disable MOG_BattlerMotion
        } else {
            if (action.beforeAnimationId() && !this._showBeforeAnimationFinish) {
                this.startBeforeAnimation();
                this._showBeforeAnimationFinish = true;
            } else {
                action.prepare();
                if (action.isValid()) {
                    this.startAction();
                }
                subject.removeCurrentAction();
                this._showBeforeAnimationFinish = false;
            }
        }
    };

    BattleManager.startBeforeAnimation = function() {
        const subject = this._subject;
        const action = subject.currentAction();
        const targets = [subject];
        this._logWindow.startBeforeAnimation(subject, action, targets);
    };
};
