import Phaser from "phaser";
import Button from "../../models/common/button";
import Size from "../../constants/size";

export default abstract class Tutorial extends Phaser.Scene {
  protected backButton: Button | undefined;

  protected gameZone: Phaser.GameObjects.Zone | undefined;

  constructor() {
    super({ key: "tutorial" });
  }

  protected createBackButton(): void {
    this.backButton = new Button(this, 10, 10, "uTurn", "");
    this.backButton.setOrigin(0);
    this.backButton.setClickHandler(() => {
      this.scene.switch("game");
    });
    this.children.bringToTop(this.backButton as Phaser.GameObjects.Image);
  }

  protected createGameZone(): void {
    this.gameZone = this.add.zone(Size.D_WIDTH / 2, Size.D_HEIGHT / 2, Size.D_WIDTH, Size.D_HEIGHT);
  }

  protected drawVideo(textureKey: string, scale: number): void {
    const intro = this.add.video(0, 0, textureKey).play(true);
    intro.setScale(scale);
    Phaser.Display.Align.In.Center(intro, this.gameZone as Phaser.GameObjects.Zone, 0, -20);
  }
}
