import Phaser from "phaser";

export default class Chip extends Phaser.GameObjects.Image {
  private value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, value: number) {
    super(scene, x, y, textureKey);
    this.value = value;
    scene.add.existing(this);
  }

  get getValue(): number {
    return this.value;
  }
}
