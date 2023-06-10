import headers from "./components/header";
import selectDiff from "./components/selectDiff";
import selectGame from "./components/selectGame";

const Home = `
    <div id="header" class="d-flex justify-content-between ps-2 pe-3">
        ${headers}
    </div>
    <div class="container-fluid d-flex flex-column justify-content-center">
        <img src="public/homeImg.jpeg" class="img-fit">
        ${selectDiff}
        ${selectGame}
    </div>
`;

export default Home;
