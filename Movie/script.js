let currPageNumber = 1;
let apikey = "26c69b1";
let apikey2 = "c1dc1c18";
let apiBaseLink = `https://www.omdbapi.com/?apikey=${apikey}`;
let batchTotal = 10;
let userSavedData = [];

let movieList = [];

function showError(error) {
    alert(error);
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
                <div class='movie-year'>${movie.Year}</div>
            </div>
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
    movieList.forEach((movie) => {
        gridHtml += `
            ${renderMovieRow(movie)}
        `;
    });
    movieGrid.innerHTML = gridHtml;
    renderPageNumber();
}

function updateMovieList(link) {
    fetch(link)
        .then((res) => res.json())
        .then((data) => {
            movieList = data;
            renderMovieList();
        })
        .catch((err) => console.log(err));
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
                            ? `<div class='saved-comment'>${savedData?.comment}</div>`
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
            console.log(err)
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
        Math.ceil(totalResults / batchTotal) * batchTotal <
        batchTotal * (currPageNumber + 1)
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

var timerId;
let debounceFunction = function (func, delay = 2000) {
    // Cancels the setTimeout method execution
    clearTimeout(timerId);
    // Executes the func after delay time.
    timerId = setTimeout(func, delay);
};

async function handleMovieSearch(event) {
    let searchVal = event.currentTarget.value;
    if (searchVal == "") return;
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

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

async function handlePageMovieList(event) {
    let searchVal = document.getElementById("search-input").value;
    if (searchVal == "") return;
    let updatedNumber = event.currentTarget.value;
    if (!isNumeric(updatedNumber)) { // if not a number
        alert("Enter Correct Format");
        return;
    }
    updatedNumber = parseInt(updatedNumber, 10);
    if(updatedNumber === currPageNumber)// if same value do not call api
        return;
    
    currPageNumber = updatedNumber;
    let link = encodeURI(
        `${apiBaseLink}&s=${searchVal}&page=${currPageNumber}`
    );
    // check if possible
    await updateListsBySearch(link);
}

//
// Loading
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

//
// load data from localStorage
//

window.addEventListener("DOMContentLoaded", () => {
    loadLocalStorageData();
    renderMovieList();

    // renderMovieDialog({
    //     Title: "The Tit and the Moon",
    //     Year: "1994",
    //     Rated: "R",
    //     Released: "29 Mar 1995",
    //     Runtime: "90 min",
    //     Genre: "Comedy, Romance",
    //     Director: "Bigas Luna",
    //     Writer: "Cuca Canals, Bigas Luna, Josep Bargalló",
    //     Actors: "Biel Duran, Mathilda May, Gérard Darmon",
    //     Plot: "A child cannot stand the idea of having a new brother and dreams about drinking milk from the breasts of his mother again. The child asks the moon to bring him a teet only for him.",
    //     Language: "Catalan, Spanish, French",
    //     Country: "Spain, France",
    //     Awards: "2 wins & 3 nominations",
    //     Poster: "https://m.media-amazon.com/images/M/MV5BZjcwNTE2YzgtNjM0OC00MzA3LTg3ZjctYzkwYmJhNTBhY2FmXkEyXkFqcGdeQXVyMTA0MjU0Ng@@._V1_SX300.jpg",
    //     Ratings: [
    //         {
    //             Source: "Internet Movie Database",
    //             Value: "6.3/10",
    //         },
    //     ],
    //     Metascore: "N/A",
    //     imdbRating: "6.3",
    //     imdbVotes: "3,292",
    //     imdbID: "tt0111403",
    //     Type: "movie",
    //     DVD: "02 Jan 2019",
    //     BoxOffice: "N/A",
    //     Production: "N/A",
    //     Website: "N/A",
    //     Response: "True",
    // });
});

var LS_KEY = "movieData";

function loadLocalStorageData() {
    if (JSON.parse(localStorage.getItem(LS_KEY))?.length > 0) {
        userSavedData = JSON.parse(localStorage.getItem(LS_KEY));
    }
}
//
//
//

function updateLocalStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(userSavedData));
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
