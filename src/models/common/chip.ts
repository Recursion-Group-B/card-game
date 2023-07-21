import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

const textStyle = {
  font: "35px Arial",
  color: "#000000",
  strokeThickness: 2,
};

// TODO Containerを継承させる テキストと一緒に動かすため
export default class Chip extends Phaser.GameObjects.Container {
  private value: number;

  private textStr: string | undefined;

  private text: Text;

  private originScale: number;

  private clickSound: Phaser.Sound.BaseSound | undefined;

  private textureKey: string;

  private chip: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    value: number,
    soundKey = ""
  ) {
    super(scene, x, y);
    this.value = value;
    this.textStr = value < 1000 ? String(value) : "1K";
    this.originScale = 0.9;
    this.textureKey = textureKey;

    // children
    this.chip = this.scene.add.image(0, 0, this.textureKey);
    this.text = this.scene.add.text(0, 0, this.textStr, textStyle).setOrigin(0.5);

    this.setSize(125, 125);
    this.setInteractive();
    this.add([this.chip, this.text]);
    this.setScale(this.originScale);
    this.setPushAnimation();
    scene.add.existing(this);

    if (soundKey) {
      this.clickSound = this.scene.sound.add(soundKey, { volume: 0.6 });
    }
  }

  get getValue(): number {
    return this.value;
  }

  get getSound(): Phaser.Sound.BaseSound {
    return this.clickSound;
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
        if (this.clickSound) this.clickSound.play();
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

  moveToLocate(toX: number, toY: number, delay: number): void;
  moveToLocate(toX: number, toY: number, delay: number, fade: number): void;
  moveToLocate(toX: number, toY: number, delay: number, fade?: number): void {
    let tweenConfig;
    if (fade !== undefined) {
      tweenConfig = {
        targets: this,
        x: toX,
        y: toY,
        alpha: fade,
        duration: delay,
        ease: "Linear",
      };
    } else {
      tweenConfig = {
        targets: this,
        x: toX,
        y: toY,
        duration: delay,
        ease: "Linear",
      };
    }

    this.scene.tweens.add(tweenConfig);
  }
}
