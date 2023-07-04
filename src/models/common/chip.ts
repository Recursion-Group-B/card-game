import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

const textStyle = {
  font: "35px Arial",
  color: "#000000",
  strokeThickness: 2,
};

export default class Chip extends Phaser.GameObjects.Image {
  private value: number;

  private textStr: string | undefined;

  private text: Text;

  private originScale: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, value: number) {
    super(scene, x, y, textureKey);
    this.value = value;
    this.textStr = value < 1000 ? String(value) : "1K";
    this.originScale = 0.9;

    scene.add.existing(this);

    this.setInteractive();
    this.setScale(this.originScale);
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
        this.setScale(this.originScale - 0.1);
      },
      this
    );
    this.on(
      "pointerup",
      () => {
        this.setScale(this.originScale);
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

  enable(): void {
    this.setInteractive(true);
    this.setVisible(true);
  }

  disable(): void {
    this.setInteractive(false);
    this.setVisible(false);
    this.text.setVisible(false);
  }

  disVisibleText(): void {
    this.text.setVisible(false);
  }

  visibleText(): void {
    this.text.setVisible(true);
  }

  moveTo(toX: number, toY: number, delay: number): void {
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: delay,
      ease: "Linear",
    });
  }
}
