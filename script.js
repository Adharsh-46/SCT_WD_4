document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskDateTime = document.getElementById('task-datetime');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  const STORAGE_KEY = 'todo.tasks.v1';

  // Auto-set datetime-local to current date & time
  setDefaultDateTime();

  // Load + state
  let tasks = loadTasks();
  renderAll();

  // Add (submit form)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = taskInput.value.trim();
    const datetime = taskDateTime.value;

    if (!text || !datetime) return;

    const task = {
      id: Date.now().toString(),
      text,
      datetime,
      completed: false,
    };

    tasks.push(task);
    persist();
    renderTask(task);
    toggleEmpty();

    form.reset();
    setDefaultDateTime(); // reset datetime to NOW again
    taskInput.focus();
  });

  // Complete / Delete (event delegation)
  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const id = li.dataset.id;

    if (e.target.closest('.complete-btn')) {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      t.completed = !t.completed;
      persist();
      li.classList.toggle('completed');
    }

    if (e.target.closest('.delete-btn')) {
      tasks = tasks.filter(x => x.id !== id);
      persist();
      li.remove();
      toggleEmpty();
    }
  });

  // ----- Helpers -----
  function renderAll() {
    tasks.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    taskList.innerHTML = '';
    tasks.forEach(renderTask);
    toggleEmpty();
  }

  function renderTask(t) {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    if (t.completed) li.classList.add('completed');

    const info = document.createElement('div');
    info.className = 'task-info';
    const when = new Date(t.datetime);
    info.innerHTML = `
      <span>${escapeHTML(t.text)}</span>
      <span class="task-time">${when.toLocaleString()}</span>
    `;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const completeBtn = document.createElement('button');
    completeBtn.type = 'button';
    completeBtn.className = 'complete-btn';
    completeBtn.title = 'Mark complete';
    completeBtn.textContent = '✔';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Delete task';
    deleteBtn.textContent = '🗑';

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    taskList.appendChild(li);
  }

  function toggleEmpty() {
    emptyState.style.display = tasks.length ? 'none' : 'block';
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  // Prevent HTML injection
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, s =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
    );
  }

  // Function to set datetime-local input to NOW
  function setDefaultDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
    taskDateTime.value = now.toISOString().slice(0,16);
  }
});
