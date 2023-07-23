let APIKEY = "26c69b1";
let APIKEY2 = "c1dc1c18";
let BATCH_TOTAL = 10;
var LS_KEY = "movieData";
let currPageNumber = 1;
let apiBaseLink = `https://www.omdbapi.com/?APIKEY=${APIKEY}`;
let userSavedData = [];
let movieList = [];

//
// Utility functions
//

function showError(error) {
    alert(error);
}

function checkAlphanumSpecialString(value) {
    return /^[ A-Za-z0-9_@./#&+-]*$/.test(value);
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}
//
// Loading Screen
//
function changeLoading(willLoad) {
    if (willLoad === true)
        document
            .querySelector(".loading-container")
            .classList.replace("loading-inactive", "loading-active");
    else if (willLoad === false)
        document
            .querySelector(".loading-container")
            .classList.replace("loading-active", "loading-inactive");
}
// to not allow too many firing of api
function debounce(inner, ms = 500) {
    let timer = null;
    let resolves = [];

    return function (...args) {
        // Run the function after a certain amount of time
        clearTimeout(timer);
        timer = setTimeout(() => {
            // Get the result of the inner function, then apply it to the resolve function of
            // each promise that has been created since the last time the inner function was run
            let result = inner(...args);
            resolves.forEach((r) => r(result));
            resolves = [];
        }, ms);

        return new Promise((r) => resolves.push(r));
    };
}

//
// load data from localStorage
//

window.addEventListener("DOMContentLoaded", () => {
    loadLocalStorageData();
    renderMovieList();
});

function loadLocalStorageData() {
    if (JSON.parse(localStorage.getItem(LS_KEY))?.length > 0) {
        userSavedData = JSON.parse(localStorage.getItem(LS_KEY));
    }
}

function updateLocalStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(userSavedData));
}

//
// Rendering and Event Handler Functions
//

function removePagination(){
    document.getElementById("pagination-container").style.visibility = "hidden";
}

function addPagination(){
    document.getElementById("pagination-container").style.visibility = "visible";
}

function renderMovieRow(movie) {
    return `<div class='movie-row'>
        <div class='movie-poster'>
            <img src="${
                movie?.Poster === "N/A"
                    ? "icons/image_not_found.png"
                    : movie.Poster
            }" width="60"/>
        </div>
        <div class='movie-detail'>
            <div class='movie-detail-upper-container'>
                <div class='movie-title'><h3>${movie.Title}</h3></div>
                </div>
                <div class='movie-year'>${movie.Year}</div>
            ${
                movie?.Director
                    ? `<div class='movie-detail-middle-container'>
                        <div class='movie-director'>Directed By <span>${movie?.Director}</span></div>
                    </div>`
                    : ""
            }
            <div class='movie-detail-footer-container'>
            ${
                movie?.Runtime
                    ? `<div class='movie-runtime'>${movie?.Runtime}</div>`
                    : ""
            }
                <button class="movie-detail-btn" onclick="handleMovieDetailDialog('${encodeURIComponent(
                    JSON.stringify(movie)
                )}')">Details</button>
            </div>
        </div>
    </div>`;
}

function renderMovieList() {
    let movieGrid = document.getElementById("movie-grid");
    let gridHtml = "";
    if(movieList.length === 0){
        removePagination();
    }
    else addPagination();
    movieList.forEach((movie) => {
        gridHtml += `
            ${renderMovieRow(movie)}
        `;
    });
    movieGrid.innerHTML = gridHtml;
    renderPageNumber();
}

function renderRatingStars(rating) {
    rating = parseInt(rating, 10);
    let ratingHtml = "";
    for (let i = 1; i <= rating; i++) {
        ratingHtml += `<span><img src="icons/star_filled.svg" width='16'/></span>`;
    }
    for (let i = rating + 1; i <= 5; i++) {
        ratingHtml += `<span><img src="icons/star_empty.svg" width='16'/></span>`;
    }
    return ratingHtml;
}

function renderMovieDetail(movie) {
    let savedData = userSavedData.find((data) => movie.imdbID === data.imdbID);

    return `
        <div class='movie-detail-container'>
            <div class='movie-poster'>
                <img src="${
                    movie?.Poster === "N/A"
                        ? "icons/image_not_found.png"
                        : movie?.Poster
                }" width="150"/>
            </div>
            <div class='movie-container-wrapper'>
                <div class='upper-container'>
                    <div>
                        <h2>${movie?.Title}</h2>
                        <div class='movie-year'>${movie?.Year}</div>
                        <div class='movie-director'>Directed By <span>${
                            movie?.Director
                        }</span></div>
                    </div>
                </div>
                <div class="middle-container">
                    <div class='movie-plot'>${movie?.Plot}</div>
                </div>
                <div class="footer-container">
                    <div class='movie-runtime'>${movie?.Runtime}</div>
                    <div class="movie-genre">${movie?.Genre.split(", ")
                        .map((genre) => `<span>${genre}</span>`)
                        .join("")}</div>
                </div>
                </div>
                </div>
                <div class='saved-data-container'>
                <h5>Your Rating and Comment</h5>
                    ${
                        savedData?.rating
                            ? `<div class='saved-rating'>${renderRatingStars(
                                  savedData.rating
                              )}</div>`
                            : ""
                    }
                    ${
                        savedData?.comment
                            ? `<div class='saved-comment'><span><img src='icons/comment.svg' width='16'/></span>${savedData?.comment}</div>`
                            : ""
                    }
                </div>
                <div class='rating-container'>
                    <form id="rating-form" class='rating-form'>
                        <input type='text' placeholder="New Comment..." class='comment-input' name='comment' value="${
                            savedData?.comment ? savedData?.comment : ""
                        }"/>
                        <div>
                        <label for='rating'>Rating</label>
                        <input type="range" id="rating" name="rating" min="0" value="${
                            savedData?.rating ? savedData?.rating : "0"
                        }" max="5" step="1" class='rating-input'>
                        </div>
                        <button type='button' onclick='handleSaveRating(event, "${encodeURIComponent(
                            JSON.stringify(movie)
                        )}")'>Save</button>
                    </form>
                    <div>
                    </div>
                </div>
    `;
}

