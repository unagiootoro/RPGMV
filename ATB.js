/*:
@plugindesc バトルをATBに変更します。
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@param waitCommandSelection
@type boolean
@default false
@desc
trueを指定すると、コマンド選択中はゲージの進行を停止します。

@param waitSelectSkillOrItem
@type boolean
@default true
@desc
trueを指定すると、スキルまたはアイテム選択中はゲージの進行を停止します。

@param waitAnimation
@type boolean
@default true
@desc
trueを指定すると、アニメーション再生中はゲージの進行を停止します。

@param drawEnemyUnderGauge
@type boolean
@default true
@desc
trueを指定すると、エネミーにもゲージを表示します。

@param baseGaugeSpeed
@type number
@default 5
@desc
ゲージが溜まる速さを指定します。値が大きくなるほど早くなります。

@param maxActionCount
@type number
@default 3
@desc
1ターンで行動可能な行動回数の最大値を指定します。

@param baseSkillWaitGaugeSpeed
@type number
@default 3
@desc
スキル発動待機時のゲージが溜まる速さを指定します。値が大きくなるほど早くなります。

@param fastForward
@type number
@default 2
@desc
Shiftキーが押されている間、ゲージ進行を早送りするスピードを設定します。

@param enableChangeSelectActor
@type boolean
@default false
@desc
trueを設定すると、pageupボタンで選択中のアクターを切り替えられるようになります。

@param enableYEP_BattleEngineCore
@type boolean
@default false
@desc
YEP_BattleEngineCoreとの競合を解決します。

@help
【メモ欄で設定可能な項目】
スキルのメモ欄に
<SkillWait>
と記載すると、スキル発動までキャラクターを待機させます。

ステートのメモ欄に
<ReduceGauge value=減少値>
と記載すると、ステート付与時にゲージを減少値だけ減少させます。
減少値は1～1000の間で指定してください。

ステートのメモ欄に
<IntervalGainHp gainValue=増加値 duration=時間間隔>
と記載すると、ステートが付与されている間、durationの経過時間ごとにgainValueで指定した値だけ
HPを増加させます。gainValueにマイナスの値を指定することで、HPを減少させることもできます。

ステートのメモ欄に
<Quick>
と記載すると、ステートが付与されている間は、常にゲージが最大になります。

ステートのメモ欄に
<CancelAction>
と記載すると、ステート付与時にゲージを0にしたうえで、キャラクターを行動した扱いにします。

【仕様】
・内部的にはゲージの値は0～1000で管理され、2フレームごとに増加します。
・ゲージが溜まる速さは次の計算式で決定します。
　　ゲージスピード = (素早さ / 全キャラクターの素早さの最小値) * baseGaugeSpeed * fastForward
・スキル待機時間は次の計算式で決定します。
　　スキル待機時間 = (ゲージスピード + スキルの速度補正 + 攻撃速度補正) * baseSkillWaitGaugeSpeed
・戦闘における1ターンの経過は、内部で保持している経過時間が1000以上になった時に1ターン経過とみなします。
　経過時間は次の計算式で決定し、2フレームごとに増加します。
　　経過時間 = baseGaugeSpeed * fastForward
・ステートの自動解除のタイミングを「行動終了時」にした場合、ターンではなく、
キャラクターが行動した回数が継続ターン数に達したときにステートが解除されます。
・Shiftキーを押すと、ゲージが溜まるのを早送りすることができます。
・pageupボタンを押すと、選択中のアクターを順送りすることができます。
・pagedownボタンを押すと、選択中のアクターを逆送りすることができます。

【ライセンス】
このプラグインは、MITライセンスの条件の下で利用可能です。

【更新履歴】
v1.4.1 「YEP_BattleEngineCore.js」が動かない不具合を修正
v1.4.0 選択中のアクターの切り替えについて、pageupで順送り、pagedownで逆送りになるように変更
v1.3.1 バトルイベント実行中にゲージが停止しないバグを修正
v1.3.0 時間経過でHPが増減させるステートを作成可能に変更
       戦闘途中で追加されたバトラーにゲージスプライトが追加されないバグを修正
v1.2.4 クラス名のエイリアスをATBAliasに追加
v1.2.3 ATBAliasを追加
v1.2.2 スキル待機時間が正しく計算されないバグを修正
       エラーが発生するバグを修正
       「YEP_BattleEngineCore.js」併用時にターンが更新されないバグを修正
v1.2.1 1ターン経過判定の条件を経過時間によって判定するように変更
       ゲージ更新を2フレームごとに行うように変更
v1.2.0 pageupで選択中のアクターを切り替えられるように変更
       CTBモードを廃止し、waitCommandSelectionを追加
       バグ修正
v1.1.3 スキル選択時、エネミー選択画面で時間が進むバグを修正
       waitAnimationが正しく動作しないバグを修正
       ATBモード時、「YEP_BattleEngineCore.js」との競合に対応
v1.1.2 メモ欄で設定可能な項目として「CancelWait」を追加
       ReduceGauge適用時にアクション実行が解除されないバグを修正
       行動制約があるステート付与時はゲージをクリアするように修正
v1.1.1 逃走時、行動完了時に解除されるステートの経過ターンを更新するように修正
       行動不能キャラがいるときにターンが経過しないバグを修正
v1.1.0 アクターウィンドウでキャンセルするとパーティウィンドウに遷移するように変更
       CTBモード時、「YEP_BattleEngineCore.js」との競合に対応
       バグ修正
v1.0.4 ATBが動かない不具合を修正
v1.0.3 アクションが実行できなかった時にゲージがクリアされないバグを修正
v1.0.2 外部からコンフィグを変更できるように修正
v1.0.1 ターン終了時にSkillWaitのゲージ速度が変更されるバグを修正
v1.0.0 新規作成
*/

const ATBConfig = {};
const ATBAlias = {};

