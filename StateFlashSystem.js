// Generated by CoffeeScript 1.12.7

/*:
  @plugindesc StateFlashSystem ver1.1
  @author うなぎおおとろ(http://twitter.com/unagiootoro8388)
  @param loopFlashFrame
  @default 60
  @desc 
  フラッシュするフレーム数
  60なら1秒に1回フラッシュします
  @param enemyStateFlash
  @default true
  @desc
  trueを指定すると敵キャラも状態異常の時にフラッシュさせ続けます
  @help
  状態異常の時、キャラクターをフラッシュさせ続けるプラグインです。
  
  [使用方法]
  フラッシュさせる状態異常のメモ欄に
  <color red, green, blue, gray>
  の形式で記述します。red, green, blue, grayには色の値が入ります。
  色の値は0~255の範囲で指定してください。
  例えば、
  <color 255, 0, 0, 0>
  と記述すると、赤色のフラッシュがループします。

  [更新履歴]
  ・フラッシュしないステートになった時のバグを修正
  ・ステート解除時に色が戻らないバグを修正
 */

(function() {
  var DataManager__createGameObjects, Sprite_Base__initialize, Sprite_Base__update, Sprite_Battler__initialize, Sprite_Battler__update;

  DataManager__createGameObjects = DataManager.createGameObjects;

  DataManager.createGameObjects = function() {
    DataManager__createGameObjects.call(this);
    return this.initStatesColor();
  };

  DataManager.initStatesColor = function() {
    var color, j, len, results, state;
    results = [];
    for (j = 0, len = $dataStates.length; j < len; j++) {
      state = $dataStates[j];
      if (!state) {
        continue;
      }
      state.color = null;
      if (state.note.match(/<color (.+)>/)) {
        color = RegExp.$1.replace("\s", "").split(",").map((function(_this) {
          return function(i) {
            return parseInt(i);
          };
        })(this));
        results.push(state.color = color);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Sprite_Base__initialize = Sprite_Base.prototype.initialize;

  Sprite_Base.prototype.initialize = function() {
    Sprite_Base__initialize.call(this);
    this._nowLoopFlash = false;
    this._loopFlashColors = null;
    this._loopFlashColorPtr = 0;
    this._loopFlashFrame = 0;
    this.params = PluginManager.parameters("StateFlashSystem");
    this._maxLoopFlashFrame = parseInt(this.params["loopFlashFrame"]) / 2;
    this._loopFlashFrameAdvance = 1;
    return this.statesColor = new Array($dataStates.length);
  };

  Sprite_Base.prototype.clearColorTone = function() {
    return this.setColorTone([0, 0, 0, 0]);
  };

  Sprite_Base__update = Sprite_Base.prototype.update;

  Sprite_Base.prototype.update = function() {
    Sprite_Base__update.call(this);
    if (this._loopFlashColors) {
      return this.updateLoopFlash();
    }
  };

  Sprite_Base.prototype.updateLoopFlash = function() {
    var color;
    if (this._loopFlashFrame > 0) {
      color = this._loopFlashColors[this._loopFlashColorPtr];
      if (!color) {
        this.clearColorTone();
        this._loopFlashColorPtr = 0;
        return;
      }
      color = color.map((function(_this) {
        return function(n) {
          return n / _this._maxLoopFlashFrame * _this._loopFlashFrame;
        };
      })(this));
      this.setColorTone(color);
    } else {
      this.clearColorTone();
    }
    if (this._loopFlashFrameAdvance > 0 && this._loopFlashFrame >= this._maxLoopFlashFrame || this._loopFlashFrameAdvance < 0 && this._loopFlashFrame <= 0) {
      this._loopFlashFrameAdvance *= -1;
      if (this._loopFlashFrameAdvance > 0) {
        this._loopFlashColorPtr += 1;
        if (this._loopFlashColorPtr === this._loopFlashColors.length) {
          this._loopFlashColorPtr = 0;
        }
      }
    }
    return this._loopFlashFrame += this._loopFlashFrameAdvance;
  };

  Sprite_Base.prototype.setLoopFlashColors = function(colors) {
    if (colors) {
      return this._loopFlashColors = colors;
    } else {
      return this.clearColorTone();
    }
  };

  Sprite_Battler__initialize = Sprite_Battler.prototype.initialize;

  Sprite_Battler.prototype.initialize = function(battler) {
    return Sprite_Battler__initialize.call(this, battler);
  };

  Sprite_Battler__update = Sprite_Battler.prototype.update;

  Sprite_Battler.prototype.update = function() {
    Sprite_Battler__update.call(this);
    if (!this._battler) {
      return;
    }
    if (this instanceof Sprite_Actor) {
      return this._mainSprite.setLoopFlashColors(this.stateColors());
    } else {
      if (this.params["enemyStateFlash"] === "true") {
        return this.setLoopFlashColors(this.stateColors());
      }
    }
  };

  Sprite_Battler.prototype.stateColors = function() {
    var colors, states;
    states = this._battler.states().filter((function(_this) {
      return function(state) {
        return state.color;
      };
    })(this));
    colors = states.map((function(_this) {
      return function(state) {
        return state.color;
      };
    })(this));
    if (colors.length === 0) {
      return null;
    }
    return colors;
  };

}).call(this);
