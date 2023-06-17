import Phaser from "phaser";

export default class Example extends Phaser.Scene {
  constructor() {
    super({ key: "draw" });
  }

  preload() {
    this.load.setBaseURL("https://labs.phaser.io");
    this.load.atlas("cards", "assets/atlas/cards.png", "assets/atlas/cards.json");
  }

  create() {
    //  Create a stack of random cards

    const frames = this.textures.get("cards").getFrameNames();

    let x = 100;
    let y = 100;

    for (let i = 0; i < 64; i + 1) {
      this.add.image(x, y, "cards", Phaser.Math.RND.pick(frames)).setInteractive();

      x += 4;
      y += 4;
    }

    this.input.on(
      "gameobjectdown",
      function draw(
        this: Phaser.Scene,
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image
      ) {
        //  Will contain the top-most Game Object (in the display list)
        console.log(pointer);
        this.tweens.add({
          targets: gameObject,
          x: { value: 1100, duration: 1500, ease: "Power2" },
          y: {
            value: 500,
            duration: 500,
            ease: "Bounce.easeOut",
            delay: 150,
          },
        });
      },
      this
    );

    const change = this.add
      .text(400, 130, "Change Scene!")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    change.on(
      "pointerdown",
      function pointerDown(this: Phaser.Scene, pointer: Phaser.Input.Pointer) {
        console.log(pointer);
        this.scene.start("drop");
      },
      this
    );
  }
}