function renderMovieDialog(movie) {
    let movieDialog = document.getElementById("movie-dialog");
    movieDialog.showModal();
    let movieDetailContainer = document.getElementById("movie-detail-dialog");
    movieDetailContainer.innerHTML = renderMovieDetail(movie);
}

function handleMovieDetailDialog(movie) {
    changeLoading(true);
    movie = JSON.parse(decodeURIComponent(movie));
    console.log(movie);
    let link = encodeURI(`${apiBaseLink}&i=${movie?.imdbID}`);
    fetch(link)
        .then((res) => res.json())
        .then((data) => {
            renderMovieDialog(data);
            changeLoading(false);
        })
        .catch((err) => {
            console.log(err);
            changeLoading(false);
        });
}

function closeDialog() {
    let movieDialog = document.getElementById("movie-dialog");
    movieDialog.close();
}

//
//
//
// need to change the below magic number, does not have enough time now
function renderPageNumber(totalResults = Infinity) {
    let pageNumberEle = document.getElementById("pagination-number");

    pageNumberEle.value = currPageNumber;
    if (currPageNumber === 1)
        document
            .getElementById("left-arrow-pagination")
            .setAttribute("disabled", "");
    else
        document
            .getElementById("left-arrow-pagination")
            .removeAttribute("disabled");
    // check if nextpage will be out of bound
    if (
        Math.ceil(totalResults / BATCH_TOTAL) * BATCH_TOTAL <
        BATCH_TOTAL * (currPageNumber + 1)
    ) {
        document
            .getElementById("right-arrow-pagination")
            .setAttribute("disabled", "");
    } else {
        document
            .getElementById("right-arrow-pagination")
            .removeAttribute("disabled");
    }
}

//
// Search
//
async function updateListsBySearch(link) {
    changeLoading(true);
    fetch(link)
        .then((res) => res.json())
        .then((data) => {
            if (data?.Response === "False") {
                showError(data["Error"]);
                movieList = [];
                currPageNumber = 1;
                renderMovieList();
                changeLoading(false);
                return;
            }
            console.log(data);
            // update movie List
            movieList = data?.Search;
            // render movie List
            renderMovieList();
            // update enabled or disabled for left and right
            renderPageNumber(parseInt(data["totalResults"]), 10);
            changeLoading(false);
        })
        .catch((err) => {
            changeLoading(false);
        });
}

async function handleMovieSearch() {
    let searchVal = document.getElementById("search-input").value;
    if (searchVal == "") {
        movieList = [];
        renderMovieList();
        return;
    }
    if (!checkAlphanumSpecialString(searchVal)) {
        showError("Write name in correct syntax");
        return;
    }
    currPageNumber = 1;
    let link = encodeURI(
        `${apiBaseLink}&s=${searchVal}&page=${currPageNumber}`
    );
    // debounceFunction(updateListsBySearch(link), 2000);
    await updateListsBySearch(link);
}

async function handleNextPage() {
    let searchVal = document.getElementById("search-input").value;
    if (searchVal == "") return;
    let link = encodeURI(
        `${apiBaseLink}&s=${searchVal}&page=${++currPageNumber}`
    );
    await updateListsBySearch(link);
}

async function handlePreviousPage() {
    console.log("Previous");
    let searchVal = document.getElementById("search-input").value;
    if (searchVal == "") return;
    let link = encodeURI(
        `${apiBaseLink}&s=${searchVal}&page=${--currPageNumber}`
    );
    await updateListsBySearch(link);
}

async function handlePageMovieList(event) {
    let searchVal = document.getElementById("search-input").value;
    if (searchVal == "") return;
    let pageinationNum = document.getElementById("pagination-number");
    let updatedNumber = pageinationNum.value;
    if (!isNumeric(updatedNumber)) {
        // if not a number
        alert("Enter Correct Format");
        return;
    }
    updatedNumber = parseInt(updatedNumber, 10);
    if (updatedNumber === currPageNumber)
        // if same value do not call api
        return;

    currPageNumber = updatedNumber;
    let link = encodeURI(
        `${apiBaseLink}&s=${searchVal}&page=${currPageNumber}`
    );
    // check if possible

    await updateListsBySearch(link);
}

function handleSaveRating(event, movie) {
    movie = JSON.parse(decodeURIComponent(movie));
    let imdbID = movie?.imdbID;
    let form = event.currentTarget.form;
    let rating = form["rating"].value;
    let comment = form["comment"].value;
    let flag = 0;
    userSavedData = userSavedData.map((data) => {
        if (data.imdbID === imdbID) {
            data.comment = comment;
            data.rating = rating;
            flag = 1;
        }
        return data;
    });
    if (flag === 0) {
        // not found in the data
        userSavedData.push({ imdbID, rating, comment });
    }
    updateLocalStorage();
    renderMovieDialog(movie);
}

const handleDebouncePageChange = debounce(handlePageMovieList, 1000);

const handleDebounceSearch = debounce(handleMovieSearch);
