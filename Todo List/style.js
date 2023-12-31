let allTasks = [];
let allSubtasks = [];
let taskReminderId = [];
let lastUsedId = 0;
let lastUsedSubtaskId = 0;
let localStorageTaskKey = "toDoListTask";
let localStorageSubtaskKey = "toDoListSubtask";
let isOtherOptionVis = false;
let savingId = null;
let addingSubtaskId = null;
let isFilterVis = false;
let isSortVis = false;
// let filteredTasks = [];
// let sortedTasks = [];
let categoryList = ["None", "Health", "Work", "Meeting", "Ideas", "Cooking"];
let priorityList = ["None", "Low", "Medium", "High"];

let priorityOrder = {
    None: 0,
    Low: 1,
    Medium: 2,
    High: 3,
};

let logs = [];

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
    localStorage.setItem(localStorageTaskKey, JSON.stringify(allTasks));
    localStorage.setItem(localStorageSubtaskKey, JSON.stringify(allSubtasks));
}

function checkSelectedValue(value, taskStoredValue) {
    if (value === taskStoredValue) return "selected";
    else return "";
}

function checkSameDay(d1, d2) {
    d1 = new Date(removeTime(d1));
    d2 = new Date(removeTime(d2));
    return d1.getTime() === d2.getTime();
}

function removeTime(d) {
    return new Date(d.setHours(0, 0, 0, 0));
}

function handleDateName(d) {
    let date = new Date(d);
    // remove any type of time
    date = removeTime(date);
    let currentDate = new Date();
    currentDate = removeTime(currentDate);
    var nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // next week date from current date using millisecond calculations

    let yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);

    // check for previous days
    if (date.getTime() < currentDate.getTime()) {
        if (checkSameDay(date, yesterdayDate))
            return `<span style='color: red;'>Yesterday</span>`;
        return `<span style='color: red;'>${date
            .toDateString()
            .slice(0, -4)}</span>`;
    }
    // check for today
    else if (checkSameDay(date, currentDate)) {
        return "<span style='color: green'>Today</span>";
    }

    // check of tomorrow
    let tomorrowDate = new Date(currentDate);
    tomorrowDate.setDate(currentDate.getDate() + 1);

    if (checkSameDay(tomorrowDate, date)) {
        return "<span style='color: orange'>Tomorrow</span>";
    }
    // check if given date is in this or next week
    if (date.getTime() <= nextWeek.getTime()) {
        return `<span style="color: #13b7ec">${getDayName(date)}</span>`;
    }
    // if more than one week
    else {
        if (date.getFullYear() === currentDate.getFullYear()) {
            let tmp = date.toDateString().split(" ");
            tmp.pop();
            return `<span style="color: purple">${tmp.join(" ")}</span>`;
        }
        return `<span style="color: purple;">${date.toDateString()}</span>`;
    }
}

function getDayName(date = new Date(), locale = "en-US") {
    return date.toLocaleDateString(locale, { weekday: "long" });
}

function renderPriorityList(task) {
    return `<select name="priority" value="${task["priority"]}" id="priority">
    ${priorityList
        .map(
            (priority) =>
                `<option ${checkSelectedValue(
                    priority,
                    task["priority"]
                )} value="${priority}">${priority}</option>`
        )
        .join("")}
        </select>`;
}

function renderCategoryList(task) {
    return `<select name="category" id="category"
                        }">
                        ${categoryList
                            .map(
                                (category) =>
                                    `<option ${checkSelectedValue(
                                        category,
                                        task["category"]
                                    )} value="${category}">${category}</option>`
                            )
                            .join("")}
                        </select>`;
}

