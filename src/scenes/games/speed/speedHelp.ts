import HelpContainer from "../../common/helpContainer";
import { helpStyle } from "../../../constants/styles";

const content = `
毎ゲーム開始前に参加各プレイヤーはアンティ（参加費）を支払って、ゲーム参加となります。
プレイヤーは必要に応じ一回だけカードを交換し、5枚のカードでポーカーの役を作ります。

① 5枚の手札から勝負の判断を行います。
 ディーラーから各プレイヤーに対して裏向きに伏せられて5枚のカードが配られます。
 各プレイヤーは配られたカードを確認して、ディーラの左隣のプレイヤーから順に自分の手札に応じたアクション「ベット」「チェック」「コール」「レイズ」「フォールド」を行ってゆきます。
 全員がそれぞれのアクションを終えたら1巡目は終了となります。

 1巡のアクションで「フォールド」を選択したプレイヤーへは今回のゲームではリタイヤとされ、ベットした金額が戻されます。
`;

export default class SpeedHelp extends HelpContainer {
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
