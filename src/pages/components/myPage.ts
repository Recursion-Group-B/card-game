const myPage = `
    <div class="container py-5">
        <div id="user" class="d-flex justify-content-between border-bottom border-2 border-dark-subtle shadow fs-2 px-3 mb-5">
            <div id="userName">User</div>
            <div id="userCash">$1,000</div>
        </div>

        <div id="record" class="border-bottom border-2 border-dark-subtle shadow fs-4 p-3">
            <div id="tabs">
                <li id="pokerBtn" class="btn btn-link text-reset">Poker</li>
                <li id="blackjackBtn" class="btn btn-link text-reset">BlackJack</li>
                <li id="warBtn" class="btn btn-link text-reset">War</li>
                <li id="speedBtn" class="btn btn-link text-reset">Speed</li>
            </div>

            <div id="pokerRecord" class="d-block">Poker Record</div>
            <div id="blackjackRecord" class="d-none">BlackJack Record</div>
            <div id="warRecord" class="d-none">War Record</div>
            <div id="speedRecord" class="d-none">Speed Record</div>
        </div>
    </div>
`;

export default myPage;
