import Tutorial from "../../common/tutorial";

export default class SpeedTutorial extends Tutorial {
  preload(): void {
    this.load.image("uTurn", "/public/assets/images/uTurn.svg");
    this.load.video("tutorialVideo", "/public/assets/movies/speedTutorial.mp4", true);
  }

  create() {
    this.createGameZone();
    this.drawVideo("tutorialVideo", 0.5);
    this.createBackButton();
  }
}