function renderTaskEditor(task, type = "task") {
    return `<div class="other-edit-actions">
                ${
                    type === "subtask"
                        ? `<h3 style="width: 100%; text-align: center;">Add Subtask</h3>
                        <div class="subtask-title-input">
                    <input type='text' name='subtask-title' placeholder='Enter Subtask Name...'/>
                    <button type='button' onclick='addSubtask(event, "${task.id}")'>Save</button>
                </div>`
                        : ""
                }
                    <div>
                        <label for="due-date">Due Date</label>
                        <input type="date" name="due-date" id="due-date" value="${
                            task["dueDate"]
                        }">
                        <input type="time" name="due-time" id="due-time" value="${
                            task["dueTime"]
                        }">
                    </div>
                    <div>
                        <label for="priority">Priority</label>
                        ${renderPriorityList(task)}
                    </div>
                    <div>
                        <label for="reminder">Reminder</label>
                        <input type="datetime-local" name="reminder" id="reminder" value="${
                            task["reminder"]
                        }">
                    </div>
                    <div>
                        <label for="category">Category</label>
                        ${renderCategoryList(task)}
                    </div>
                    <div class="tags-input-container">
                        <label for="tags-input" style="margin-right: 4px;">Tags</label>
                        <input type="text" id="tags-input" onkeyup="handleTagFormation(event)"
                            placeholder="Comma(,) separated tags" />
                        <div class="tags-details" name="tags-details">
                        ${task.tags.map((tag) => createTag(tag)).join("")}
                        </div>
                    </div>
                </div>`;
}

function renderTask(task, type = "task") {
    return `
    <div class="${type} task id-${task.id}">
                <form id="form-${type + "-" + task.id}" class="${
        task.id === savingId ? "task-form-saving" : ""
    }"
        style="border-color: ${checkMissedTask(task) ? "red" : ""}"
    >
                <div class='task-upper-container'>
                    <div
                    class="task-checkbox">
                    <input required ${task.checked ? "checked" : null}
                        onclick="handleCheckbox(event, '${
                            task.id
                        }', '${type}')" name="task-completed"
                        type='checkbox'/>
                    </div>
                    <div class="task-title">
                    ${
                        task.id === savingId
                            ? `<input
                                type="text"
                                value="${task.title}"
                                name="editing-task"
                            />`
                            : task.checked
                            ? `<s>${task.title}</s>`
                            : `${task.title}`
                    }
                    </div>
                    <div class="task-action-container">

                        <!-- Edit Task and Save Button -->
                        ${
                            task.id === savingId
                                ? `<button type='button' 
                                class="save-btn" 
                                onclick="saveTask(event, '${task.id}', '${type}')" 
                                title="Save Task">
                            <span><img src="icons/save.svg"/></span>
                        </button>`
                                : `<button type='button' class="edit-btn" onclick="editTask('${task.id}')" title="Edit Task">
                            <span><img src="icons/edit_ink.svg"/></span>
                        </button>`
                        }

                        <!-- Add Subtask Button -->
                        ${
                            type === "task"
                                ? `<button type='button' title="Add Subtask" class="add-subtask" onclick="handleAddingSubtask('${task.id}')">
                                <span><img src="icons/add_task.svg"/></span>
                                </button>`
                                : ""
                        }
                        
                        <!-- Delete Button -->
                        <button type='button' 
                        class="delete-btn" 
                        onclick="deleteTask(event, '${task.id}', '${type}' )">
                            <span><img src="icons/delete.svg"/></span>
                        </button>
                    </div>
                </div>



                <div class="task-middle-container">
                        <div style="display: flex;">

                        <!-- Priority Icon -->
                        ${
                            task?.priority === "Low"
                                ? `<img src="icons/priority_low.svg" width='16'/>`
                                : task?.priority === "High"
                                ? `<img src="icons/priority_high.svg" width='16'/>`
                                : task?.priority === "Medium"
                                ? `<img src="icons/priority_medium.svg" width='16'/>`
                                : ""
                        }
                        
                        <!-- Due Date -->
                        ${
                            task?.dueDate
                                ? `<div class='due-date-detail'>
                                ${handleDateName(task.dueDate)}
                            </div>`
                                : ""
                        }

                        <!-- Due Time -->
                        ${
                            task?.dueTime
                                ? `<div class='due-time-detail'>${task.dueTime}</div>`
                                : ""
                        }

                        <!-- Tags -->
                            ${
                                task?.tags.length > 0
                                    ? `<div class="tag-icon-name-container">
                            ${task.tags
                                .map((tag) => {
                                    return `<div><img src="icons/tag.svg" width="12"/>${tag}</div>`;
                                })
                                .join("")}
                            </div>`
                                    : ""
                            }
                        </div>

                        <!-- Categories -->
                        ${
                            task?.category && task?.category !== "None"
                                ? `<div class="category-container">
                            ${task.category}
                        </div>`
                                : ""
                        }
                </div>

                <!-- Bottom Task Editor -->
                ${
                    savingId === task.id && task.id !== addingSubtaskId
                        ? renderTaskEditor(task)
                        : `<div style="display:none"></div>`
                }

                <!-- Bottom Task Editor and Subtask Adder -->
                ${
                    savingId !== task.id && task.id === addingSubtaskId
                        ? renderTaskEditor(
                              {
                                  id: task.id,
                                  title: "",
                                  checked: false,
                                  dueDate: "",
                                  dueTime: "",
                                  priority: "None",
                                  reminder: "",
                                  category: "None",
                                  tags: [],
                              },
                              "subtask"
                          )
                        : `<div style="display:none"></div>`
                }
                </form>
            </div>`;
}

