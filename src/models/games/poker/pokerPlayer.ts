import Player from "../../common/player";
import Card from "../../common/card";
import { SuitDict, RankDict, HandScore } from "./type";

export default class PokerPlayer extends Player {
  private suitDict: SuitDict;

  private rankDict: RankDict;

  private handScore: HandScore;

  private handList: number[][] | undefined;

  private state: string;

  private isDealer: boolean;

  constructor(name: string, playerType: string, chips: number, bet: number) {
    super(name, playerType, chips, bet);
    this.handScore = {
      name: "",
      role: 0,
      highCard: [],
    };
    this.suitDict = new Map();
    this.rankDict = new Map();
    this.handList = undefined;
    this.state = "notAction";
    this.isDealer = false;
  }

  get getSuitDict() {
    return this.suitDict;
  }

  get getHandList() {
    return this.handList;
  }

  get getRankDict() {
    return this.rankDict;
  }

  set setHandScore(handScore: HandScore) {
    this.handScore = handScore;
  }

  get getHandScore(): HandScore {
    return this.handScore;
  }

  set setState(state: string) {
    this.state = state;
  }

  get getState(): string {
    return this.state;
  }

  set setIsDealer(bool: boolean) {
    this.isDealer = bool;
  }

  get getIsDealer(): boolean {
    return this.isDealer;
  }

  /**
   * プレイヤーアクション（ベット/コール/レイズ）: this.chipsからamountを引く
   * @param amount : number
   * @returns : number
   */
  call(amount: number): number {
    const currentChips: number = this.getChips - amount;
    this.setChips = currentChips;
    return amount;
  }

  /**
   * プレイヤーアクション（フォールド）: this.handを空にする
   */
  fold(): void {
    this.setHand = undefined;
  }

  /**
   * プレイヤーアクション（チェンジ）: this.handのdeleteCardsを削除し, addCardsを追加する。
   * @param deleteCards: Card[]
   * @param addCards: Card[]
   */
  change(deleteCards: Card[], addCards: Card[]) {
    this.deleteCardsToHand(deleteCards);
    this.addCardToHand(addCards);
  }

  /**
   * 計算データ初期化
   */
  init(): void {
    this.rankDict.clear();
    this.suitDict.clear();
    this.handScore.role = 0;
    this.handScore.highCard = [];
    this.handList = undefined;
    this.isDealer = false;
    this.state = "notAction";
  }

  /**
   * 判定のため、Mapオブジェクト作成
   *  */
  private makeDict(): void {
    (this.getHand as Card[]).forEach((card) => {
      // suit
      if (this.suitDict.has(card.getSuit)) {
        this.suitDict.set(card.getSuit, (this.suitDict.get(card.getSuit) as number) + 1);
      } else this.suitDict.set(card.getSuit, 1);

      // rank
      const rank = card.getRankNumber("poker");
      if (this.rankDict.has(rank)) {
        this.rankDict.set(rank, (this.rankDict.get(rank) as number) + 1);
      } else this.rankDict.set(rank, 1);
    });
  }

  /**
   * pair > rankの優先順位でソート
   * @returns number[][] ([[rank, pair],,,])
   */
  private handSort(): number[][] {
    const sortDict = [...this.rankDict].sort((a, b) => {
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
      if (a[1] === b[1]) {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
      }
      return 0;
    });
    return sortDict;
  }

  /**
   * 連続判定
   * @returns: boolean
   */
  private hasChainRank(): boolean {
    const rankList = Array.from(this.handList as number[][], (ele) => ele[0]);
    const compareList = Array(5)
      .fill(Math.min(...rankList))
      .map((value, index) => value + index);
    return rankList.every((ele) => compareList.includes(ele));
  }

  /**
   * ペア判定
   * @param pairNum: ペアとなるランク
   * @param type: 役の文字列型
   * @returns boolean
   */
  private hasPair(pairNum: number, type?: string): boolean {
    if (type === "twoPair") {
      const pair = (this.handList as number[][]).filter((ele) => ele[1] === pairNum);
      return pair.length === 2;
    }

    // 一つのペアがある場合
    return (this.handList as number[][]).some((ele) => ele[1] === pairNum);
  }

  /**
   * 自分のハンドのスコアを取得する
   * @returns: HandScore
   */
  calculateHandScore(): HandScore {
    if (this.getHand === undefined) return this.handScore;
    this.makeDict();
    this.handList = this.handSort();

    // ロイヤルストレートフラッシュ
    if (
      this.suitDict.size === 1 &&
      this.rankDict.size === 5 &&
      this.rankDict.has(10) &&
      this.rankDict.has(14) &&
      this.hasChainRank()
    ) {
      this.handScore.name = "ロイヤルストレートフラッシュ";
      this.handScore.role = 10;
    } // ストレートフラッシュ
    else if (this.suitDict.size === 1 && this.rankDict.size === 5 && this.hasChainRank()) {
      this.handScore.name = "ストレートフラッシュ";
      this.handScore.role = 9;
    } // フォーカード
    else if (this.rankDict.size === 2 && this.hasPair(4)) {
      this.handScore.name = "フォーカード";
      this.handScore.role = 8;
    } // フルハウス
    else if (this.rankDict.size === 2 && this.hasPair(2) && this.hasPair(3)) {
      this.handScore.name = "フルハウス";
      this.handScore.role = 7;
    } // フラッシュ
    else if (this.suitDict.size === 1) {
      this.handScore.name = "フラッシュ";
      this.handScore.role = 6;
    } // ストレート
    else if (this.rankDict.size === 5 && this.hasChainRank()) {
      this.handScore.name = "ストレート";
      this.handScore.role = 5;
    } // スリーカード
    else if (this.hasPair(3)) {
      this.handScore.name = "スリーカード";
      this.handScore.role = 4;
    } // ツーペア
    else if (this.hasPair(2, "twoPair")) {
      this.handScore.name = "ツーペア";
      this.handScore.role = 3;
    } // ワンペア
    else if (this.hasPair(2)) {
      this.handScore.name = "ワンペア";
      this.handScore.role = 2;
    } // ハイカード
    else {
      this.handScore.name = "ハイカード";
      this.handScore.role = 1;
    }
    this.handScore.highCard = this.handList;

    return this.handScore;
  }
}
