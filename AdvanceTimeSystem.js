/*:
    @plugindesc 歩くたびに時間が経過する古典的な時間経過システムを導入するプラグインです。
    @author うなぎおおとろ

    @param timezoneVariableID
    @default 1
    @desc
    時間帯を管理する変数のID
    変数の値は、(0:朝、1:昼、2:夕方、3:夜、4:深夜、5:夜明け)を意味します。

    @param morningSteps
    @default 90
    @desc 朝の時間の長さ(単位は歩数)

    @param noonSteps
    @default 180
    @desc 昼の時間の長さ(単位は歩数)

    @param eveningSteps
    @default 90
    @desc 夕方の時間の長さ(単位は歩数)

    @param nightSteps
    @default 120
    @desc 夜の時間の長さ(単位は歩数)

    @param lateNightSteps
    @default 120
    @desc 深夜の時間の長さ(単位は歩数)

    @param dawnSteps
    @default 120
    @desc 夜明けの時間の長さ(単位は歩数)

    @help
    時間経過システム ver1.0.4

    歩くたびに時間が経過する古典的な時間経過システムを導入するプラグインです。
    時間帯には、朝、昼、夕方、夜、深夜、夜明けを使用できます。

    [使用方法]
    時間の経過を許可するマップのメモ欄に、
    <時間経過マップ>
    と記述してください。

    夜専用BGMを流したいマップでは、
    <夜BGM:BGMファイル名>
    と記述することで、夜に専用BGMを流すことができます。
    例えば、インポートした"night-bgm"という夜専用BGMをセットしたい場合は、
    <夜BGM:night-bgm>
    となります。

    時間帯によって出現する敵グループを設定したい場合、
    敵グループ名に、
    <時間帯>敵グループ名
    と指定します。
    例えば、深夜にのみ、こうもり２匹を出現させたい場合、
    敵グループ名は、
    <深夜>こうもり*2
    となります。

    イベントから時間帯を変更したい場合、スクリプトに
    $gameMap.changeTimezone(変更する時間帯の値);
    と記述してください。
    例えば、時間帯を夜に変更したい場合は、
    $gameMap.changeTimezone(3);
    となります。

    [更新履歴]
    ver1.0.4    乗り物に乗っていると時間が経過しない不具合を修正
    ver1.0.3    use strict追加
    ver1.0.2    デバッグ用のconsole.logを削除
    ver1.0.1    プラグインヘルプを修正
    ver1.0.0    公開
*/