function updateTaskWrapperHtml(tasks, subtasks) {
    let taskWrapper = document.getElementById("task-wrapper");
    let taskWrapperHtml = "";
    tasks.forEach((task, ind) => {
        taskWrapperHtml = taskWrapperHtml + renderTask(task, "task");
        let associatedSubtasks = subtasks.filter(
            (subtask) => subtask.parentTaskId === task.id
        );
        associatedSubtasks.forEach((subtask) => {
            taskWrapperHtml = taskWrapperHtml + renderTask(subtask, "subtask");
        });
    });
    taskWrapper.innerHTML = taskWrapperHtml;
}

function getProcessedTasks() {
    let tmp = [...allTasks];
    let filteredTasks = startFilter(tmp);
    let sortedTasks = startSort(filteredTasks);
    let searchedTasks = handleTaskSearch(sortedTasks);
    let activtyFilteredTasks = handleActivityFiltered(searchedTasks);

    let tmp2 = [...allSubtasks];

    // Doesn't told if subtasks will also be taken in account, if yes uncomment the below code to also take subtasks into account

    // let filteredSubtasks = startFilter(tmp2);
    // let sortedSubtasks = startSort(filteredSubtasks);
    // let searchedSubtasks = handleTaskSearch(sortedSubtasks);
    return { tasks: activtyFilteredTasks, subtasks: tmp2 };
}

function checkMissedReminder(task) {
    let currDate = new Date();
    let reminderDateTime = new Date(task["reminder"]);
    if (isNaN(reminderDateTime)) return true;
    if (task.checked) return true;
    return reminderDateTime.getTime() < currDate.getTime();
}

//
// reminder setting
//

function updateReminder(tasks, subtasks) {
    // remove all the reminders(setTimeout) placed before
    taskReminderId.forEach((id) => clearTimeout(id));
    taskReminderId = [];
    function updateTaskReminder(task) {
        if (!task.checked && task["reminder"] && !checkMissedReminder(task)) {
            let timeDiff =
                new Date(task["reminder"]).getTime() - new Date().getTime();
            let timeoutId = setTimeout(
                () => alert(`Do task - ${task.title}`),
                timeDiff
            );
            taskReminderId.push(timeoutId);
        }
    }
    tasks.forEach((task) => updateTaskReminder(task));
    subtasks.forEach((subtask) => updateTaskReminder(subtask));
}

function renderAllTasks() {
    updateLocalStorage();
    let { tasks, subtasks } = getProcessedTasks();
    updateTaskWrapperHtml(tasks, subtasks);
    updateReminder(tasks, subtasks);
}

