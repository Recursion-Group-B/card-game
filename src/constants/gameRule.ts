enum GameRule {
  POKER = `
  毎ゲーム開始前に参加各プレイヤーはアンティ（参加費）を支払って、ゲーム参加となります。
  プレイヤーは必要に応じ一回だけカードを交換し、5枚のカードでポーカーの役を作ります。
  
  ① 5枚の手札から勝負の判断を行います。
   ディーラーから各プレイヤーに対して裏向きに伏せられて5枚のカードが配られます。
   各プレイヤーは配られたカードを確認して、ディーラの左隣のプレイヤーから順に自分の手札に応じたアクション「ベット」「チェック」「コール」「レイズ」「フォールド」を行ってゆきます。
   全員がそれぞれのアクションを終えたら1巡目は終了となります。
  
   1巡のアクションで「フォールド」を選択したプレイヤーへは今回のゲームではリタイヤとされ、ベットした金額が戻されます。
  `,

  TEXAS = `
  texas rule
  `,

  BLACKJACK = `
  カジノディーラーとプレイヤーの対戦型ゲームです。
プレイヤーはカジノディーラーよりも「カードの合計が21点」に近ければ勝利となり、配当を得ることができます。ただしプレイヤーの「カードの合計が21点」を超えてしまうと、その時点で負けとなります。

【カードの数え方】
”2～9”まではそのままの数字、”10・J・Q・K”は「すべて10点」と数えます。
また、”A”（エース）は「1点」もしくは「11点」のどちらに数えても構いません。

【用語説明】
Stand : 配られたカード（ハンド）にそれ以上のカードの追加は行わないと宣言すること。プレイヤーは手元のカードの数字でディーラーとの勝負に挑みます。

Hit : 配られたカード（ハンド）にもう1枚カード追加すること。カードの数値の合計が21以内であれば何度でもヒットを行い、カードを追加することができます。

Double : 賭金をゲーム開始時の倍にして3枚目のカードを引くこと。ただし、Doubleの宣言を行うとそれ以上のカードを引くことはできなくなります。

Surrender : 降参すること。始めの2枚のカードが配られた時点で、賭け金の半額を放棄し、残りの半額だけを返してもらい勝負を降りることができます。
  `,

  WAR = `
  カジノウォーは、プレイヤーとディーラーが対戦し、より大きな数字を引いた方が勝ちです。
  賭け金をベットし、その後プレイヤー自身とディーラーに1枚ずつカードが配られます。

  カードが高い方が勝者となり、賭け金を二倍にして獲得します。
  しかし、もしプレイヤーとディーラーが同じランクのカードを引いた場合、
  プレイヤーは「サレンダー」を選び半分の賭け金を手放すか、
  あるいは「ウォー」を選び同額を再度賭けて再戦を挑むことができます。

  このゲームはシンプルかつスピーディーにゲームが進むため、初心者にオススメです。

  カードの強さ
  2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A
  `,

  SPEED = `
  スピードは台札と数字がつながるカードをすばやく出していきます。
  相手より先に、手持ちのカードがなくなった方の勝ちです。

  プレイ人数は2人で、各プレイヤーは手元に4枚のカード(手札)と場札を持ち、台にはそれぞれ1枚ずつカードが出されます。
  このカードは数字が1つ上または1つ下のカードを出すことができます。

  例えば、場のカードが5なら、プレイヤーは4または6を出すことができます。

  スピードは、自分のカードを早く出し切ることが目標のゲームです。
  そのため、素早い動きと次にどのカードを出すかを瞬時に考えることが重要です。
  スピーディーなゲーム体験をお楽しみください。
  `,
}

export default GameRule;
