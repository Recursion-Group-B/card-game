import Tutorial from "../../common/tutorial";

export default class PokerTutorial extends Tutorial {
  private intro: Phaser.GameObjects.Video | undefined;

  preload(): void {
    this.load.image("uTurn", "/public/assets/images/uTurn.svg");
    this.load.video("tutorialVideo", "/public/assets/movies/pokerTutorial.mp4", true);
  }

  create() {
    this.createGameZone();
    this.createBackButton();
    this.drawVideo("tutorialVideo");

    this.children.bringToTop(this.backButton as Phaser.GameObjects.Image);
    console.log(this.intro);
  }
}