function renderFilteredTasks(filteredTasks) {
    updateTaskWrapperHtml(filteredTasks);
}

function editTask(id) {
    if (addingSubtaskId) {
        addingSubtaskId = null;
        renderAllTasks();
        return;
    }
    if (!savingId) savingId = id;
    else savingId = null;
    renderAllTasks();
}

function addSubtask(event, id) {
    event.preventDefault();
    let subtaskInputForm = event.currentTarget.form;
    let title = subtaskInputForm["subtask-title"].value;
    let dueDate = subtaskInputForm["due-date"].value;
    let dueTime = subtaskInputForm["due-time"].value;
    let priority = subtaskInputForm["priority"].value;
    let reminder = subtaskInputForm["reminder"].value;
    let category = subtaskInputForm["category"].value;
    let tags = Array.from(
        subtaskInputForm["tags-input"].nextElementSibling.children
    ).map((element) => element.innerText);
    if (title === "") {
        return;
    }
    let tmp = {
        dueDate,
        dueTime,
        priority,
        reminder,
        category,
        tags,
        title,
        checked: false,
    };
    tmp.parentTaskId = id;
    tmp.id = `subtask-${++lastUsedSubtaskId}`;
    allSubtasks.push(tmp);
    addingSubtaskId = null;
    renderAllTasks();
}

function saveTask(event, id, type) {
    event.preventDefault();
    let inputForm = event.currentTarget.form;
    let updatedTaskVal = inputForm["editing-task"].value;
    let dueDate = inputForm["due-date"].value;
    let dueTime = inputForm["due-time"].value;
    let priority = inputForm["priority"].value;
    let reminder = inputForm["reminder"].value;
    let category = inputForm["category"].value;
    let tags = Array.from(
        inputForm["tags-input"].nextElementSibling.children
    ).map((element) => element.innerText);
    if (updatedTaskVal === "") {
        createMessage({
            background: "rgba(200, 0, 0, 0.9)",
            color: "white",
            message: "Empty Values can't be saved",
        });
        return;
    }
    if (type === "task") {
        allTasks = allTasks.filter((task) => {
            if (task.id === id) {
                task.title = updatedTaskVal;
                task.dueDate = dueDate;
                task.dueTime = dueTime;
                task.priority = priority;
                task.reminder = reminder;
                task.category = category;
                task.tags = tags;
            }
            return task;
        });
    } else if (type === "subtask") {
        allSubtasks = allSubtasks.filter((subtask) => {
            if (subtask.id === id) {
                subtask.title = updatedTaskVal;
                subtask.dueDate = dueDate;
                subtask.dueTime = dueTime;
                subtask.priority = priority;
                subtask.reminder = reminder;
                subtask.category = category;
                subtask.tags = tags;
            }
            return subtask;
        });
    }

    savingId = null;
    renderAllTasks();
}

function handleCheckbox(event, id, type) {
    if (type === "task") {
        allTasks = allTasks.filter((task) => {
            if (task.id === id) {
                task.checked = !task.checked;
            }
            return task;
        });
    } else if (type === "subtask") {
        allSubtasks = allSubtasks.filter((subtask) => {
            if (subtask.id === id) {
                subtask.checked = !subtask.checked;
            }
            return subtask;
        });
    }
    renderAllTasks();
}

function scrollToElement(element) {
    const eleTop = element.offsetTop;
    window.scrollTo({ top: eleTop, behavior: "smooth" });
}

function moveToTaskId(id) {
    let taskIdElement = document.querySelector(`.id-${id}`);
    scrollToElement(taskIdElement);
}

function resetInput() {
    let taskInput = document.getElementById("task-input");
    let inputForm = taskInput.form;
    inputForm;
    taskInput.value = "";
    inputForm["due-date"].value = "";
    inputForm["due-time"].value = "";
    inputForm["priority"].value = "None";
    inputForm["reminder"].value = "";
    inputForm["category"].value = "None";
    inputForm["tags-input"].nextElementSibling.innerHTML = "";
}

