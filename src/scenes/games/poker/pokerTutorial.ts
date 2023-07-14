import Tutorial from "../../common/tutorial";

export default class PokerTutorial extends Tutorial {
  preload(): void {
    this.load.image("uTurn", "/assets/images/uTurn.svg");
    this.load.video("tutorialVideo", "/assets/movies/pokerTutorial.mp4", true);
  }

  create() {
    this.gameSceneKey = this.registry.get("gameSceneKey");
    this.createGameZone();
    this.drawVideo("tutorialVideo", 0.5);
    this.createBackButton();
  }
}
