import Phaser from "phaser";
import type TableScene from "./TableScene";
import Button from "../../models/common/button";
import { helpStyle } from "../../constants/styles";

export default class HelpContainer extends Phaser.GameObjects.Container {
  private backButton: Button | undefined;

  private table: TableScene;

  private text: Phaser.GameObjects.Text | undefined;

  private textLocation: Phaser.Types.Math.Vector2Like | undefined;

  private content: string;

  constructor(table: TableScene, content: string) {
    super(table);
    this.table = table;
    this.content = content;
    this.setName("help");
  }

  /**
   * コンテンツの相対位置に対してバックボタンを配置。
   * バックボタンを押すことで、ヘルプオブジェクトを削除する。
   * @param contentsLocation
   */
  private createBackButton(contentsLocation: Phaser.Types.Math.Vector2Like): void {
    this.backButton = new Button(
      this.table,
      (contentsLocation.x as number) - 10,
      (contentsLocation.y as number) + 10,
      "back",
      ""
    );
    this.backButton.setOrigin(1, 0);
    this.backButton.setClickHandler(() => {
      this.table.time.paused = false;
      this.removeAll(true);
    });
    this.add(this.backButton);
  }

  /**
   * 各ゲームでヘルプオブジェクトを作成
   * createBackButton()を含ませる必要がある。
   */
  createContent(): void {
    this.text = new Phaser.GameObjects.Text(this.table, 0, 0, this.content, helpStyle);

    Phaser.Display.Align.In.Center(this.text, this.table.getGameZone, 0, 0);
    this.textLocation = this.text.getTopRight();
    this.add(this.text);

    this.table.children.bringToTop(this);
    this.createBackButton(this.textLocation as Phaser.Types.Math.Vector2Like);
  }
}