function addTask(event) {
    event.preventDefault();
    let taskInput = document.getElementById("task-input");
    let taskValue = taskInput.value;
    let inputForm = event.currentTarget.form;
    let dueDate = inputForm["due-date"].value;
    let dueTime = inputForm["due-time"].value;
    let priority = inputForm["priority"].value;
    let reminder = inputForm["reminder"].value;
    let category = inputForm["category"].value;
    let tags = Array.from(
        inputForm["tags-input"].nextElementSibling.children
    ).map((element) => element.innerText);
    if (taskValue == "") {
        createMessage({
            message: "Can't add empty titled task",
            color: "white",
            background: "rgb(200, 0, 0)",
        });
        return;
    }
    allTasks.push({
        id: `task-${++lastUsedId}`,
        title: taskValue,
        checked: false,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: priority,
        reminder: reminder,
        category: category,
        tags: tags,
        subtask: [],
    });
    renderAllTasks();
    resetInput();
    // moveToTaskId(lastUsedId);
    // createMessage({"message": "Successfully Added Task", color: "white", background: "rgb(0,200,0)", time: 1000})
}

function deleteTask(event, id, type) {
    event.preventDefault();
    if (type === "task") {
        allTasks = allTasks.filter((task) => task.id !== id);
        allSubtasks = allSubtasks.filter(
            (subtask) => subtask.parentTaskId !== id
        );
    } else if (type === "subtask")
        allSubtasks = allSubtasks.filter((subtask) => subtask.id !== id);
    renderAllTasks();
}

function preProcessData() {
    allTasks.forEach((task, ind) => {
        task.id = `task-${ind + 1}`;
    });
    allSubtasks.forEach((subtask, ind) => {
        subtask.id = `subtask-${ind + 1}`;
    });
}

// Load data from localStorage

window.addEventListener("DOMContentLoaded", () => {
    if (JSON.parse(localStorage.getItem(localStorageTaskKey))?.length > 0) {
        changeLoading(true);
        allTasks = JSON.parse(localStorage.getItem(localStorageTaskKey));
        lastUsedId = allTasks.length;
        changeLoading(false);
    }

    if (JSON.parse(localStorage.getItem(localStorageSubtaskKey))?.length > 0) {
        changeLoading(true);
        allSubtasks = JSON.parse(localStorage.getItem(localStorageSubtaskKey));
        lastUsedSubtaskId = allSubtasks.length;
        changeLoading(false);
    }
    preProcessData();
    renderAllTasks();
});

let tagTempList = [];

function createTag(title) {
    let tag = `<span class='tag' onclick="removeTag(this)" >${title}</span>`;
    return tag;
}

function handleTagFormation(e) {
    let keyTyped = e.key;
    if (keyTyped === ",") {
        let tagTitle = e.currentTarget.value.split(",")[0];
        let tagHTML = createTag(tagTitle);
        e.currentTarget.nextElementSibling.innerHTML += tagHTML;
        e.currentTarget.value = "";
    }
}

function removeTag(element) {
    element.remove();
}
function handleOtherAddOptionsVis() {
    // e.preventDefault();
    if (isOtherOptionVis) {
        resetInput();
        document.querySelector(".other-add-options").style.display = "none";
    } else document.querySelector(".other-add-options").style.display = "flex";
    isOtherOptionVis = !isOtherOptionVis;
}

//
// Filtering
//

function handleFilterVis() {
    if (isFilterVis)
        document.querySelector(".filter-options-container").style.display =
            "none";
    else {
        document.querySelector(".filter-options-container").style.display =
            "flex";
    }

    isFilterVis = !isFilterVis;
}

