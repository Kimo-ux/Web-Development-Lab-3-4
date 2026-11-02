interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
let todos: Todo[] = [];
let nextId = 1;
type Filter = "all" | "active" | "completed";
let currentFilter: Filter = "all";
const todoInput = document.getElementById("todoInput") as HTMLInputElement;
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
const todoList = document.getElementById("todoList") as HTMLUListElement;
const itemsLeft = document.getElementById("itemsLeft") as HTMLSpanElement;
const clearCompletedBtn = document.getElementById("clearCompleted") as HTMLButtonElement;
const clearAllBtn = document.getElementById("clearAll") as HTMLButtonElement;
const filterBtns = document.querySelectorAll<HTMLButtonElement>(".filterBtn");
function getVisibleTodos(): Todo[] {
  if (currentFilter === "active") {
    return todos.filter(t => !t.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter(t => t.completed);
  }
  return todos;
}
function render(): void {
  const visible = getVisibleTodos();

  todoList.innerHTML = visible
    .map(todo => `
      <li data-id="${todo.id}">
        <input type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}>
        <span class="text">${escapeHtml(todo.text)}</span>
        <button class="delete">🗑</button>
      </li>
    `)
    .join("");

  const left = todos.filter(t => !t.completed).length;
  itemsLeft.textContent = `${left} ${left === 1 ? "item" : "items"} left`;
  filterBtns.forEach(btn => {
  btn.classList.toggle("selected", btn.dataset.filter === currentFilter);
  });
}
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function addTodo(): void {
  const text = todoInput.value.trim();
  if (text === "") return;

  todos.push({ id: nextId, text: text, completed: false });
  nextId++;

  todoInput.value = "";
  render();
}
addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    addTodo();
  }
});
function toggleTodo(id: number): void {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  render();
}

function deleteTodo(id: number): void {
  todos = todos.filter(t => t.id !== id);
  render();
}
todoList.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const li = target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (target.classList.contains("delete")) {
    deleteTodo(id);
  } else if (target.classList.contains("toggle")) {
    toggleTodo(id);
  }
});
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter as Filter;
    render();
  });
});
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  render();
});

clearAllBtn.addEventListener("click", () => {
  todos = [];
  render();
});
function editTodo(id: number, newText: string): void {
  const text = newText.trim();
  if (text === "") {
    deleteTodo(id);
    return;
  }
  todos = todos.map(t => (t.id === id ? { ...t, text } : t));
  render();
}
todoList.addEventListener("dblclick", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("text")) return;

  const li = target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.text;
  input.className = "edit";
  target.replaceWith(input);
  input.focus();

  let finished = false;
  const finish = (save: boolean): void => {
    if (finished) return;
    finished = true;
    if (save) {
      editTodo(id, input.value);
    } else {
      render();
    }
  };

  input.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter") finish(true);
    else if (ev.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
});
render();