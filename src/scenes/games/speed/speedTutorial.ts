import Tutorial from "../../common/tutorial";

export default class SpeedTutorial extends Tutorial {
  preload(): void {
    this.load.image("uTurn", "/assets/images/uTurn.svg");
    this.load.video("tutorialVideo", "/assets/movies/speedTutorial.mp4", true);
  }

  create() {
    this.gameSceneKey = this.registry.get("gameSceneKey");
    this.createGameZone();
    this.drawVideo("tutorialVideo", 0.5);
    this.createBackButton();
  }
}