function startFilter(tasks) {
    let filterForm = document.getElementById("filter-start-btn").form;
    let dueDateStart = new Date(filterForm["due-date-start"].value).getTime();
    let dueDateEnd = new Date(filterForm["due-date-end"].value).getTime();
    let categoryFilter = filterForm["category-filter"].value;
    let priorityFilter = filterForm["priority-filter"].value;

    let filteredTasks = tasks;

    if (categoryFilter !== "all")
        filteredTasks = filteredTasks.filter(
            (task) => task.category == categoryFilter
        );

    if (priorityFilter !== "all")
        filteredTasks = filteredTasks.filter(
            (task) => task["priority"] == priorityFilter
        );

    if (isNaN(dueDateStart) && isNaN(dueDateEnd)) {
        // if both dates are not given as input do nothing to filteredTasks
    } else if (isNaN(dueDateStart)) {
        // start date is not given
        filteredTasks = filteredTasks.filter((task) => {
            let taskDueDate = new Date(task["dueDate"]).getTime();
            return taskDueDate <= dueDateEnd;
        });
    } else if (isNaN(dueDateEnd)) {
        // end date is not given
        filteredTasks = filteredTasks.filter((task) => {
            let taskDueDate = new Date(task["dueDate"]).getTime();
            return taskDueDate >= dueDateStart;
        });
    }
    return filteredTasks;
}

function resetFilter(event) {
    let filterForm = document.getElementById("filter-start-btn").form;
    filterForm["due-date-start"].value = "";
    filterForm["due-date-end"].value = "";
    filterForm["category-filter"].value = "all";
    filterForm["priority-filter"].value = "all";
    renderAllTasks();
}

//
// Sorting
//

function handleSortVis() {
    if (isSortVis)
        document.querySelector(".sort-options-container").style.display =
            "none";
    else {
        document.querySelector(".sort-options-container").style.display =
            "flex";
    }

    isSortVis = !isSortVis;
}

// sorting and filtering cross
function startSort(tasks) {
    // update the filtered and sorted task as per
    let sortForm = document.getElementById("sort-start-btn").form;
    let selectedOption = sortForm["sort-option"].value;
    let ordering = sortForm["sort-ordering"].value;

    let sortedTasks = tasks;

    if (selectedOption === "default") {
        return sortedTasks;
    }
    sortedTasks.sort((a, b) => {
        if (selectedOption === "dueDate") {
            // for date sorting
            let dueDate1 = removeTime(new Date(a["dueDate"])).getTime();
            let dueDate2 = removeTime(new Date(b["dueDate"])).getTime();
            if (isNaN(dueDate1) && isNaN(dueDate2)) return 0;
            if (isNaN(dueDate1)) return Infinity;
            if (isNaN(dueDate2)) return -1 * Infinity;
            if (ordering === "Descending") return dueDate2 - dueDate1;
            return dueDate1 - dueDate2;
        } else if (selectedOption === "title") {
            // for string sorting
            let fa = a["title"].toLowerCase(),
                fb = b["title"].toLowerCase();
            if (fa < fb) {
                if (ordering === "Descending") return 1;
                return -1;
            }
            if (fa > fb) {
                if (ordering === "Descending") return -1;
                return 1;
            }
            return 0;
        } else if (selectedOption === "priority") {
            // for priority
            if (ordering === "Descending")
                return (
                    priorityOrder[b["priority"]] - priorityOrder[a["priority"]]
                );
            return priorityOrder[a["priority"]] - priorityOrder[b["priority"]];
        }
    });
    // renderFilteredTasks(filteredTasks);
    return sortedTasks;
}

function resetSort() {
    let sortForm = document.getElementById("sort-start-btn").form;
    sortForm["sort-option"].value = "default";
    renderAllTasks();
}

//
// Search Tasks
//

function handleTaskSearch(tasks) {
    let taskSearchInput = document.getElementById("task-search-input");
    let taskSearchSelect = document.getElementById("task-search-select");

    let searchVal = taskSearchInput.value;
    if (searchVal === "") return tasks;
    let searchOption = taskSearchSelect.value;

    if (searchOption === "tag") {
        tasks = tasks.filter((task) => task.tags.includes(searchVal));
    } else if (searchOption === "name") {
        tasks = tasks.filter((task) => task.title.indexOf(searchVal) != -1);
    } else if (searchOption === "subtask") {
        let tmp = allSubtasks.filter(
            (subtask) => subtask.title.indexOf(searchVal) != -1
        );
        tasks = tasks.filter((task) => {
            let flag = 0;
            tmp.forEach((subtask) => {
                if (subtask.parentTaskId == task.id) {
                    flag = 1;
                }
            });
            if (flag) return task;
        });
    }
    return tasks;
}

