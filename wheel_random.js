let game;

let gameOptions = {
  // slice colors
  slices: [
    {
      degrees: 40,
      startColor: 0xff0000,
      endColor: 0xff8800,
      rings: 3,
      iconFrame: 1,
      iconScale: 0.4,
      text: "BANANA"
    },
    {
      degrees: 60,
      startColor: 0x00ff00,
      endColor: 0x004400,
      rings: 200,
      iconFrame: 0,
      iconScale: 0.4,
      text: "PEAR"
    },
    {
      degrees: 125,
      startColor: 0xff00ff,
      endColor: 0x0000ff,
      rings: 10,
      iconFrame: 2,
      iconScale: 0.4,
      text: "ORANGE"
    },
    {
      degrees: 45,
      startColor: 0x666666,
      endColor: 0x999999,
      rings: 200,
      iconFrame: 3,
      iconScale: 0.4,
      text: "STRAWBERRY"
    },
    {
      degrees: 90,
      startColor: 0x000000,
      endColor: 0xffff00,
      rings: 1,
      iconFrame: 4,
      iconScale: 0.4,
      text: "CHERRY"
    }
  ],
  StrokeWidth: 5,
  StrokeColor: 0x00ffffff,
  duration: 3000,
  wheelRadius: 250
};

window.onload = function() {
  let gameConfig = {
    type: Phaser.Canvas,
    width: 600,
    height: 600,
    backgroundColor: "0x00000000",
    scene: [playGame]
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
  resize();
  window.addEventListener("resize", resize, false);
};

class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    //  this.load.image("wheel", "wheel.png");
    this.load.image("pin", "pin.png");

    this.load.spritesheet("icons", "icons.png", {
      frameWidth: 256,
      frameHeight: 256
    });
  }

  create() {
    //auto graphics slices  (利用creator构造器，可自主决定是否加入舞台)
    let graphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });
    this.wheelContainer = this.add.container(
      game.config.width / 2,
      game.config.height / 2
    );

    let iconArray = [],
      startDegree = -90;
    for (let i = 0; i < gameOptions.slices.length; i++) {
      // 将颜色转换为Phaser的Color类的实例
      let startColor = Phaser.Display.Color.ValueToColor(
        gameOptions.slices[i].startColor
      );
      let endColor = Phaser.Display.Color.ValueToColor(
        gameOptions.slices[i].endColor
      );
      // 计算每次循环的slice起止角度
      // 对切片按环数分别上色
      for (let j = gameOptions.slices[i].rings; j > 0; j--) {
        let interColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          startColor,
          endColor,
          gameOptions.slices[i].rings,
          j
        );
        let interColorString = Phaser.Display.Color.RGBToString(
          Math.round(interColor.r),
          Math.round(interColor.g),
          Math.round(interColor.b),
          0,
          "0x"
        );
        graphics.fillStyle(interColorString, 1);
        graphics.slice(
          gameOptions.wheelRadius + gameOptions.StrokeWidth,
          gameOptions.wheelRadius + gameOptions.StrokeWidth,
          (j * gameOptions.wheelRadius) / gameOptions.slices[i].rings,
          Phaser.Math.DegToRad(startDegree),
          Phaser.Math.DegToRad(startDegree + gameOptions.slices[i].degrees),
          false
        );
        graphics.fillPath();
      }
      graphics.lineStyle(gameOptions.StrokeWidth, gameOptions.StrokeColor, 1);
      // svg默认从顺时针90度开始path
      graphics.slice(
        gameOptions.wheelRadius + gameOptions.StrokeWidth,
        gameOptions.wheelRadius + gameOptions.StrokeWidth,
        gameOptions.wheelRadius,
        Phaser.Math.DegToRad(startDegree),
        Phaser.Math.DegToRad(startDegree + gameOptions.slices[i].degrees),
        false
      );

      graphics.strokePath();

      let icon = this.add.image(
        gameOptions.wheelRadius *
          0.75 *
          Math.cos(
            Phaser.Math.DegToRad(
              startDegree + gameOptions.slices[i].degrees / 2
            )
          ),
        gameOptions.wheelRadius *
          0.75 *
          Math.sin(
            Phaser.Math.DegToRad(
              startDegree + gameOptions.slices[i].degrees / 2
            )
          ),
        "icons",
        gameOptions.slices[i].iconFrame
      );

      icon.scaleX = gameOptions.slices[i].iconScale;
      icon.scaleY = gameOptions.slices[i].iconScale;

      icon.angle = startDegree + gameOptions.slices[i].degrees / 2 + 90;

      iconArray.push(icon);

      startDegree += gameOptions.slices[i].degrees;
    }

    graphics.generateTexture(
      "wheel",
      (gameOptions.wheelRadius + gameOptions.StrokeWidth) * 2,
      (gameOptions.wheelRadius + gameOptions.StrokeWidth) * 2
    );
    //  转盘sprite
    //  sprite与image对象的主要区别是image不可应用动画类
    let wheel = this.add.sprite(0, 0, "wheel");
    this.wheelContainer.add(wheel);
    this.wheelContainer.add(iconArray);
    // 指针sprite
    this.pin = this.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "pin"
    );
    // 指针文本
    this.prizeText = this.add.text(
      game.config.width / 2,
      game.config.height - 20,
      "Click It !",
      {
        font: "bold 32px Arial",
        align: "center",
        color: "white"
      }
    );

    this.prizeText.setOrigin(0.5);

    this.isCanPin = true;

     this.input.on("pointerdown", this.spinWheel, this);
  }

  spinWheel() {
    if (this.isCanPin) {
      this.prizeText.setText("");
      // 转动圈数
      let rounds = Phaser.Math.Between(2, 4);
      // 转动角度
      let degrees = Phaser.Math.Between(0, 360);

      let backDegrees = Phaser.Math.Between(1, 4);

      let prize = 0,
        add = 0;
      for (var i = gameOptions.slices.length - 1; i >= 0; i--) {
        // adding current slice angle to prizeDegree
        add += gameOptions.slices[i].degrees;

        // if it's greater than the random angle...
        if (add > degrees - backDegrees) {
          // we found the prize
          prize = i;
          break;
        }
      }

      console.log(degrees, backDegrees, prize);

      this.isCanPin = false;

      this.tweens.add({
        targets: [this.wheelContainer],
        angle: 360 * rounds + degrees,
        duration: gameOptions.duration,
        ease: "Cubic.easeOut",
        callbackScope: this,
        onComplete: function(tween) {
          this.tweens.add({
            targets: [this.wheelContainer],
            angle: this.wheelContainer.angle - backDegrees,
            duration: 1000,
            ease: "Cubic.easeIn",
            callbackScope: this,
            onComplete: function(tween) {
              this.prizeText.setText(gameOptions.slices[prize].text);
              this.isCanPin = true;
            }
          });
        }
      });
    }
  }
}

function resize() {
  var canvas = document.querySelector("canvas");
  console.log("resize");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = game.config.width / game.config.height;
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowWidth / gameRatio + "px";
  } else {
    canvas.style.width = windowHeight * gameRatio + "px";
    canvas.style.height = windowHeight + "px";
  }
}
