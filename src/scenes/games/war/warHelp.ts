import HelpContainer from "../../common/helpContainer";
import { helpStyle } from "../../../constants/styles";

const content = `
カジノウォーは、プレイヤーとディーラーが対戦し、より大きな数字を引いた方が勝ちです。
賭け金をベットし、その後プレイヤー自身とディーラーに1枚ずつカードが配られます。

カードが高い方が勝者となり、賭け金を二倍にして獲得します。
しかし、もしプレイヤーとディーラーが同じランクのカードを引いた場合、
プレイヤーは「サレンダー」を選び半分の賭け金を手放すか、
あるいは「ウォー」を選び同額を再度賭けて再戦を挑むことができます。

このゲームはシンプルかつスピーディーにゲームが進むため、初心者にオススメです。

カードの強さ
2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A
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
