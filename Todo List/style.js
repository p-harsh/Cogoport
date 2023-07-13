let allTasks = [];
let lastUsedId = 0;

function renderAllTasks() {
    let taskWrapper = document.getElementById("task-wrapper");
    taskWrapper.innerHTML = "";
    allTasks.forEach((task, ind) => {
        taskWrapper.innerHTML =
            taskWrapper.innerHTML +
            `<tr class="task id-${ind + 1}">
            <td>${ind + 1}</td>
  <td class="task-name">${task.task}</td>
  <td><button class="delete-btn" onclick="deleteTask(${task.id})" id=${
                task.id
            }>Delete</button></td>
  </tr>`;
    });
}

function scrollToElement(element) {
    const eleTop = element.offsetTop;
    window.scrollTo({ top: eleTop, behavior: "smooth" });
}

function moveToTaskId(id) {
    let taskIdElement = document.querySelector(`.id-${id + 1}`);
    // console.log(taskPos);
    scrollToElement(taskIdElement);
}

function reset() {
    let taskInput = document.getElementById("task-input");
    taskInput.value = "";
}

function saveTask() {
    let taskInput = document.getElementById("task-input");
    let taskValue = taskInput.value;
    if (taskValue == "") return;
    allTasks.push({ id: lastUsedId + 1, task: taskValue });
    lastUsedId++;
    renderAllTasks();
    reset();
    moveToTaskId(lastUsedId - 1);
}

function deleteTask(id) {
    allTasks = allTasks.filter((task) => task.id !== id);
    renderAllTasks();
}

window.addEventListener("DOMContentLoaded", () => {
    fetch("https://jsonplaceholder.typicode.com/todos")
        .then((res) => res.json())
        .then((data) => {
            allTasks = [
                ...allTasks,
                ...data.map((e) => {
                    return { id: e.id, task: e.title };
                }),
            ];
            lastUsedId = data.length;
            renderAllTasks();
        });
});
