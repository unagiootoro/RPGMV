/*:
    @plugindesc このプラグインの設定は「CreateMagicSystem.js」を直接編集して設定します。
    @author うなぎおおとろ
    @help
    CreateMagicSystem ver1.0
    byうなぎおおとろ(Twitter http://twitter.com/unagiootoro8388)

    魔法名を入力すると自動的に魔法を作成できるようになるスクリプト素材です。
    ルドラの秘宝にある言霊システムみたいなものが作れるようになります。

    このスクリプトを使用する際は、readmeかゲーム内にクレジットの記載が必要です。
    使用報告は不要ですが、もししていただけると作者が喜びます(^O^)
    あと、使用報告してくれた場合、クレジット記載の必要はありません。

    ＜魔法一覧＞
    このスクリプトを導入すると、メニュー画面に「魔法一覧」という項目が追加されます。
    そこで魔法の登録、及び削除を行うことができます。また、Xボタン(shiftキー)を押すことで
    魔法の並び替えを行うことができます。

    ＜イベントで魔法を作成する方法＞
    イベントコマンドのスクリプトで、
    $magics.add("魔法名");
    と入力すると、魔法を作成することができます。
    ゲーム開始から一部の魔法は覚えているようにしたい場合や、人と話すと
    魔法を教えてもらえるようにしたい場合などにお使いください。
*/

var $magics = null;

