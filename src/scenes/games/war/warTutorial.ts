import Tutorial from "../../common/tutorial";

export default class WarTutorial extends Tutorial {
  preload(): void {
    this.load.image("uTurn", "/public/assets/images/uTurn.svg");
    this.load.video("tutorialVideo", "/public/assets/movies/warTutorial.mp4", true);
  }

  create() {
    this.createGameZone();
    this.drawVideo("tutorialVideo");
    this.createBackButton();
  }
}