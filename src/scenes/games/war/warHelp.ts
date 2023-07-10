import HelpContainer from "../../common/helpContainer";
import { helpStyle } from "../../../constants/styles";

const content = `
war rule
`;

export default class WarHelp extends HelpContainer {
  private text: Phaser.GameObjects.Text | undefined;

  private textLocation: Phaser.Types.Math.Vector2Like | undefined;

  createContent(): void {
    this.text = new Phaser.GameObjects.Text(this.table, 0, 0, content, helpStyle);

    Phaser.Display.Align.In.Center(this.text, this.table.getGameZone, 0, 0);
    this.textLocation = this.text.getTopRight();
    this.add(this.text);

    this.createBackButton(this.textLocation as Phaser.Types.Math.Vector2Like);
  }
}