{
    "use strict";

    const Morning = 0
    const Noon = 1
    const Evening = 2
    const Night = 3
    const LateNight = 4
    const Dawn = 5

    //class Game_Map
    Game_Map.prototype.getNextTimezoneSteps = function() {
        switch (this.nowTimezone()) {
        case Morning:
            return this._morningSteps
        case Noon:
            return this._noonSteps
        case Evening:
            return this._eveningSteps
        case Night:
            return this._nightSteps
        case LateNight:
            return this._lateNightSteps
        case Dawn:
            return this._dawnSteps
        }
    }

    const _initialize = Game_Map.prototype.initialize
    Game_Map.prototype.initialize = function() {
        _initialize.call(this)
        const params = PluginManager.parameters("AdvanceTimeSystem")
        this._timezoneVariableID = parseInt(params["timezoneVariableID"])
        this._morningSteps = parseInt(params["morningSteps"])
        this._noonSteps = parseInt(params["noonSteps"])
        this._eveningSteps = parseInt(params["eveningSteps"])
        this._nightSteps = parseInt(params["nightSteps"])
        this._lateNightSteps = parseInt(params["lateNightSteps"])
        this._dawnSteps = parseInt(params["dawnSteps"])
        this._lastTimezone = this.nowTimezone() - 1
        this._nextTimezoneSteps = this.getNextTimezoneSteps()
    }

    const _setup = Game_Map.prototype.setup
    Game_Map.prototype.setup = function(mapId) {
        _setup.call(this, mapId)
        this._nightBgm = undefined
        this._isAdvanceTimeMap = undefined
    }

    Game_Map.prototype.nowTimezone = function() {
        return $gameVariables.value(this._timezoneVariableID)
    }

    Game_Map.prototype.changeTimezone = function(timezone) {
        $gameVariables.setValue(this._timezoneVariableID, timezone)
        switch (timezone) {
        case Morning:
            $gameScreen.startTint([-34, -34, 0, 34], 60)
            break
        case Noon:
            $gameScreen.startTint([0, 0, 0, 0], 60)
            break
        case Evening:
            $gameScreen.startTint([68, -34, -34, 0], 60)
            break
        case Night:
            $gameScreen.startTint([-68, -68, 0, 68], 60)
            break
        case LateNight:
            $gameScreen.startTint([-136, -136, 0, 136], 60)
            break
        case Dawn:
            $gameScreen.startTint([-68, -68, 0, 68], 60)
            break
        }
        this._nextTimezoneSteps = this.getNextTimezoneSteps()
    }

    Game_Map.prototype.advanceTimezone = function() {
        if (this.nowTimezone() < Dawn) {
            this.changeTimezone(this.nowTimezone() + 1)
        } else {
            this.changeTimezone(Morning)
        }
    }

    Game_Map.prototype.advanceTime = function() {
        this._nextTimezoneSteps -= 1
        if (this._nextTimezoneSteps === 0) {
            this.advanceTimezone()
        }
    }

    Game_Map.prototype.encounterList = function() {
        return $dataMap.encounterList.filter((encounter) => {
            const encounterTimezone = this.getEncounterTimezone(encounter)
            if (encounterTimezone) {
                if (encounterTimezone === this.nowTimezone()) {
                    return true
                }
                return false
            }
            return true
        })
    }

    Game_Map.prototype.getEncounterTimezone = function(encounter) {
        const troop = $dataTroops[encounter.troopId]
        if (troop.name.match(/^<(.+)>/)) {
            switch (RegExp.$1) {
            case "朝":
                return Morning
            case "昼":
                return Noon
            case "夕方":
                return Evening
            case "夜":
                return Night
            case "深夜":
                return LateNight
            case "夜明け":
                return Dawn
            }
            return null
        }
    }

    Game_Map.prototype.autoplay = function() {
        if ($dataMap.autoplayBgm) {
            if ($gamePlayer.isInVehicle()) {
                $gameSystem.saveWalkingBgm2()
            } else {
                if (this.nowTimezone() >= Night && this.nightBgm()) {
                    AudioManager.playBgm(this.nightBgm())
                } else {
                    AudioManager.playBgm($dataMap.bgm)
                }
            }
        }
        if ($dataMap.autoplayBgs) {
            AudioManager.playBgs($dataMap.bgs)
        }
    }

    Game_Map.prototype.nightBgm = function() {
        if (this._nightBgm === undefined) {
            if ($dataMap.note.match(/^<夜BGM:\s*(.+)>/)) {
                const bgmName = RegExp.$1
                const bgm = {
                    name: bgmName,
                    pan: $dataMap.bgm.pan,
                    pitch: $dataMap.bgm.pitch,
                    volume: $dataMap.bgm.volume
                }
                this._nightBgm = bgm
            } else {
                this._nightBgm = null
            }
        }
        return this._nightBgm
    }

    Game_Map.prototype.isAdvanceTimeMap = function() {
        if (this._isAdvanceTimeMap === undefined) {
            if ($dataMap.note.match(/^<時間経過マップ>/)) {
                this._isAdvanceTimeMap = true
            } else {
                this._isAdvanceTimeMap = false
            }
        }
        return this._isAdvanceTimeMap
    }


    // class Game_Player
    const _increaseSteps = Game_Player.prototype.increaseSteps
    Game_Player.prototype.increaseSteps = function() {
        _increaseSteps.call(this)
        if ($gameMap.isAdvanceTimeMap()) $gameMap.advanceTime()
    }

}