function checkPendingTask(task) {
    let currDate = new Date();
    let dueDateTime = new Date(task["dueDate"] + " " + task["dueTime"]);
    if (isNaN(dueDateTime)) return true;
    return dueDateTime.getTime() > currDate.getTime();
}

function checkMissedTask(task) {
    let currDate = new Date();
    let dueDateTime = new Date(task["dueDate"] + " " + task["dueTime"]);
    if (isNaN(dueDateTime)) return false;
    if (task.checked) return false;
    return dueDateTime.getTime() < currDate.getTime();
}

function handleActivityFiltered(tasks) {
    let activityFilters = document.getElementById("activity-filters");
    let selectedFilterVal = activityFilters.value;
    if (selectedFilterVal === "default") return tasks;

    tasks = tasks.filter((task) => {
        if (selectedFilterVal === "pending" && !task["checked"]) {
            return checkPendingTask(task);
        } else if (selectedFilterVal === "missed" && !task["checked"]) {
            return checkMissedTask(task);
        } else if (selectedFilterVal === "completed") {
            return task.checked;
        }
    });

    return tasks;
}

//
// Subtask
//

function handleAddingSubtask(id) {
    if (savingId) {
        savingId = null;
        renderAllTasks();
        return;
    }
    if (!addingSubtaskId) addingSubtaskId = id;
    else addingSubtaskId = null;
    renderAllTasks();
}

//
// auto complete feature
//
function getTimeOnly() {
    let timeOnlyArr = timeOnly.split(":");
    let d = new Date();
    if (timeOnlyArr.length > 0) d.setHours(parseInt(timeOnlyArr[0]));
    if (timeOnlyArr.length > 1) d.setMinutes(parseInt(timeOnlyArr[1]));
    if (timeOnlyArr.length > 2) d.setSeconds(parseInt(timeOnlyArr[2]));
    return d;
}
function fixBrokenTime(t) {
    t = t.toLowerCase();
    let last2letter = t.slice(-2);
    if (t.slice(-2) == "am") {
        let timeOnly = t.split("am")[0].trim();
        return getTimeOnly(timeOnly);
    } else if (t.slice(-2) == "pm") {
        let timeOnly = t.split("pm")[0].trim();
        return getTimeOnly(timeOnly);
    } else return "";
}

function fixBrokenDateTime(d) {
    let result = { date: "", time: "" };

    if (d.toLowerCase().indexOf("today") !== -1) {
        result.date = removeTime(new Date());
        let brokenTime = d.split("today")[1].trim();
        result.time = fixBrokenTime(brokenTime);
    } else if (d.toLowerCase().indexOf("tomorrow") !== -1) {
        result.date = removeTime(new Date(new Date().getDate() + 1));
        let brokenTime = d.split("tomorrow")[1].trim();
        result.time = fixBrokenTime(brokenTime);
    } else {
        return result;
    }
}

function checkInputSyntax(value) {
    if (value.indexOf(" by ") === -1) return false;
    let tmp = value.split(" by ");
    if (tmp.length !== 2) return false;
    return true;
}

//
// Need to Work on this
//
function handleTaskAddKey(event) {
    let inputVal = event.currentTarget.value;
    if (checkInputSyntax(inputVal)) {
        let tmp = inputVal.split(" by ");
        let title = tmp[0].trim();
        let brokenDateTime = tmp[1].trim();
        if (isNaN(new Date(brokenDateTime))) {
            let { date, time } = fixBrokenDateTime(brokenDateTime);
        } else {
            //
        }
    }
}
