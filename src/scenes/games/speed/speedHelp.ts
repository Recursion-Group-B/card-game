import HelpContainer from "../../common/helpContainer";
import { helpStyle } from "../../../constants/styles";

const content = `
スピードは台札と数字がつながるカードをすばやく出していきます。
相手より先に、手持ちのカードがなくなった方の勝ちです。

プレイ人数は2人で、各プレイヤーは手元に4枚のカード(手札)と場札を持ち、台にはそれぞれ1枚ずつカードが出されます。
このカードは数字が1つ上または1つ下のカードを出すことができます。

例えば、場のカードが5なら、プレイヤーは4または6を出すことができます。

スピードは、自分のカードを早く出し切ることが目標のゲームです。
そのため、素早い動きと次にどのカードを出すかを瞬時に考えることが重要です。
スピーディーなゲーム体験をお楽しみください。
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
