import Card from "../../common/card";

export type PlayerType = {
  name: string;
  playerType: string;
  chips: number;
  hand: Array<Card>;
};

export type SuitDict = Map<string, number>;

export type RankDict = Map<number, number>;

export type HandScore = {
  role: number;
  highCard: number;
};
