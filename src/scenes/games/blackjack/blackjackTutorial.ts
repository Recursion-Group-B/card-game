import Tutorial from "../../common/tutorial";

export default class BlackJackTutorial extends Tutorial {
  create() {
    this.gameSceneKey = this.registry.get("gameSceneKey");
    this.createGameZone();
    this.drawVideo("tutorialVideo", 0.5);
    this.createBackButton();
  }
}