{
    "use strict";

    const param = PluginManager.parameters("ATB");
    ATBConfig.waitCommandSelection = (param["waitCommandSelection"] === "true" ? true : false);
    ATBConfig.waitSelectSkillOrItem = (param["waitSelectSkillOrItem"] === "true" ? true : false);
    ATBConfig.waitAnimation = (param["waitAnimation"] === "true" ? true : false);
    ATBConfig.drawEnemyUnderGauge = (param["drawEnemyUnderGauge"] === "true" ? true : false);
    ATBConfig.baseGaugeSpeed = parseInt(param["baseGaugeSpeed"]);
    ATBConfig.maxActionCount = parseInt(param["maxActionCount"]);
    ATBConfig.baseSkillWaitGaugeSpeed = parseInt(param["baseSkillWaitGaugeSpeed"]);
    ATBConfig.fastForward = parseInt(param["fastForward"]);
    ATBConfig.enableChangeSelectActor = (param["enableChangeSelectActor"] === "true" ? true : false);
    ATBConfig.enableYEP_BattleEngineCore = (param["enableYEP_BattleEngineCore"] === "true" ? true : false);
    ATBConfig.drawUnderGauge = false;


    class ATBTimer {
        constructor(maxValue) {
            this._maxValue = maxValue;
            this._speed = 1;
            this._value = 0;
        }

        set value(_value) {
            this._value = _value;
            if (this._value > this._maxValue) this.toFull();
            if (this._value < 0) this._value = 0;
        }

        get value() {
            return this._value;
        }

        isTimeout() {
            return this._value === this._maxValue;
        }

        changeSpeed(speed) {
            this._speed = speed;
        }

        increment(fastForwardSpeed = 1) {
            this._value += this._speed * ATBConfig.baseGaugeSpeed * fastForwardSpeed;
            if (this._value > this._maxValue) this._value = this._maxValue;
        }

        clear() {
            this._value = 0;
        }
    }


    class ATBGauge {
        static get PURPOSE_TIME() {
            return "PURPOSE_TIME";
        }

        static get PURPOSE_SKILL_WAIT() {
            return "PURPOSE_SKILL_WAIT";
        }

        constructor(battler) {
            this._battler = battler;
            this._timer = new ATBTimer(ATBManager.GAUGE_MAX);
            this._purpose = ATBGauge.PURPOSE_TIME;
            this._stop = false;
            this._clearWait = false;
            this._quick = false;
            battler.setGauge(this);
        }

        set purpose(_purpose) {
            this._purpose = _purpose;
        }

        get purpose() {
            return this._purpose;
        }

        set value(_value) {
            if (_value < ATBManager.GAUGE_MAX) this._clearWait = false;
            this._timer.value = _value;
        }

        get value() {
            return this._timer.value;
        }

        battler() {
            return this._battler;
        }

        changeSpeed(speed, maxActionCount) {
            if (maxActionCount && speed > ATBConfig.maxActionCount) speed = ATBConfig.maxActionCount;
            this._timer.changeSpeed(speed);
        }

        toFull() {
            this._timer.value = ATBManager.GAUGE_MAX;
        }

        isFull() {
            if (this._stop) return false;
            if (this._clearWait) return false;
            return this._timer.isTimeout();
        }

        increment(fastForwardSpeed = 1) {
            if (this._stop) return;
            if (this._clearWait) return;
            if (!this.isUsable()) return;
            if (this._quick) {
                this.toFull();
                return;
            }
            this._timer.increment(fastForwardSpeed);
        }

        isUsable() {
            if (this._battler.isDead()) return false;
            if (!this._battler.canMove()) return false;
            return true;
        }

        toClearWait() {
            this._clearWait = true;
        }

        clear() {
            this._timer.clear();
            this._clearWait = false;
        }

        stop() {
            this._stop = true;
        }

        resume() {
            this._stop = false;
        }

        isStop() {
            return this._stop === true;
        }

        isActionEnd() {
            return !this._clearWait;
        }

        startQuick() {
            this._quick = true;
        }

        endQuick() {
            this._quick = false;
        }
    }


    class ActorGauge extends ATBGauge {
        constructor(battler) {
            super(battler);
            this._commandSelecting = false;
            this._commandSelected = false;
            if (ATBConfig.drawUnderGauge) BattleManager.spriteset().createGaugeLine(battler);
        }
    
        setCommandSelecting(commandSelecting) {
            this._commandSelecting = commandSelecting;
        }
        
        isCommandSelecting() {
            return this._commandSelecting;
        }
    
        setCommandSelected(commandSelected) {
            this._commandSelected = commandSelected;
        }
        
        isCommandSelected() {
            return this._commandSelected;
        }
    
        commandSelectCancel() {
            this._commandSelecting = false;
            this._commandSelected = false;
        }
    }


    class EnemyGauge extends ATBGauge {
        constructor(battler) {
            super(battler);
            if (ATBConfig.drawEnemyUnderGauge) BattleManager.spriteset().createGaugeLine(battler);
        }
    }


    class GainHpTimer extends ATBTimer {
        constructor(maxValue, gainValue, battler, stateId) {
            super(maxValue);
            this._gainValue = gainValue;
            this._battler = battler;
            this._stateId = stateId;
        }

        battler() {
            return this._battler;
        }

        stateId() {
            return this._stateId;
        }

        increment(fastForwardSpeed = 1) {
            super.increment(fastForwardSpeed);
            if (this.isTimeout()) {
                this._battler.gainHp(this._gainValue);
                this.clear();
            }
        }
    }


    class ATBManager {
        static get GAUGE_MAX() {
            return 1000;
        }

        constructor() {
            this._holdAllBattleMembers = [];
            this._turnDurationTimer = new ATBTimer(ATBManager.GAUGE_MAX);
            this._timers = [this._turnDurationTimer];
            this._canActionMembers = [];
            this._gauges = [];
            this._wait = {};
        }

        startBattle() {
            this.createGauges();
        }

        startTurn() {
            this.createGauges();
            this.makeSpeed();
        }

        updateTurn() {
            for (let gauge of this._gauges) {
                if (gauge.battler().isDead()) gauge.value = 0;
                if (gauge.isFull()) {
                    if (gauge.purpose === ATBGauge.PURPOSE_TIME) gauge.battler().makeActions();
                    this._canActionMembers.push(gauge.battler());
                    gauge.toClearWait();
                }
            }
        }

        updateGauge() {
            if (!this.isActive()) return;
            if (Graphics.frameCount % 2 === 0) return;
            if ($gameTroop.isEventRunning()) return;
            for (let timer of this._timers) {
                timer.increment(this.fastForwardSpeed());
            }
            for (let gauge of this._gauges) {
                gauge.increment(this.fastForwardSpeed());
            }
            BattleManager.refreshStatus();
        }

        fastForwardSpeed() {
            if (Input.isPressed("shift")) return ATBConfig.fastForward;
            return 1;
        }

        endTurn() {
            this._turnDurationTimer.clear();
        }

        toActive(factor) {
            this._wait[factor] = false;
        }

        toWait(factor) {
            this._wait[factor] = true;
        }

        isActive() {
            for (let factor in this._wait) {
                if (this._wait[factor]) return false;
            }
            return true;
        }

        createGauges() {
            const members = BattleManager.allBattleMembers();
            for (let battler of members) {
                if (this._holdAllBattleMembers.indexOf(battler) === -1) {
                    this._holdAllBattleMembers.push(battler);
                    if (battler instanceof Game_Actor) {
                        this._gauges.push(new ActorGauge(battler));
                    } else {
                        this._gauges.push(new EnemyGauge(battler));
                    }
                }
            }
            for (let battler of this._holdAllBattleMembers) {
                if (members.indexOf(battler) === -1) {
                    let i = this._holdAllBattleMembers.indexOf(battler);
                    this._holdAllBattleMembers.splice(i, 1);
                    i = this._gauges.indexOf(battler.gauge())
                    this._gauges.splice(i, 1);
                }
            }
        }

        endAction(battler) {
            battler.gauge().clear();
            let i = this._canActionMembers.indexOf(battler);
            if (i >= 0) this._canActionMembers.splice(i, 1);
            if (battler.gauge().purpose === ATBGauge.PURPOSE_SKILL_WAIT) this.endSkillWait(battler);
        }

        cancelAction(battler) {
            this.endAction(battler);
            battler.updateStateTurns(1);
            battler.removeStatesAuto(1);
        }

        resetGaugeSpeed(battler, speed = battler.speed(), maxActionCount = ATBConfig.maxActionCount) {
            let speeds = [];
            for (let gauge of this._gauges) {
                speeds.push(gauge.battler().speed());
            }
            const minSpeed = Math.min(...speeds);
            const gaugeSpeed = speed / minSpeed;
            battler.gauge().changeSpeed(gaugeSpeed, maxActionCount);
        }

        makeSpeed() {
            let speeds = [];
            for (let gauge of this._gauges) {
                gauge.battler().makeSpeed();
                speeds.push(gauge.battler().speed());
            }
            const minSpeed = Math.min(...speeds);
            let i = 0;
            for (let gauge of this._gauges) {
                if (gauge.purpose === ATBGauge.PURPOSE_TIME) {
                    let gaugeSpeed = speeds[i] / minSpeed;
                    gauge.changeSpeed(gaugeSpeed, ATBConfig.maxActionCount);
                }
                i++;
            }
        }

        isEndTurn() {
            return this._turnDurationTimer.isTimeout();
        }

        startSkillWait(battler) {
            battler.gauge().clear();
            const action = battler.currentAction();
            let skillWaitSpeed = (battler.speed() + action.item().speed);
            if (battler.currentAction().isAttack()) skillWaitSpeed += battler.attackSpeed();
            this.resetGaugeSpeed(battler, skillWaitSpeed * ATBConfig.baseSkillWaitGaugeSpeed, null);
            battler.gauge().purpose = ATBGauge.PURPOSE_SKILL_WAIT;
        }

        endSkillWait(battler) {
            battler.gauge().clear();
            this.resetGaugeSpeed(battler);
            battler.gauge().purpose = ATBGauge.PURPOSE_TIME;
        }

        getNextSubject() {
            for (let i = 0; i < this._canActionMembers.length; i++) {
                let subject = this._canActionMembers[i];
                if (!subject.gauge().isStop()) {
                    this._canActionMembers.splice(i, 1);
                    return subject;
                }
            }
            return null;
        }

        getNextHighPrioritySubject() {
            for (let i = 0; i < this._canActionMembers.length; i++) {
                let subject = this._canActionMembers[i];
                if (subject instanceof Game_Actor && subject.gauge().isCommandSelected()
                    || subject instanceof Game_Enemy
                    || !subject.canInput()) {
                        this._canActionMembers.splice(i, 1);
                        return subject;
                }
            }
            return null;
        }

        addNextSubject(subject) {
            this._canActionMembers.unshift(subject);
        }

        changeNextActor(currentActor, reverse = false) {
            const cycleFild = (array, start, lambda) => {
                for (let i = start; i < array.length; i++) {
                    if (lambda(array[i])) return array[i];
                }
                for (let i = 0; i < start - 1; i++) {
                    if (lambda(array[i])) return array[i];
                }
                return null;
            }

            const currentActorIdx = this._canActionMembers.indexOf(currentActor);
            if (currentActorIdx === -1) return null;
            let nextActors = this._canActionMembers.filter(member => member instanceof Game_Actor);
            if (reverse) {
                nextActors = nextActors.sort((a, b) => $gameParty.members().indexOf(b) - $gameParty.members().indexOf(a));
            } else {
                nextActors = nextActors.sort((a, b) => $gameParty.members().indexOf(a) - $gameParty.members().indexOf(b));
            }
            const nextActor = cycleFild(nextActors, nextActors.indexOf(currentActor) + 1, (actor) => {
                if (actor === currentActor) return false;
                if (!actor.gauge().isCommandSelected()
                    && actor.canInput()
                    && actor.gauge().purpose === ATBGauge.PURPOSE_TIME) {
                        return true;
                }
                return false;
            });
            if (!nextActor) return null;
            const nextActorIdx = this._canActionMembers.indexOf(nextActor);
            this._canActionMembers[currentActorIdx] = nextActor;
            this._canActionMembers.splice(nextActorIdx, 1);
            this._canActionMembers.push(currentActor);
            return nextActor;
        }

        escapeFailed() {
            this._turnDurationTimer.clear();
            this._canActionMembers = [];
            for (let actor of $gameParty.members()) {
                this.cancelAction(actor);
            }
            for (let enemy of $gameTroop.members()) {
                enemy.gauge().toFull();
            }
        }

        surprise() {
            for (let gauge of this._gauges) {
                if (!(gauge.battler() instanceof Game_Enemy)) continue;
                gauge.toFull();
            }
        }

        preemptive() {
            for (let gauge of this._gauges) {
                if (!(gauge.battler() instanceof Game_Actor)) continue;
                gauge.toFull();
            }
        }

        addStateApply(battler, stateId) {
            const state = $dataStates[stateId];
            // ステートに行動制約がある場合
            if (state.restriction > 0) {
                this.endAction(battler);
                if (battler instanceof Game_Actor) battler.gauge().commandSelectCancel();
            }
            this.applyReduceGaugeState(battler, state);
            this.applyIntervalGainHp(battler, state);
            this.applyCancelActionState(battler, state);
            this.startQuickState(battler, state);
        }

        eraseStateApply(battler, stateId) {
            const state = $dataStates[stateId];
            // ステートに行動制約がある場合
            if (state.restriction > 0) {
                this.endAction(battler);
                if (battler instanceof Game_Actor) battler.gauge().commandSelectCancel();
            }
            this.endIntervalGainHp(battler, state);
            this.endQuickState(battler, state);
        }

        applyReduceGaugeState(battler, state) {
            let matchData;
            if (state._reduceGauge === undefined) {
                if (matchData = state.note.match(/<\s*ReduceGauge\s+value=(\d+)\s*>/)) {
                    state._reduceGauge = parseInt(matchData[1]);
                } else {
                    state._reduceGauge = null;
                }
            }
            if (state._reduceGauge) {
                battler.gauge().value -= state._reduceGauge;
                battler.eraseState(state.id);
            }
        }

        applyIntervalGainHp(battler, state) {
            let matchData;
            if (state._intervalGainHp === undefined) {
                if (matchData = state.note.match(/<\s*IntervalGainHp\s+gainValue=(\-?\d+)\s+duration=(\d+)\s*>/)) {
                    state._intervalGainHp = [parseInt(matchData[1]), parseInt(matchData[2])];
                } else {
                    state._intervalGainHp = null;
                    state._intervalGainHp
                }
            }
            if (state._intervalGainHp) {
                this._timers.push(new GainHpTimer(state._intervalGainHp[1], state._intervalGainHp[0], battler, state.id));
            }
        }

        endIntervalGainHp(battler, state) {
            if (!state._intervalGainHp) return;
            let i = 0;
            for (let timer of this._timers) {
                if (timer instanceof GainHpTimer && timer.battler() === battler && timer.stateId() === state.id) break;
                i++;
            }
            this._timers.splice(i, 1);
        }

        applyCancelActionState(battler, state) {
            if (state._cancelAction === undefined) {
                if (state.note.match(/<\s*CancelAction\s*>/)) {
                    state._cancelAction = true;
                } else {
                    state._cancelAction = false;
                }
            }
            if (state._cancelAction) {
                this.cancelAction(battler);
                battler.eraseState(state.id);
            }
        }

        startQuickState(targetBattler, state) {
            if (state._quick === undefined) {
                if (state.note.match(/<\s*Quick\s*>/)) {
                    state._quick = true;
                } else {
                    state._quick = false;
                }
            }
            if (!state._quick) return;
            for (let battler of BattleManager.allBattleMembers()) {
                if (battler === targetBattler) {
                    battler.gauge().startQuick();
                } else {
                    battler.gauge().stop();
                }
            }
        }

        endQuickState(targetBattler, state) {
            if (!state._quick) return;
            for (let battler of BattleManager.allBattleMembers()) {
                if (battler === targetBattler) {
                    battler.gauge().endQuick();
                } else {
                    battler.gauge().resume();
                }
            }
        }
    }


    /* class Game_BattlerBase */
    ATBAlias._Game_BattlerBase_clearStates = Game_BattlerBase.prototype.clearStates;
    Game_BattlerBase.prototype.clearStates = function() {
        if (SceneManager._scene instanceof Scene_Battle) {
            for (let stateId of this._states) {
                BattleManager.eraseStateApply(this, stateId);
            }
        }
        ATBAlias._Game_BattlerBase_clearStates.call(this);
    };

    ATBAlias._Game_BattlerBase_addNewState = Game_BattlerBase.prototype.addNewState;
    Game_BattlerBase.prototype.addNewState = function(stateId) {
        ATBAlias._Game_BattlerBase_addNewState.call(this, stateId);
        if (SceneManager._scene instanceof Scene_Battle) {
            BattleManager.addStateApply(this, stateId);
        }
    };

    ATBAlias._Game_BattlerBase_eraseState = Game_BattlerBase.prototype.eraseState;
    Game_BattlerBase.prototype.eraseState = function(stateId) {
        ATBAlias._Game_BattlerBase_eraseState.call(this, stateId);
        if (SceneManager._scene instanceof Scene_Battle) {
            BattleManager.eraseStateApply(this, stateId);
        }
    };

    // timing 1: 行動終了時
    // timing 2: ターン終了時
    Game_BattlerBase.prototype.updateStateTurns = function(timing = 2) {
        for (let stateId of this._states) {
            if (this._stateTurns[stateId] > 0) {
                let state = $dataStates[stateId];
                if (state.autoRemovalTiming === timing) this._stateTurns[stateId]--;
            }
        }
    };


    /* class Game_Battler */
    ATBAlias._Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        ATBAlias._Game_Battler_initMembers.call(this);
        this._gauge = null;
    };

    Game_Battler.prototype.getSprite = function() {
        for (let sprite of BattleManager._spriteset.battlerSprites()) {
            if (sprite._battler === this) return sprite;
        }
        return null;
    };

    Game_Battler.prototype.setGauge = function(gauge) {
        return this._gauge = gauge;
    };

    Game_Battler.prototype.gauge = function() {
        return this._gauge;
    };

    // 行動終了時のステート解除判定後にステート経過ターンを更新する
    ATBAlias._Game_Battler_onAllActionsEnd = Game_Battler.prototype.onAllActionsEnd;
    Game_Battler.prototype.onAllActionsEnd = function() {
        ATBAlias._Game_Battler_onAllActionsEnd.call(this);
        this.updateStateTurns(1);
    };

    // 行動完了時にdoneさせない
    Game_Battler.prototype.performActionEnd = function() {
        this.setActionState("undecided");
    };

    // speedの生成にactionを用いない
    Game_Battler.prototype.makeSpeed = function() {
        this._speed = this.agi + Math.randomInt(Math.floor(5 + this.agi / 4));
        this._speed += this.attackSpeed();
    };


    /* class Game_Actor */
    ATBAlias._Game_BattlerBase_die = Game_BattlerBase.prototype.die;
    Game_Actor.prototype.die = function() {
        this.gauge().commandSelectCancel();
        BattleManager._atbManager.endAction(this);
        ATBAlias._Game_BattlerBase_die.call(this);
    };


    /* class Game_Item */
    Game_Item.prototype.isSkillWait = function() {
        const skill = this.object();
        if (!skill) return null;
        if (skill._skillWait === undefined) {
            if (skill.note.match(/<\s*SkillWait\s*>/)) {
                skill._skillWait = true;
            } else {
                skill._skillWait = false;
            }
        }
        return skill._skillWait;
    };


    /* class Game_Action */
    Game_Action.prototype.isSkillWait = function() {
        return this._item.isSkillWait();
    };


    /* singleton class BattleManager */
    ATBAlias._BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        ATBAlias._BattleManager_initMembers.call(this);
        this._turnStarted = false;
        this._beforeActionFinish = false;
        this._turnStartReserve = false;
        this._atbManager = new ATBManager();
    };

    BattleManager.spriteset = function() {
        return this._spriteset;
    }

    BattleManager.startInputPhase = function() {
        this._phase = "input";
    };

    BattleManager.setActor = function(actor) {
        this._actorIndex = $gameParty.members().indexOf(actor);
    };

    ATBAlias._BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        ATBAlias._BattleManager_startBattle.call(this);
        this._atbManager.startBattle();
        if (this._surprise) {
            this._atbManager.surprise();
        } else if (this._preemptive) {
            this._atbManager.preemptive();
        }
    };

    // startInput時は、すぐにターンを開始する
    BattleManager.startInput = function() {
        this.startTurn();
    };

    ATBAlias._BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        if (this._turnStarted) {
            this._phase = "turn";
            this._logWindow.startTurn();
        } else {
            if (ATBConfig.enableYEP_BattleEngineCore) {
                this._enteredEndPhase = false;
                this._phase = "turn";
                $gameTroop.increaseTurn();
                $gameParty.onTurnStart();
                $gameTroop.onTurnStart();
                this._performedBattlers = [];
                this.makeActionOrders();
                $gameParty.requestMotionRefresh();
                this._logWindow.startTurn();
            } else {
                ATBAlias._BattleManager_startTurn.call(this);
            }
            this._atbManager.toActive("turn");
            this._atbManager.startTurn();
            this._turnStarted = true;
        }
    };

    BattleManager.updateTurn = function() {
        // CTBの場合は、BattleManager.updateTurn内でゲージを更新する
        if (ATBConfig.waitCommandSelection) {
            this._atbManager.updateGauge();
        }
        this._atbManager.updateTurn();
        $gameParty.requestMotionRefresh();
        if (!this._subject) {
            this._subject = this.getNextSubject();
        }
        if (this._subject) {
            if (this._subject instanceof Game_Actor) {
                const nextHighPrioritySubject = this._atbManager.getNextHighPrioritySubject();
                if (nextHighPrioritySubject) {
                    this._atbManager.addNextSubject(this._subject);
                    this._subject = nextHighPrioritySubject;
                }
            }
            this.processTurn();
        }
        if ((this._phase === "input" || this._phase === "turn") && this._atbManager.isEndTurn()) {
            this._atbManager.endTurn();
            this.endTurn();
        }
    };

    // clearActorを無効化する
    BattleManager.clearActor = function() {
    };

    BattleManager.beforeAction = function(action) {
        const gauge = this._subject.gauge();
        if (gauge.purpose === ATBGauge.PURPOSE_SKILL_WAIT) {
            if (this._subject instanceof Game_Actor) gauge.setCommandSelected(true);
            this._beforeActionFinish = true;
        } else if (this._subject instanceof Game_Actor && !gauge.isCommandSelected()) {
            if (!(this._subject.isConfused() && !action._forcing)) {
                this.setActor(this._subject);
                this.startInputPhase();
            } else {
                gauge.setCommandSelected(true);
            }
        } else if (action.isSkillWait()) {
            this._atbManager.startSkillWait(this._subject);
            this._subject.setActionState("waiting");
        } else {
            this._beforeActionFinish = true;
        }
    };

    BattleManager.afterAction = function() {
        this._atbManager.toActive("turn");
        if (this._subject instanceof Game_Actor && this._subject.gauge().purpose === ATBGauge.PURPOSE_TIME) {
            this._subject.gauge().setCommandSelected(false);
        }
    };

    BattleManager.processTurn = function() {
        if (ATBConfig.enableYEP_BattleEngineCore) this._processTurn = true;
        const subject = this._subject;
        const action = subject.currentAction();
        if (action) {
            if (!this._beforeActionFinish) {
                this.beforeAction(action);
            }
            if (this._beforeActionFinish) {
                action.prepare();
                if (action.isValid()) {
                    this.startAction();
                } else {
                    this._atbManager.endAction(this._subject);
                }
                this._beforeActionFinish = false;
                subject.removeCurrentAction();
            } else if (this._subject.gauge().purpose === ATBGauge.PURPOSE_SKILL_WAIT) {
                this._beforeActionFinish = false;
                this.afterAction();
                this._subject = this.getNextSubject();
            }
        } else {
            this.afterAction();
            subject.onAllActionsEnd();
            this.refreshStatus();
            this._logWindow.displayAutoAffectedStatus(subject);
            this._logWindow.displayCurrentState(subject);
            this._logWindow.displayRegeneration(subject);
            this._subject = this.getNextSubject();
        }
        if (ATBConfig.enableYEP_BattleEngineCore) this._processTurn = false;
    };

    ATBAlias._BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        if (this._subject instanceof Game_Actor) {
            if (this._subject.gauge().isCommandSelected()) {
                if (ATBConfig.waitAnimation) this._atbManager.toWait("turn");
                ATBAlias._BattleManager_startAction.call(this);
            }
        } else {
            if (ATBConfig.waitCommandSelection || ATBConfig.waitAnimation) {
                this._atbManager.toWait("turn");
            }
            ATBAlias._BattleManager_startAction.call(this);
        }
    };

    ATBAlias._BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        ATBAlias._BattleManager_endAction.call(this);
        this._atbManager.endAction(this._subject);
    };

    ATBAlias._BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        if (ATBConfig.enableYEP_BattleEngineCore) {

            if (this.isTurnBased() && this._enteredEndPhase) {
              this._phase = "turnEnd";
              this._preemptive = false;
              this._surprise = false;
              return;
            }
            this._enteredEndPhase = true;
            Yanfly.BEC.BattleManagerATBAlias._endTurn.call(this);
            BattleManager.refreshAllMembers();
            this.actor().gauge().commandSelectCancel();
            this._turnStarted = false;

        } else {

            ATBAlias._BattleManager_endTurn.call(this);
            this._turnStarted = false;

        }
    };

    BattleManager.selectNextCommand = function() {
        this.actor().gauge().setCommandSelected(true);
        this.actor().gauge().setCommandSelecting(false);
        this.toActiveSelectSkillOrItem();
        this.startTurnReserve();
    };

    BattleManager.getNextSubject = function() {
        if (this._subject && this._subject.gauge().isActionEnd()) {
            return null;
        }
        return this._atbManager.getNextSubject();
    };

    BattleManager.processEscape = function() {
        $gameParty.performEscape();
        SoundManager.playEscape();
        const success = this._preemptive ? true : (Math.random() < this._escapeRatio);
        if (success) {
            this.displayEscapeSuccessMessage();
            this._escaped = true;
            this.processAbort();
        } else {
            this.displayEscapeFailureMessage();
            this._escapeRatio += 0.1;
            this.endPause();
            this.startTurnReserve();
            this._atbManager.escapeFailed();
            this.actor().gauge().commandSelectCancel();
            if (this._subject instanceof Game_Actor && this._phase === "input") {
                this._subject = null;
            }
        }
        return success;
    };

    ATBAlias._BattleManager_isInputting = BattleManager.isInputting;
    BattleManager.isInputting = function() {
        return ATBAlias._BattleManager_isInputting.call(this) && !this._turnStartReserve;
    };

    BattleManager.update = function() {
        if (ATBConfig.enableChangeSelectActor) this.updateChangeSelectActor();
        if (ATBConfig.enableYEP_BattleEngineCore) {

            if (!this.isBusy() && !this.updateEvent()) {
                switch (this._phase) {
                case "start":
                    this.startInput();
                    break;
                case "input":
                case "turn":
                    this.startTurnAwait();
                    this.updateTurn();
                    break;
                case "action":
                    this.updateAction();
                    break;
                case "phaseChange":
                    this.updatePhase();
                    break;
                case "actionList":
                    this.updateActionList()
                    break;
                case "actionTargetList":
                    this.updateActionTargetList()
                    break;
                case "turnEnd":
                    this.updateTurnEnd();
                    break;
                case "battleEnd":
                    this.updateBattleEnd();
                    break;
                }
            }

        } else {

            if (!this.isBusy() && !this.updateEvent()) {
                switch (this._phase) {
                case "start":
                    this.startInput();
                    break;
                // ATBの場合は、input phaseの間でもターン更新を行う
                case "input":
                case "turn":
                    this.startTurnAwait();
                    this.updateTurn();
                    break;
                case "action":
                    this.updateAction();
                    break;
                case "turnEnd":
                    this.updateTurnEnd();
                    break;
                case "battleEnd":
                    this.updateBattleEnd();
                    break;
                }
            }

        }
        // バトルイベントを実行する場合、アクターコマンド選択中を解除する
        if ($gameTroop.isEventRunning()) this.actor().gauge().setCommandSelecting(false);
    };

    BattleManager.updateChangeSelectActor = function() {
        if (!this._subject) return;
        const actorCommandWindow = SceneManager._scene._actorCommandWindow;
        if (actorCommandWindow.active) {
            if (Input.isTriggered("pageup")) {
                this.changeSelectActor();
            } else if (Input.isTriggered("pagedown")) {
                this.changeSelectActor(true);
            }
        }
    };

    BattleManager.changeSelectActor = function(reverse = false) {
        const scene = SceneManager._scene;
        const currentActor = this.actor();
        if (!currentActor) return;
        let nextActor = null;
        if (this._subject instanceof Game_Actor
            && this._subject === currentActor
            && this._subject.canInput()
            && this._subject.gauge().purpose === ATBGauge.PURPOSE_TIME
            && !this._subject.gauge().isActionEnd()) {
                this._atbManager.addNextSubject(this._subject);
                nextActor = this._atbManager.changeNextActor(currentActor, reverse);
                this._subject = this._atbManager.getNextSubject();
                if (!nextActor) return;
                currentActor.gauge().commandSelectCancel();
                this.setActor(nextActor);
        } else {
            nextActor = this._atbManager.changeNextActor(currentActor, reverse);
            if (!nextActor) return;
            currentActor.gauge().commandSelectCancel();
            scene.updateActorCommandWindow();
            this.setActor(nextActor);
            scene.startActorCommandSelection();
        }
    };

    // アクターコマンドの選択が完了してからターンを開始するようにする
    BattleManager.startTurnReserve = function() {
        if (this._subject && !this._subject.gauge().isActionEnd()) {
            this._turnStartReserve = true;
            SceneManager._scene.changeInputWindow();
        } else {
            this.startTurn();
            this._turnStarted = true;
        }
    };

    BattleManager.startTurnAwait = function() {
        if (this._phase === "battleEnd") return;
        if (this._subject && this._subject.gauge().isActionEnd) {
            if (this._turnStartReserve) {
                this._turnStartReserve = false;
                this.startTurn();
            }
        }
    };

    BattleManager.updateGauge = function() {
        this._atbManager.updateGauge();
    };

    BattleManager.startPause = function() {
        this._atbManager.toWait("pause");
    };

    BattleManager.endPause = function() {
        this._atbManager.toActive("pause");
    };

    BattleManager.toActiveSelectSkillOrItem = function() {
        this._atbManager.toActive("selectSkillOrItem");
    };

    BattleManager.toWaitSelectSkillOrItem = function() {
        this._atbManager.toWait("selectSkillOrItem");
    };

    BattleManager.addStateApply = function(battler, stateId) {
        this._atbManager.addStateApply(battler, stateId);
    };

    BattleManager.eraseStateApply = function(battler, stateId) {
        this._atbManager.eraseStateApply(battler, stateId);
    };


    /* class Scene_Battle */
    ATBAlias._Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        ATBAlias._Scene_Battle_update.call(this);
        this.updateActorCommandWindow();
    };

    Scene_Battle.prototype.updateBattleProcess = function() {
        // CTBの場合は、BattleManager.updateTurn内でゲージを更新する
        if (!ATBConfig.waitCommandSelection) {
            if (ATBConfig.enableYEP_BattleEngineCore) {

                switch (BattleManager._phase) {
                    case "input":
                    case "turn":
                    case "action":
                    case "phaseChange":
                    case "actionList":
                    case "actionTargetList":
                        BattleManager.updateGauge();
                }

            } else {

                switch (BattleManager._phase) {
                    case "input":
                    case "turn":
                    case "action":
                        BattleManager.updateGauge();
                }

            }
        }
        if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
                BattleManager.isBattleEnd()) {
            BattleManager.update();
            if (!BattleManager.actor() || !BattleManager.actor().gauge().isCommandSelected()) {
                this.changeInputWindow();
            }
        }
    };

    Scene_Battle.prototype.updateActorCommandWindow = function() {
        if (BattleManager.actor() && !BattleManager.actor().gauge().isCommandSelecting()) {
            this._actorCommandWindow.close();
            this._skillWindow.hide();
            this._itemWindow.hide();
            this._actorWindow.hide();
            this._enemyWindow.hide();
        }
    };

    // ターンを再開する
    Scene_Battle.prototype.commandFight = function() {
        BattleManager.endPause();
        BattleManager.actor().gauge().setCommandSelecting(false);
        this.changeInputWindow();
    };

    // キャンセルでパーティウィンドウに戻す
    Scene_Battle.prototype.selectPreviousCommand = function() {
        this.startPartyCommandSelection();
    };

    // パーティコマンド選択時はポーズする
    ATBAlias._Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        BattleManager.startPause();
        if (ATBConfig.enableYEP_BattleEngineCore) {
            Yanfly.BEC.Scene_Battle_startPartyCommandSelection.call(this);
        } else {
            ATBAlias._Scene_Battle_startPartyCommandSelection.call(this);
        }
    };

    ATBAlias._Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        if (ATBConfig.enableYEP_BattleEngineCore) {

            if (!BattleManager.actor().gauge().isCommandSelecting()) {
                Yanfly.BEC.Scene_Battle_startActorCommandSelection.call(this);
                this._statusWindow.refresh();
                BattleManager.actor().gauge().setCommandSelecting(true);
            }

        } else {

            if (!BattleManager.actor().gauge().isCommandSelecting()) {
                ATBAlias._Scene_Battle_startActorCommandSelection.call(this);
                BattleManager.actor().gauge().setCommandSelecting(true);
            }

        }
    };

    Scene_Battle.prototype.changeInputWindow = function() {
        if (BattleManager.isInputting()) {
            if (BattleManager.actor()) {
                this.startActorCommandSelection();
            } else {
                BattleManager.startTurn();
            }
        } else {
            // アクターウィンドウの選択が終了すると、アクターウィンドウを閉じる
            if (BattleManager.actor() && !BattleManager.actor().gauge().isCommandSelecting()) {
                this.endCommandSelection();
            }
        }
    };

    // ATB時は、ステータスウィンドウを移動しないようにする
    ATBAlias._Scene_Battle_updateWindowPositions = Scene_Battle.prototype.updateWindowPositions;
    Scene_Battle.prototype.updateWindowPositions = function() {
        statusX = this._partyCommandWindow.width;
        if (this._statusWindow.x < statusX) {
            this._statusWindow.x += 16;
            if (this._statusWindow.x > statusX) {
                this._statusWindow.x = statusX;
            }
        }
        if (this._statusWindow.x > statusX) {
            this._statusWindow.x -= 16;
            if (this._statusWindow.x < statusX) {
                this._statusWindow.x = statusX;
            }
        }
    };

    // ATB時は、パーティコマンドが開いているとき以外は時間を進める
    ATBAlias._Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        if (ATBConfig.waitCommandSelection) {
            return ATBAlias._Scene_Battle_isAnyInputWindowActive.call(this);
        }
        return this._partyCommandWindow.active;
    };

    ATBAlias._Scene_Battle_commandSkill =  Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function() {
        if (!ATBConfig.waitCommandSelection && ATBConfig.waitSelectSkillOrItem) {
            BattleManager.toWaitSelectSkillOrItem();
        }
        ATBAlias._Scene_Battle_commandSkill.call(this);
    };

    ATBAlias._Scene_Battle_commandItem = Scene_Battle.prototype.commandItem;
    Scene_Battle.prototype.commandItem = function() {
        if (!ATBConfig.waitCommandSelection && ATBConfig.waitSelectSkillOrItem) {
            BattleManager.toWaitSelectSkillOrItem();
        }
        ATBAlias._Scene_Battle_commandItem.call(this);
    };

    ATBAlias._Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
    Scene_Battle.prototype.onSkillCancel = function() {
        if (!ATBConfig.waitCommandSelection && ATBConfig.waitSelectSkillOrItem) {
            BattleManager.toActiveSelectSkillOrItem();
        }
        ATBAlias._Scene_Battle_onSkillCancel.call(this);
    };

    ATBAlias._Scene_Battle_onItemCancel = Scene_Battle.prototype.onItemCancel;
    Scene_Battle.prototype.onItemCancel = function() {
        if (!ATBConfig.waitCommandSelection && ATBConfig.waitSelectSkillOrItem) {
            BattleManager.toActiveSelectSkillOrItem();
        }
        ATBAlias._Scene_Battle_onItemCancel.call(this);
    };


    /* class Window_BattleStatus */
    ATBAlias._Window_BattleStatus_drawGaugeAreaWithTp = Window_BattleStatus.prototype.drawGaugeAreaWithTp;
    Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
        if (ATBConfig.drawUnderGauge) {
            ATBAlias._Window_BattleStatus_drawGaugeAreaWithTp.call(this, rect, actor);
        } else {
            this.drawActorHp(actor, rect.x + 0, rect.y, 108 * 0.8);
            this.drawActorMp(actor, rect.x + 123 * 0.8, rect.y, 96 * 0.8);
            this.drawActorTp(actor, rect.x + 234 * 0.8, rect.y, 96 * 0.8);
            this.drawActorCt(actor, rect.x + 334 * 0.8, rect.y, 96 * 0.8);
        }
    };

    ATBAlias._Window_BattleStatus_drawGaugeAreaWithoutTp = Window_BattleStatus.prototype.drawGaugeAreaWithoutTp;
    Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function(rect, actor) {
        if (ATBConfig.drawUnderGauge) {
            ATBAlias._Window_BattleStatus_drawGaugeAreaWithoutTp.call(this, rect, actor);
        } else {
            ATBAlias._Window_BattleStatus_drawGaugeAreaWithoutTp.call(this, rect, actor);
            this.drawActorCt(actor, rect.x + 234, rect.y, 96);
        }
    };

    Window_BattleStatus.prototype.drawActorCt = function(actor, x, y, width) {
        width = width || 96;
        const gauge = actor.gauge();
        let color1, color2;
        if (gauge && gauge.purpose === ATBGauge.PURPOSE_TIME) {
            color1 = this.textColor(30);
            color2 = this.textColor(31);
        } else {
            color1 = this.textColor(2);
            color2 = this.textColor(2);
        }
        const ctValue = Math.floor(gauge ? gauge.value : 0);
        const ctRate = ctValue / ATBManager.GAUGE_MAX;
        this.drawGauge(x, y, width, ctRate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText("CT", x, y, 44);
        this.changeTextColor(this.normalColor());
    };


    class Sprite_GaugeLine extends Sprite {
        get GAUGE_WIDTH() { return 50 };
        get GAUGE_HEIGHT() { return 5 };

        initialize(battler) {
            const bitmap = new Bitmap(this.GAUGE_WIDTH, this.GAUGE_HEIGHT);
            super.initialize(bitmap);
            this._battler = battler;
            this._battlerSprite = battler.getSprite();
        }

        update() {
            super.update();
            if (BattleManager._phase !== "start") {
                if (this._battler instanceof Game_Actor) {
                    this.x = this._battlerSprite.x - 24;
                    this.y = this._battlerSprite.y;
                } else {
                    this.x = this._battlerSprite.x - this._battlerSprite.width / 4;
                    this.y = this._battlerSprite.y;
                }
                this.drawGauge(this._battler.gauge());
            }
        }

        drawGauge(gauge) {
            let width = 0;
            if (gauge.battler() instanceof Game_Enemy && gauge.battler().isDead()) {
                this.bitmap.clear();
                return;
            }
            if (gauge) {
                const ctRate = gauge.value / ATBManager.GAUGE_MAX;
                width = this.bitmap.width * ctRate;
            }
            this.bitmap.fillRect(0, 0, this.bitmap.width, this.bitmap.height, "#000000");
            if (gauge.purpose === ATBGauge.PURPOSE_SKILL_WAIT) {
                this.bitmap.fillRect(0, 0, width, this.bitmap.height, BattleManager._statusWindow.textColor(2));
            } else {
                this.bitmap.fillRect(0, 0, width, this.bitmap.height, BattleManager._statusWindow.textColor(31));
            }
        }
    }


    /* class Spriteset_Battle */
    Spriteset_Battle.prototype.createGaugeLine = function(battler) {
        this._baseSprite.addChild(new Sprite_GaugeLine(battler));
    };


    // クラス名のエイリアス
    ATBAlias.ATBTimer = ATBTimer;
    ATBAlias.ATBGauge = ATBGauge;
    ATBAlias.ActorGauge = ActorGauge;
    ATBAlias.EnemyGauge = EnemyGauge;
    ATBAlias.ATBManager = ATBManager;
    ATBAlias.Sprite_GaugeLine = Sprite_GaugeLine;

};
