import Phaser from "phaser";
import type TableScene from "./TableScene";
import Button from "../../models/common/button";

export default abstract class HelpContainer extends Phaser.GameObjects.Container {
  protected backButton: Button | undefined;

  protected table: TableScene;

  constructor(table: TableScene) {
    super(table);
    this.table = table;
  }

  /**
   * コンテンツの相対位置に対してバックボタンを配置。
   * バックボタンを押すことで、ヘルプオブジェクトを削除する。
   * @param contentsLocation
   */
  protected createBackButton(contentsLocation: Phaser.Types.Math.Vector2Like): void {
    this.backButton = new Button(
      this.table,
      (contentsLocation.x as number) - 10,
      (contentsLocation.y as number) + 10,
      "back",
      ""
    );
    this.backButton.setOrigin(1, 0);
    this.backButton.setClickHandler(() => {
      this.removeAll(true);
    });
    this.add(this.backButton);
  }

  /**
   * 各ゲームでヘルプオブジェクトを作成
   * createBackButton()を含ませる必要がある。
   */
  abstract createContent(): void;
}
