const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

function saveTasks() {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {
        const taskElement = document.createElement("div");

        taskElement.className = "task";
        if (task.completed) {
            taskElement.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.type = "button";

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        actions.append(editButton, deleteButton);
        taskElement.append(checkbox, text, actions);

        // Event delegation: events are handled by the task list.
        taskElement.dataset.id = task.id;

        taskList.appendChild(taskElement);
    });

    const remaining = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;

    taskCount.textContent =
        ${remaining} task${remaining !== 1 ? "s" : ""} remaining;

    completedCount.textContent = ${completed} completed;

    saveTasks();
}

todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({
        id: Date.now().toString(),
        text: text,
        completed: false
    });

    taskInput.value = "";
    renderTasks();
    taskInput.focus();
});

taskList.addEventListener("click", function (event) {
    const taskElement = event.target.closest(".task");

    if (!taskElement) return;

    const taskId = taskElement.dataset.id;
    const task = tasks.find(item => item.id === taskId);

    if (!task) return;

    if (event.target.classList.contains("delete-btn")) {
        tasks = tasks.filter(item => item.id !== taskId);
        renderTasks();
    }

    if (event.target.classList.contains("edit-btn")) {
        const updatedText = prompt("Edit your task:", task.text);

        if (updatedText === null) return;

        if (updatedText.trim()) {
            task.text = updatedText.trim();
            renderTasks();
        } else {
            alert("Task cannot be empty.");
        }
    }
});

taskList.addEventListener("change", function (event) {
    if (!event.target.classList.contains("task-checkbox")) return;

    const taskElement = event.target.closest(".task");
    const task = tasks.find(item => item.id === taskElement.dataset.id);

    if (task) {
        task.completed = event.target.checked;
        renderTasks();
    }
});

filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn === this);
        });

        renderTasks();
    });
});

clearCompleted.addEventListener("click", function () {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
});

renderTasks();