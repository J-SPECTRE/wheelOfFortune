let game;

let gameOptions = {
  // slice colors
  slices: [
    {
      startColor: 0xff0000,
      endColor: 0xff8800,
      rings: 3,
      text: "RED/ORANGE"
    },
    {
      startColor: 0x00ff00,
      endColor: 0x004400,
      rings: 200,
      text: "GREEN"
    },
    {
      startColor: 0xff00ff,
      endColor: 0x0000ff,
      rings: 10,
      text: "PURPLE/BLUE"
    },
    {
      startColor: 0x666666,
      endColor: 0x999999,
      rings: 200,
      text: "GREY"
    },
    {
      startColor: 0x000000,
      endColor: 0xffff00,
      rings: 1,
      text: "YELLOW"
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
    width: 550,
    height: 550,
    backgroundColor: "#f5f5f5",
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
  }

  create() {
    //auto graphics slices  (利用creator构造器，可自主决定是否加入舞台)
    let sliceDegrees = 360 / gameOptions.slices.length;
    let graphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    for (let i = 0; i < gameOptions.slices.length; i++) {
      // 将颜色转换为Phaser的Color类的实例
      let startColor = Phaser.Display.Color.ValueToColor(
        gameOptions.slices[i].startColor
      );
      let endColor = Phaser.Display.Color.ValueToColor(
        gameOptions.slices[i].endColor
      );
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
          Phaser.Math.DegToRad(270 + i * sliceDegrees),
          Phaser.Math.DegToRad(270 + (i + 1) * sliceDegrees),
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
        Phaser.Math.DegToRad(270 + i * sliceDegrees),
        Phaser.Math.DegToRad(270 + (i + 1) * sliceDegrees),
        false
      );

      graphics.strokePath();
    }

    graphics.generateTexture(
      "wheel",
      (gameOptions.wheelRadius + gameOptions.StrokeWidth) * 2,
      (gameOptions.wheelRadius + gameOptions.StrokeWidth) * 2
    );
    //  转盘sprite
    //  sprite与image对象的主要区别是image不可应用动画类
    this.wheel = this.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "wheel"
    );
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
        color: "black"
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

      let prize =
        gameOptions.slices.length -
        1 -
        Math.floor(degrees / (360 / gameOptions.slices.length));

      this.isCanPin = false;

      this.tweens.add({
        targets: [this.wheel],
        angle: 360 * rounds + degrees,
        duration: gameOptions.duration,
        ease: "Cubic.easeOut",
        callbackScope: this,
        onComplete: function(tween) {
          this.prizeText.setText(gameOptions.slices[prize].text);
          this.isCanPin = true;
        }
      });
    }
  }
}

function resize() {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = game.config.width / game.config.height;
  console.log(windowRatio, gameRatio);
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowWidth / gameRatio + "px";
  } else {
    canvas.style.width = windowHeight * gameRatio + "px";
    canvas.style.height = windowHeight + "px";
  }
}
