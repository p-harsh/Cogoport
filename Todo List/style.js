let allTasks = [];
let lastUsedId = 0;
let localStorageKey = "toDoList";

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

function createMessage({ message, time = 5000, ...args }) {
    let messageContainer = document.querySelector(".messages-container");
    let messageNode = document.querySelector(".messages");
    messageNode.innerHTML = message;
    args.opacity = 1;
    Object.assign(messageContainer.style, args);
    setTimeout(() => {
        messageContainer.style.opacity = 0;
    }, time);
}

function updateLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(allTasks));
}

function renderTask(task, ind) {
    return `<tr class="task id-${task.id}">
                <form id="form-${task.id}">
                    <td 
                    class="task-checkbox">
                    <input ${task.checked ? "checked" : null}
                        onclick="handleCheckbox(event, ${
                            task.id
                        })" name="task-completed"
                        type='checkbox'/>
                    </td>
                    <td>${ind + 1}</td>
                    <td class="task-title">
                    ${
                        task.saving
                            ? `<input
                                form="form-${task.id}"
                                type="text"
                                value="${task.title}"
                                name="editing-task"
                            />`
                            : task.checked
                            ? `<s>${task.title}</s>`
                            : `${task.title}`
                    }
                    </td>
                    <td class="task-action-container">
                        ${
                            task.saving
                                ? `<button form="form-${task.id}" 
                                class="save-btn" 
                                onclick="saveTask(event, ${task.id})" 
                                id=${task.id}>
                            <span><img src="icons/save.svg"/></span>
                        </button>`
                                : `<button class="edit-btn" onclick="editTask(${task.id})" id=${task.id}>
                            <span><img src="icons/edit.svg"/></span>
                        </button>`
                        }
                    </td>
                    <td class="task-action-container">
                        <button form="form-${task.id}" 
                        class="delete-btn" 
                        onclick="deleteTask(event, ${task.id})" 
                        id=${task.id}>
                            <span><img src="icons/delete.svg"/></span>
                        </button>
                    </td>
                </form>
            </tr>`;
}

function renderAllTasks() {
    updateLocalStorage();
    let taskWrapper = document.getElementById("task-wrapper");
    let taskWrapperHtml = "";
    allTasks.forEach((task, ind) => {
        taskWrapperHtml = taskWrapperHtml + renderTask(task, ind);
    });
    taskWrapper.innerHTML = taskWrapperHtml;
}

function editTask(id) {
    allTasks = allTasks.filter((task) => {
        if (task.id === id) task.saving = !task.saving;
        return task;
    });
    renderAllTasks();
}

function saveTask(event, id) {
    event.preventDefault();
    let updatedTaskVal =
        event.currentTarget.form.elements["editing-task"].value;
    if (updatedTaskVal === "") {
        createMessage({
            background: "rgba(200, 0, 0, 0.9)",
            color: "white",
            message: "Empty Values can't be saved",
        });
        return;
    }
    allTasks = allTasks.filter((task) => {
        if (task.id === id) {
            task.title = updatedTaskVal;
            task.saving = false;
        }
        return task;
    });
    renderAllTasks();
}

function handleCheckbox(event, id) {
    allTasks = allTasks.filter((task) => {
        if (task.id === id) {
            task.checked = !task.checked;
        }
        return task;
    });
    renderAllTasks();
}

function scrollToElement(element) {
    const eleTop = element.offsetTop;
    window.scrollTo({ top: eleTop, behavior: "smooth" });
}

function moveToTaskId(id) {
    let taskIdElement = document.querySelector(`.id-${id}`);
    console.log(taskIdElement);
    scrollToElement(taskIdElement);
}

function resetInput() {
    let taskInput = document.getElementById("task-input");
    taskInput.value = "";
}

function addTask() {
    let taskInput = document.getElementById("task-input");
    let taskValue = taskInput.value;
    if (taskValue == "") {
        createMessage({
            message: "Can't add empty titled task",
            color: "white",
            background: "rgb(200, 0, 0)",
        });
        return;
    }
    allTasks.push({
        id: ++lastUsedId,
        title: taskValue,
        checked: false,
        saving: false,
    });
    renderAllTasks();
    resetInput();
    console.log(lastUsedId);
    moveToTaskId(lastUsedId);
    // createMessage({"message": "Successfully Added Task", color: "white", background: "rgb(0,200,0)", time: 1000})
}

function deleteTask(event, id) {
    event.preventDefault();
    allTasks = allTasks.filter((task) => task.id !== id);
    renderAllTasks();
}

function preProcessData() {
    allTasks.forEach((task, ind) => {
        task.id = ind + 1;
    });
}

window.addEventListener("DOMContentLoaded", () => {
    changeLoading(true);
    if (JSON.parse(localStorage.getItem(localStorageKey))?.length > 0) {
        allTasks = JSON.parse(localStorage.getItem(localStorageKey));
        preProcessData();
        lastUsedId = allTasks.length;
        renderAllTasks();
        changeLoading(false);
    } else {
        // check in localStorage if toDoList key exists
        // if not then fetch otherwise
        fetch("https://jsonplaceholder.typicode.com/todos")
            .then((res) => {
                if (res?.ok) return res.json();
                else {
                    throw new Error(
                        "message",
                        `HTTP Response code - ${res?.status}`
                    );
                }
            })
            .then((data) => {
                allTasks = [
                    ...allTasks,
                    ...data.map((e) => {
                        return {
                            id: e.id,
                            title: e.title,
                            checked: false,
                            saving: false,
                        };
                    }),
                ];
                preProcessData();
                lastUsedId = allTasks.length;
                renderAllTasks();
                changeLoading(false);
            })
            .catch((err) => {
                console.log(err);
                changeLoading(false);
            });
    }
});

// check for null input on saving
//
