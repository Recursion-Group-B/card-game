import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

const textStyle = {
  font: "30px Arial",
  color: "#FFFFFF",
  strokeThickness: 2,
};

export default class Button extends Phaser.GameObjects.Image {
  private textStr: string | undefined;

  private text: Text;

  private originScale: number;

  private clickSound: Phaser.Sound.BaseSound | undefined;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    text: string,
    soundKey = "",
    originScale?: number
  ) {
    super(scene, x, y, textureKey);
    this.originScale = originScale ?? 0.35;
    this.textStr = text;

    scene.add.existing(this);

    this.setInteractive();
    this.setScale(this.originScale);
    this.setPushAnimation();

    this.text = this.scene.add.text(0, 0, this.textStr, textStyle);
    Phaser.Display.Align.In.Center(this.text, this);

    if (soundKey) {
      this.clickSound = this.scene.sound.add(soundKey, { volume: 1.0 });
    }
  }

  private setPushAnimation(): void {
    this.on(
      "pointerdown",
      () => {
        this.setScale(this.originScale - 0.02);
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
        if (this.clickSound) this.clickSound.play();
        pushHandler();
      },
      this
    );
  }

  disable(): void {
    this.setInteractive(false);
    this.setVisible(false);
    this.text.setVisible(false);
  }

  disVisibleText(): void {
    this.text.setVisible(false);
  }

  enable(): void {
    this.setInteractive(true);
    this.setVisible(true);
    this.text.setVisible(true);
  }

  visibleText(): void {
    this.text.setVisible(true);
  }

  removeAll(): void {
    this.text.destroy(true);
    this.destroy(true);
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

  disableClickAnimation() {
    this.off("pointerdown");
    this.off("pointerup");
  }

  toggleSound(isSoundOn: boolean): void {
    if (isSoundOn) {
      this.clickSound?.pause();
    } else {
      this.clickSound?.resume();
    }
  }
}
