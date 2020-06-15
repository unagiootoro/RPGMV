/*:
@plugindesc ATBゲージを一本のラインに変更します。
@author うなぎおおとろ(twitter https://twitter.com/unagiootoro8388)

@param viewMode
@type string
@default wide
@desc
wideを設定すると、横にラインを表示します。longを設定すると、縦にラインを表示します。

@param useLineImage
@type boolean
@default false
@desc
trueを設定すると、ラインに画像を使用します。

@param lineImageFileName
@type string
@default line
@desc
ラインに画像を使用する場合、画像のファイル名を指定します。
横方向の場合「720, 32」、縦方向の場合「32, 384」の画像を使用してください。

@param defaultEnemyIconFileName
@type number
@default Monster
@desc
敵キャラアイコンに使用するキャラクター画像のファイル名を指定します。

@param defaultEnemyIconX
@type number
@default 7
@desc
敵キャラアイコンに使用する画像のX方向インデックスを指定します。

@param defaultEnemyIconY
@type number
@default 4
@desc
敵キャラアイコンに使用する画像のY方向インデックスを指定します。

@help
このプラグインは、「ATB.js」の導入が必要です。
「ATBLine.js」は、「ATB.js」よりも後に入れてください。

敵キャラのメモ欄に
<battlerIcon: ["キャラクター画像のファイル名", X方向インデックス, Y方向インデックス]>
を指定すると、任意の敵キャラアイコンを設定することができます。
例えば、 <battlerIcon: ["Evil", 7, 4]> のように指定します。

【ライセンス】
このプラグインは、MITライセンスの条件の下で利用可能です。

【更新履歴】
v1.0.0 新規作成
*/
{
    const param = PluginManager.parameters("ATBLine");
    const viewMode = param["viewMode"];
    const useLineImage = (param["useLineImage"] === "true" ? true : false);
    const lineImageFileName = param["lineImageFileName"];
    const defaultEnemyIconFileName = param["defaultEnemyIconFileName"];
    const defaultEnemyIconX = parseInt(param["defaultEnemyIconX"]);
    const defaultEnemyIconY = parseInt(param["defaultEnemyIconY"]);

    ATBConfig.drawEnemyUnderGauge = true;
    ATBConfig.drawUnderGauge = true;


    Game_Actor.prototype.battlerIconName = function() {
        return this.characterName();
    };

    Game_Actor.prototype.characterBlockX = function() {
        return this.characterIndex() % 4 * 3;
    };

    Game_Actor.prototype.characterBlockY = function() {
        return Math.floor(this.characterIndex() / 4) * 4;
    };


    Game_Enemy.prototype.battlerIconName = function() {
        if (!this.enemy().meta.battlerIcon) return defaultEnemyIconFileName;
        return JSON.parse(this.enemy().meta.battlerIcon)[0];
    };

    Game_Enemy.prototype.characterBlockX = function() {
        if (!this.enemy().meta.battlerIcon) return defaultEnemyIconX;
        return JSON.parse(this.enemy().meta.battlerIcon)[1];
    };

    Game_Enemy.prototype.characterBlockY = function() {
        if (!this.enemy().meta.battlerIcon) return defaultEnemyIconY;
        return JSON.parse(this.enemy().meta.battlerIcon)[2];
    };


    class Sprite_ATBLine extends Sprite {
        static get LINE_WIDTH() {
            if (viewMode === "wide") {
                return Graphics.width - 96;
            } else {
                return 32;
            }
        };

        static get LINE_HEIGHT() {
            if (viewMode === "wide") {
                return 32;
            } else {
                return Graphics.height - 240;
            }
        };

        initialize() {
            const bitmap = this.createBitmap();
            super.initialize(bitmap);
            if (viewMode === "wide") {
                this.x = 48;
                this.y = 24;
            } else {
                this.x = Graphics.width - 48;
                this.y = 24;
            }
        }

        createBitmap() {
            let bitmap;
            if (useLineImage) {
                bitmap = ImageManager.loadPicture(lineImageFileName);
            } else {
                bitmap = new Bitmap(Sprite_ATBLine.LINE_WIDTH, Sprite_ATBLine.LINE_HEIGHT);
                if (viewMode === "wide") {
                    bitmap.fillRect(0, 8, Sprite_ATBLine.LINE_WIDTH, 8, "#000000");
                } else {
                    bitmap.fillRect(8, 0, 8, Sprite_ATBLine.LINE_HEIGHT, "#000000");
                }
            }
            return bitmap;
        }
    }

    class Sprite_LineIcon extends Sprite {
        static get BATTLER_ICON_WIDTH() { return 48 };
        static get BATTLER_ICON_HEIGHT() {
            if (viewMode === "wide") {
                return Sprite_ATBLine.LINE_HEIGHT;
            } else {
                return 32;
            }
        };

        initialize(gauge, x, y) {
            this._gauge = gauge;
            const bitmap = this.loadCharacterBitmap(gauge.battler());
            super.initialize(bitmap);
            this.setupBattlerIcon(gauge.battler(), gauge.purpose);
            this._baseX = x;
            this._baseY = y;
            this.x = x;
            this.y = y;
        }

        update() {
            super.update();
            this.updatePosition();
            if (!this._gauge.isUsable()) this.visible = false;
        }

        updatePosition() {
            if (viewMode === "wide") {
                this.x = this._baseX + (this._gauge.value / 1000) * (Sprite_ATBLine.LINE_WIDTH - Sprite_LineIcon.BATTLER_ICON_WIDTH);
            } else {
                this.y = this._baseY - (this._gauge.value / 1000) * (Sprite_ATBLine.LINE_HEIGHT - Sprite_LineIcon.BATTLER_ICON_HEIGHT / 2);
            }
        }

        loadCharacterBitmap(battler) {
            return ImageManager.loadCharacter(battler.battlerIconName());
        }

        setupBattlerIcon(battler, gaugePurpose) {
            const px = battler.characterBlockX() * 48;
            const py = battler.characterBlockY() * 48;
            this.setFrame(px, py, 48, 32);
        }
    }

    /* class Spriteset_Battle */
    const _Spriteset_Battle_initialize = Spriteset_Battle.prototype.initialize;
    Spriteset_Battle.prototype.initialize = function() {
        _Spriteset_Battle_initialize.call(this);
        this._atbLine = new Sprite_ATBLine();
        this._baseSprite.addChild(this._atbLine);
    }

    Spriteset_Battle.prototype.createGaugeLine = function(battler) {
        if (viewMode === "wide") {
            this._baseSprite.addChild(new Sprite_LineIcon(battler.gauge(), this._atbLine.x, this._atbLine.y - 8));
        } else {
            this._baseSprite.addChild(new Sprite_LineIcon(battler.gauge(), this._atbLine.x - 12, Sprite_ATBLine.LINE_HEIGHT));
        }
    };
};