(function(){
    'use strict';

    var CreateMagicSystem = {

        //ここからは設定です=======================================================

        //入力可能な文字数。
        Max_Char: 6,

        //魔法使用時のメッセージ。
        //「%s」には魔法名が入ります。
        Message: "は%sを唱えた！",

        //作成した魔法の一覧を表示するメニュー名
        Menu_command_name: "魔法一覧",

        //デフォルトの消費MP分散度
        Default_dispersion: "50..150",

        //作成可能な魔法の最大数
        Max_magic_num: 100,
    
        /*
        魔法パターンの設定

        ＜設定方法＞
        [パターン, データベース上のスキル or [派生名, ()の位置], 消費MPの分散度設定]
        という形で設定します。

        パターン… 文字列または正規表現で指定します。
        　　　　　複数のパターンを設定することも可能です。
        　　　　　その場合、
            　　　[パターン1, パターン2, ...]
            　　　というように指定します。
            　　　複数のパターンを指定した場合、それらのパターンのうち、どれか一つでも
            　　　マッチするものがあれば、その設定が使用されます。

            　　　＜正規表現について＞
        　　　　　正規表現は、パターンマッチングに使用されます。
        　　　　　正規表現を使用するには、パターンを//で囲みます。
        　　　　　例えば、/ホイミ/は、"ベホイミ"と"ホイミスライム"の両方とマッチします。
        　　　　　また、正規表現では「^」や「$」といった記号を使用することで、強力な
        　　　　　パターンマッチングを行うことができます。
        　　　　 主な正規表現の記号一覧
        　　　　 「^」前方一致
        　　　　　　　　/^ホイミ/  =>  "ホイミスライム"  マッチする
        　　　　　　　　　　　　   =>  "ベホイミ"　　　　マッチしない
        　　　　 「$」後方一致
        　　　　　　　　/ホイミ$/  =>  "ベホイミ" 　　　 マッチする
        　　　　　　　　　　　　   =>  "ホイミスライム"　マッチしない
        　　　　 「.」任意の１文字
        　　　　　　　　/../  =>  "メラ"  マッチする
        　　　　　　　　　　　 =>  "ギラ"　マッチする
        　　　　 「*」前の文字が０文字以上続く
        　　　　　　　 /プ*ランド/  => "プププランド"　マッチする
        　　　　　　　 /プ*ランド/  => "ランド"　　　　マッチする
        　　　　 「+」前の文字が１文字以上続く
        　　　　　　　　/ロ+/  =>  "ロロロ"  　 マッチする
        　　　　　　　　　　　 =>  "ラララ"　　　マッチしない
                      /.+/   =>  "ギガデイン"　マッチする
    　　　　　　 「[]」[]内のうち１文字
    　　　　　　　　　　/ファイア[１２]/ =>  "ファイア１"　マッチする
    　　　　　　　　　　　　　　　　　　 =>　"ファイア２"　 マッチする
    　　　　　　　　　　　　　　　　　　 =>  "ファイア３"　 マッチしない
        　　　　 

        データベース上のスキル… その名の通り、データベースに登録されたスキルです。
        　　　　　　　　　　　　例えば、"ファイア"と設定した場合、データベースの
        　　　　　　　　　　　　名前がファイアのスキルが実際の魔法となります。
        　　　　　　　　　　　　なお、スキル名を直接入力するほかに、スキルのIDを
        　　　　　　　　　　　　入力することでも、指定することができます。この場合、
        　　　　　　　　　　　　データベースでスキル名が重複していても問題ありません。
        　　　　　　　　　　　　最後に、"スタートスキルID..エンドスキルID"という
        　　　　　　　　　　　　形式で設定した場合、その範囲内から入力された魔法名
        　　　　　　　　　　　　をキーとしてランダムにスキルが選択されます。
        　　　　　　　　　　　　また["10..20", 30, "40..50"]というように設定することで
        　　　　　　　　　　　　複数の範囲を設定することもできます。
                            　この項目を省略した場合、パターンが文字列であれば、
                            　パターンの文字列をデータベース上のスキル名として
                            　扱います。

        [派生名, ()の位置]…「★魔法の派生について」で説明します。

        消費MPの分散度設定… ここに「"最低％..最高％"」という形式で設定することで、
        　　　　　　　　　　同じスキルが元でも魔法名によって消費MPが異なるようにする
        　　　　　　　　　　設定ができます。なお、この項目は省略可能です。
        　　　　　　　　　　省略した場合は、消費MPの分散度設定は適用されません。
        　　　　　　　　　　また、trueを設定した場合、デフォルトの消費MP分散度が
        　　　　　　　　　　適用されます。


        事前に用意された設定を参考にすると、割と分かりやすいかと思うので、
        ２番目の設定の
        [/^レフ/, "ヒール", "50..150"],
        を例に説明します。
        この場合、レフから始まる何かしらの魔法名が入力された場合、ヒールを
        指定することを表します。また、その際消費MPは入力された魔法名によって
        ５０％～１５０％の間で変化することを表します。

        なお、設定は上に記述されものから優先的に適応されます。
        そのため、[/メラ/, "ファイア"], [/メラミ/, "ファイアⅡ"],
        という順に設定すると、メラミの正体はファイアⅡでなく、ファイアに
        なってしまうので、注意してください。


        ★魔法の派生について
        特定のワードが末尾にある場合、そのワードを除いた魔法名から作成される魔法の
        効果範囲を全体化したい場合などに使用します。派生を使用するときは、
        [パターン, [派生名, パターン中の()の位置]]
        の形式で設定します。なお、この場合、消費MPの分散度設定は使用しません。

        パターン…正規表現を指定します。複数の正規表現を指定することも可能です。

        派生名…魔法を派生される場合に、どのような派生を行うのかを識別するために
        　　　 使用します。

        ()の位置…パターンの正規表現//の中で、左から何番目の()を
        　　　　 使用するのかを示します。一番左の場合、1になります。

        [/(.+)ナ$/, ["全体", 1]]
        を例に説明します。
        この場合、/(.+)ナ$/は、最後がナとなる文字列すべてとマッチします。
        そして、パターン中の１番目の  ()の中の.+のパターン該当する文字列、
        すなわち入力された文字列からナを取り除いた文字列をキーとし、
        魔法パターンを再検索します。そして該当するパターンを発見した場合、
        そのパターンから特定されたデータベース上のスキルをもとに派生設定の
        テーブルを検索し、一致するデータを発見するとそのデータにある派生先魔法に
        該当するデータベース上のスキルの効果を持つ魔法を作成します。

        例えば、イグナと入力された場合、最初に１番目の設定とマッチし、
        次にイグナから抽出されたイグが３番目の設定とマッチします。
        このとき、イグの対象となるファイアは派生設定では、派生名が"全体"のとき
        スパークに派生すると設定されているため、イグナはデータベース上の
        スパークに該当する魔法として作成されます。
        */
        Magic_table: [
            [/(.+)ナ$/, ["全体", 1]],
            [/レフ/, "ヒール", "50..150"],
            [/イグ/, "ファイア", "50..150"],
            [/デイン$/, "スパーク", "50..150"],
            ["ファイア"],
            ["ヒール"],
            ["スパーク"],
            [/.+/, "8..10", true]
        ],
    
        /*
        魔法の派生設定
        [派生元魔法、派生名、派生先魔法]の形式で設定します。

        派生元魔法…派生元のスキルのデータベース上での名前、
                　もしくはスキルIDを設定します。
                    
        派生名…派生の種別を識別するために設定する名前です。

        派生先魔法…派生先のスキルのデータベース上での名前、
                　もしくはスキルIDを設定します。
        */
        Magic_derive: [
            ["ファイア", "全体", "スパーク"]
        ]
    };

    class Xorshift{
        constructor(seed){
            this.x = 123456789;
            this.y = 362436069;
            this.z = 521288629;
            this.w = seed;
        }

        xor128(){
            var t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
            return this.w;
        }

        rand(obj){
            var abs = Math.abs(this.xor128());
            if(typeof obj === "number"){
                return abs % obj;
            }
            return (abs % (obj.max - obj.min + 1)) + obj.min;
        }
    }


    class Range{
        constructor(str){
            var ary = str.split("..");
            this.min = parseInt(ary[0]);
            this.max = parseInt(ary[1]);
        }

        toArray(){
            var ary = [];
            for(var i = this.min; i <= this.max; i++){
                ary.push(i);
            }
            return ary;
        }
    }


    class Magics{
        constructor(){
            this._magics = [];
        }

        push(magic){
            if(!magic) return null;
            this._magics.push(magic);
            $dataSkills.push(magic);
        }

        setArray(magics){
            this._magics = magics;
        }

        getArray(){
            return this._magics;
        }

        isIncludeMagic(magicName){
            for(var i = 0; i < this._magics; i++){
                var magic = this._magics[i];
                if(!magic) return false;
                if(magic.name == magicName) return i;
            }
            return false;
        }

        deleteMagic(magicName){
            for(var i = 0; i < this._magics.length; i++){
                var magic = this._magics[i];
                if(magic.name == magicName){
                    this._magics[i] = null;
                    $dataSkills[magic.id] = null;
                }
            }
            this._magics = this._magics.filter((magic) =>{
                return magic ? true : false;
            });
        }

        add(name){
            var i = this.isIncludeMagic(name);
            if(i){
                var magic = this._magics[i];
                this._magics.push(magic);
            }else{
                this.push(this._createMagic.apply(this, this._searchSkill(name)));
            }
        }

        _compare(x, y){
            if(x > y){
                return 1;
            }else if(x < y){
                return -1
            }
            return 0;
        }

        sortById(){
            this._magics.sort((magic1, magic2) =>{
                var res = this._compare(magic1.fromId, magic2.fromId);
                return res == 0 ? this._compare(magic1.mpCost, magic2.mpCost) : res;
            });
        }

        sortByAiueo(){
            var getIntCoad = (str) =>{
                for(var i = 0; i < 24; i++){
                    str += (0).toString();
                }
                return parseInt(str.slice(0, 23), 16);
            }
            this._magics.sort((magic1, magic2) =>{
                var x = getIntCoad(this._strToCode(magic1.name));
                var y = getIntCoad(this._strToCode(magic2.name));
                return this._compare(x, y);
            });
        }

        _searchSkill(name){
            for(var ary of CreateMagicSystem.Magic_table){
                var key = ary[0];
                var val = ary[1];
                if(typeof val === "string" && val.match(/.+\.\..+/)){
                    val = new Range(val);
                }
                var dispersion = ary[2];
                if(typeof dispersion === "string"){
                    dispersion = new Range(dispersion);
                }
                ary = this._judgeKey(key, name);
                var res = ary[0];
                var md = ary[1];
                var skill = null;
                var hashName;
                if(!res) continue;
                if(typeof val === "string"){
                    skill = this._searchSkillByName(val);
                }else if(typeof val === "number"){
                    skill = $dataSkills[val];
                }else if(val instanceof Range){
                    skill = this._skillRandom(name, [val]);
                }else if(val instanceof Array){
                    if(typeof val[0] === "string"){
                        ary = this._getDeriveSkill(val[0], md[val[1]]);
                        if(ary){
                            skill = ary[0];
                            dispersion = ary[1];
                            hashName = ary[2];
                        }
                    }else{
                        skill = this._skillRandom(name, val);
                    }
                }else if(!val){
                    skill = this._searchSkillByName(key);
                }
                if(!skill) continue;
                return [skill, name, dispersion, hashName];
            }
            return null;
        }

        _judgeKey(key, name){
            var res;
            var judgePtn = (ptn, name) =>{
                if(typeof ptn === "string"){
                    if(ptn === name) return [true, null];
                }else if(ptn instanceof RegExp){
                    var md = name.match(ptn);
                    if(md) return [true, md];
                }
                return null;
            }
            if(key instanceof Array){
                for(var ptn of key){
                    res = judgePtn(ptn, name);
                    if(res) return res;
                }
            }
            res = judgePtn(key, name);
            if(res) return res;
            return [false, null];
        }

        _searchSkillByName(name){
            for(var skill of $dataSkills){
                if(!skill) continue;
                if(skill.name === name) return skill;
            }
            return null;
        }

        _getDeriveSkill(derive, key){
            var ary = this._searchSkill(key);
            var skill = ary[0];
            var name = ary[1];
            var dispersion = ary[2];
            for(ary of CreateMagicSystem.Magic_derive){
                var name1 = ary[0];
                var derive2 = ary[1];
                var name2 = ary[2];
                if(name1 === skill.name && derive === derive2){
                    return [this._searchSkillByName(name2), dispersion, name];
                }
            }
            return null;
        }

        _createMagic(skill, name, dispersion, hashName){
            if(!skill) return null;
            var magic = {};
            Object.assign(magic, skill);
            magic.fromId = magic.id;
            magic.id = $dataSkills.length;
            magic.name = name;
            magic.message1 = CreateMagicSystem.Message;
            if(dispersion){
                if(dispersion === true){
                    dispersion = new Range(CreateMagicSystem.Default_dispersion);
                }
                if(!hashName) hashName = name;
                var hashNum = this._getHashNum(hashName, dispersion);
                magic.mpCost = Math.round(magic.mpCost * hashNum / 100);
            }
            return magic;
        }

        _skillRandom(name, magicRange){
            var ary = [];
            for(var obj of magicRange){
                if(typeof obj === "number"){
                    ary.push(obj);
                }else if(obj instanceof Range){
                    ary = ary.concat(obj.toArray());
                }
            }
            var id = ary[this._getHashNum(name, ary.length)];
            return $dataSkills[id];
        }

        _getHashNum(name, randVal){
            var seed = parseInt(this._strToCode(name), 16);
            var rnd = new Xorshift(seed);
            return rnd.rand(randVal);
        }

        _strToCode(str){
            var ary = [];
            for(var i = 0; i < str.length; i++){
                var c = str.charCodeAt(i).toString(16);
                ary.push(("00" + c).slice(-4));
            }
            return ary.join("");
        }

    }

    var _createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function(){
        _createGameObjects.call(this);
        $magics = new Magics();
    }


    class Scene_MagicName extends Scene_MenuBase{
        start(){
            super.start();
            this.createEditWindow();
            this.createInputWindow();
            this._editWindow.refresh();
        }

        createEditWindow(){
            var maxLength = CreateMagicSystem.Max_Char;
            this._editWindow = new Window_MagicNameEdit(this._skillId, maxLength);
            this.addWindow(this._editWindow);
        }

        createInputWindow(){
            this._inputWindow = new Window_MagicNameInput(this._editWindow);
            this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
            this._inputWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._inputWindow);
        }

        onInputOk(){
            $magics.add(this._editWindow.name());
            this.popScene();
        }
    }


    class Window_MagicNameEdit extends Window_Base{
        initialize(skillId, maxLength){
            var width = this.windowWidth();
            var height = this.windowHeight();
            var x = (Graphics.boxWidth - width) / 2;
            var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 8)) / 2;
            super.initialize(x, y, width, height);
            this._skillId = skillId;
            this._maxLength = maxLength;
            this._name = "";
            this._index = this._name.length;
            this.deactivate();
            this.refresh();
        }

        windowWidth(){
            return 480;
        }

        windowHeight(){
            return this.fittingHeight(1);
        }

        name(){
            return this._name;
        }

        restoreDefault(){}

        add(ch){
            if(this._index >= this._maxLength) return false;
            this._name += ch;
            this._index++;
            this.refresh();
            return true;
        }

        back(){
            if(this._index === 0) return false;
            this._index--;
            this._name = this.name().slice(0, this._index);
            this.refresh();
            return true;
        }

        faceWidth(){
            return 144;
        }

        charWidth(){
            var text = $gameSystem.isJapanese() ? '\uff21' : 'A';
            return this.textWidth(text);
        }

        left(){
            return this._maxLength * this.charWidth() - this.charWidth() * 2 / 2;       
        }

        itemRect(index){
            return {
                x: this.left() + index * this.charWidth(),
                y: 0,
                width: this.charWidth(),
                height: this.lineHeight()
            };
        }

        underlineRect(index){
            var rect = this.itemRect(index);
            rect.x++;
            rect.y += rect.height - 4;
            rect.width -= 2;
            rect.height = 2;
            return rect;
        }

        underlineColor(){
            return this.normalColor();
        }

        drawUnderline(index){
            var rect = this.underlineRect(index);
            var color = this.underlineColor();
            this.contents.paintOpacity = 48;
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            this.contents.paintOpacity = 255;
        }

        drawChar(index){
            var rect = this.itemRect(index);
            this.resetTextColor();
            this.drawText(this._name[index] || '', rect.x, rect.y);
        }

        refresh(){
            this.contents.clear();
            for(var i = 0; i < this._maxLength; i++){
                this.drawUnderline(i);
            }
            for(var i = 0; i < this._name.length; i++){
                this.drawChar(i);
            }
            var rect = this.itemRect(this._index);
            this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
        }
    }


    class Window_MagicNameInput extends Window_NameInput{
        table(){
            return [Window_MagicNameInput.StringTable];
        }

        onNameOk(){
            if(this._editWindow.name() === ""){
                if(this._editWindow.restoreDefault()){
                    SoundManager.playOk();
                }else{
                    SoundManager.playBuzzer();
                }
            }else{
                SoundManager.playOk();
                this.callOkHandler();
            }
        }

        onCancel(){
            SoundManager.playCancel();
            this.callCancelHandler();
        }

        cursorDown(wrap){
            if(this._index === 70){
                this._index = 80;
            }else if(this._index === 78){
                this._index = 88;
            }else if(this._index === 79){
                this._index = 89;
            }else if(this._index === 70 || wrap){
                if(this._index === 80){
                    this._index = 0;
                }else if(this._index === 88){
                    this._index = 8;
                }else if(this._index === 89){
                    this._index = 9;
                }else{
                    this._index = (this.index() + 10) % 80;
                }
            }
        }

        cursorUp(wrap){
            if(this._index === 10){
                this._index = 0;
            }else if(this._index === 18){
                this._index = 8;
            }else if(this._index === 19){
                this._index = 9;
            }else if(this._index === 10 || wrap){
                if(this._index === 0){
                    this._index = 80;
                }else if(this._index === 8){
                    this._index = 88;
                }else if(this._index === 9){
                    this._index = 89;
                }else{
                    this._index = (this.index() + 70) % 80;
                }
            }
        }

        cursoeRight(wrap){
            if(this._index === 89 && wrap){
                this._index = 80;
            }else if(this._index === 80){
                this._index = 88;
            }else if(this._index === 88){
                this._index = 89;
            }else if(this._index % 10 < 9 && this._index < 81){
                this._index++;
            }else if(wrap){
                this._index -= 9;
            }
        }

        cursoeLeft(wrap){
            if(this._index === 80 && wrap){
                this._index = 89;
            }else if(this._index === 88){
                this._index = 80;
            }else if(this._index % 10 > 0){
                this._index--;
            }else if(wrap){
                this._index += 9;
            }
        }

        Character(){
            return this._index < 88 ? this.table()[this._page][this._index] : "";
        }

        isCancel(){
            return this._index === 88;
        }

        processOk(){
            if (this.character()) {
                this.onNameAdd();
            } else if (this.isCancel()) {
                this.onCancel();
            } else if (this.isOk()) {
                this.onNameOk();
            }
        };
    }

    Window_MagicNameInput.StringTable = [
        'ア','イ','ウ','エ','オ',  'ガ','ギ','グ','ゲ','ゴ',
        'カ','キ','ク','ケ','コ',  'ザ','ジ','ズ','ゼ','ゾ',
        'サ','シ','ス','セ','ソ',  'ダ','ヂ','ヅ','デ','ド',
        'タ','チ','ツ','テ','ト',  'バ','ビ','ブ','ベ','ボ',
        'ナ','ニ','ヌ','ネ','ノ',  'パ','ピ','プ','ペ','ポ',
        'ハ','ヒ','フ','ヘ','ホ',  'ァ','ィ','ゥ','ェ','ォ',
        'マ','ミ','ム','メ','モ',  'ッ','ャ','ュ','ョ','ー',
        'ヤ','ユ','ヨ','ワ','ン',  'ラ','リ','ル','レ','ロ',
        'ヴ', '', '',  '',  '',    '',  '',  '',  '取消', '決定'
    ];

    var _makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function(){
        var contents = _makeSaveContents.call(this);
        contents.magics = $magics.getArray();
        contents.skills = $dataSkills;
        return contents;
    }

    var _extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents){
        _extractSaveContents.call(this, contents);
        $magics.setArray(contents.magics);
        $dataSkills = contents.skills;
    }

    Game_Actor.prototype.skills = function(){
        var list = [];
        this._skills.concat(this.addedSkills()).forEach((id) =>{
            if (!list.contains($dataSkills[id])) {
                list.push($dataSkills[id]);
            }
        });
        return list.concat($magics.getArray());
    }

    var _addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function(){
        _addOriginalCommands.call(this);
        this.addCommand(CreateMagicSystem.Menu_command_name, "magic_list");
    }

    var _createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function(){
        _createCommandWindow.call(this);
        this._commandWindow.setHandler("magic_list", this.commandMagicList.bind(this));
    }

    Scene_Menu.prototype.commandMagicList = function(){
        SceneManager.push(Scene_MagicList);
    }


    class Scene_MagicList extends Scene_MenuBase{
        start(){
            super.start();
            this.createHelpWindow();
            this.createWindowMagicList();
            this.createWindowMagicControl();
            this.createWindowMagicSort();
        }

        update(){
            super.update();
            if(Input.isTriggered("shift")){
                this.magicSort();
            }
        }

        createWindowMagicList(){
            var y = this._helpWindow.height;
            var height = Graphics.boxHeight - y;
            this._windowMagicList = new Window_MagicList(0, y, Graphics.boxWidth, height);
            this._windowMagicList.setHandler("ok", this.magicListOk.bind(this));
            this._windowMagicList.setHandler("cancel", this.popScene.bind(this));
            this._windowMagicList.setHelpWindow(this._helpWindow);
            this._windowMagicList.refresh();
            this._windowMagicList.activate();
            this._windowMagicList.showHelpWindow();
            this.addWindow(this._windowMagicList);
        }

        createWindowMagicControl(){
            this._windowMagicControl = new Window_MagicControl();
            this._windowMagicControl.setHandler("delete", this.magicControlDelete.bind(this));
            this._windowMagicControl.setHandler("no_delete", this.magicControlCancel.bind(this));
            this._windowMagicControl.setHandler("cancel", this.magicControlCancel.bind(this));
            this.addWindow(this._windowMagicControl);
        }

        createWindowMagicSort(){
            this._windowMagicSort = new Window_MagicSort();
            this._windowMagicSort.setHandler("sort_by_id", this.magicSortById.bind(this));
            this._windowMagicSort.setHandler("sort_by_aiueo", this.magicSortByAiueo.bind(this));
            this._windowMagicSort.setHandler("no_sort", this.magicSortCancel.bind(this));
            this._windowMagicSort.setHandler("cancel", this.magicSortCancel.bind(this));
            this.addWindow(this._windowMagicSort);
        }

        magicListOk(){
            if(this._windowMagicList.item()){
                this._windowMagicControl.open();
                this._windowMagicControl.activate();
            }else{
                this._windowMagicList.hideHelpWindow();
                SceneManager.push(Scene_MagicName);
            }
        }

        magicControlDelete(){
            $magics.deleteMagic(this._windowMagicList.item().name);
            this.magicControlCancel();
            this._windowMagicList.refresh();
        }

        magicControlCancel(){
            this._windowMagicControl.close();
            this._windowMagicControl.deactivate();
            this._windowMagicList.activate();
        }

        magicSort(){
            if(Input.isTriggered("shift")){
                this.magicControlCancel();
                this._windowMagicList.deactivate();
                this._windowMagicSort.open();
                this._windowMagicSort.activate();
            }
        }

        magicSortById(){
            $magics.sortById();
            this.magicSortCancel();
            this._windowMagicList.refresh();
        }

        magicSortByAiueo(){
            $magics.sortByAiueo();
            this.magicSortCancel();
            this._windowMagicList.refresh();
        }

        magicSortCancel(){
            this._windowMagicSort.close();
            this._windowMagicSort.deactivate();
            this._windowMagicList.activate();
        }
    }


    class Window_MagicList extends Window_Selectable{
        initialize(x, y, width, height){
            super.initialize(x, y, width, height);
            this._index = 0;
            this._stypeId = 1;
            this._data = [];
        }

        maxCols(){
            return 2;
        }

        maxItems(){
            if(this._data){
                if(this._data.length < CreateMagicSystem.Max_magic_num){
                    return this._data.length + 1;
                }else{
                    return this._data.length;
                }
            }else{
                return 1;
            }
        }

        item(){
            if(this._data && this._index >= 0){
                return this._data[this._index];
            }else{
                return null;
            }
        }

        makeItemList(){
            this._data = $magics.getArray();
        }

        drawItem(index){
            var skill = this._data[index];
            if(skill){
                var rect = this.itemRect(index);
                rect.width -= 4;
                this.drawItemName(skill, rect.x, rect.y, rect.width);
                this.drawSkillCost(rect, skill);
            }
        }

        drawSkillCost(rect, skill){
            this.changeTextColor(this.mpCostColor());
            this.drawText(skill.mpCost.toString(), rect.x, rect.y, rect.width, "right");
        }

        updateHelp(){
            if(this.item()){
                this.setHelpWindowItem(this.item());
            }else{
                this._helpWindow.setText("新しい魔法を追加します。");
            }
        }

        refresh(){
            this.makeItemList();
            this.createContents();
            this.drawAllItems();
        }
    }


    class Window_MagicControl extends Window_Command{
        initialize(){
            super.initialize(0, 0);
            this.updatePlacement();
            this.openness = 0;
        }

        updatePlacement(){
            this.x = (Graphics.boxWidth - this.width) / 2;
            this.y = (Graphics.boxHeight - this.height) / 2;
        }

        makeCommandList(){
            this.addCommand("削除する", "delete");
            this.addCommand("削除しない", "no_delete");
        }
    }


    class Window_MagicSort extends Window_Command{
        initialize(){
            super.initialize(0, 0);
            this.updatePlacement();
            this.openness = 0;
        }

        windowWidth(){
            return 420;
        }

        updatePlacement(){
            this.x = (Graphics.boxWidth - this.width) / 2;
            this.y = (Graphics.boxHeight - this.height) / 2;
        }

        makeCommandList(){
            this.addCommand("並び替える(種類順)", "sort_by_id");
            this.addCommand("並び替える(アイウエオ順)", "sort_by_aiueo");
            this.addCommand("並び替えない", "no_sort");
        }
    }

}).call(this);
