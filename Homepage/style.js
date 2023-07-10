let footer_list_container = document.querySelectorAll(".footer-list-container");
let sidebarVisible = false;
function handleScroll(e) {
    let header = document.querySelector(".header nav");
    let whatsapp = document.querySelector(".whatsapp");
    if (window.scrollY !== 0) {
        header.style.background = "white";
        header.style["box-shadow"] = "0 1px 6px rgba(169,188,218,.65)";
    } else {
        header.style.background = "rgb(251, 220, 0)";
        header.style["box-shadow"] = "none";
    }

    if (window.scrollY < 800) whatsapp.style.display = "none";
    else whatsapp.style.display = "flex";
}

window.addEventListener("scroll", handleScroll);

for (let i = 0; i < footer_list_container.length; i++) {
    let container = footer_list_container[i];
    container.addEventListener("click", (e) => {
        let list = e.target.nextElementSibling;
        if (list.style.display == "flex") list.style.display = "none";
        else list.style.display = "flex";
    });
}