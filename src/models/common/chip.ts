import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

const textStyle = {
  font: "30px Arial",
  color: "#000000",
  strokeThickness: 2,
};

export default class Chip extends Phaser.GameObjects.Image {
  private value: number;

  private textStr: string | undefined;

  private text: Text;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, value: number) {
    super(scene, x, y, textureKey);
    this.value = value;
    this.textStr = String(value);
    scene.add.existing(this);
    this.setInteractive();
    this.setScale(0.8);
    this.setPushAnimation();

    this.text = this.scene.add.text(0, 0, this.textStr, textStyle);
    Phaser.Display.Align.In.Center(this.text, this);
  }

  get getValue(): number {
    return this.value;
  }

  private setPushAnimation(): void {
    this.on(
      "pointerdown",
      () => {
        this.scene.tweens.add({
          targets: this,
          scaleX: 0.7,
          scaleY: 0.7,
          duration: 100,
          yoyo: true,
          ease: "Power1",
        });
      },
      this
    );
  }

  setClickHandler(pushHandler: () => void): void {
    this.on(
      "pointerdown",
      () => {
        pushHandler();
      },
      this
    );
  }
}
