// ===== TASK MANAGER APPLICATION =====
// Author: Hassan Butt
// Description: Full-featured task management app with local storage

// ===== DOM ELEMENTS =====
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingTasks = document.getElementById('pendingTasks');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const currentDate = document.getElementById('currentDate');

// ===== STATE =====
let tasks = [];
let currentFilter = 'all';

// ===== INITIALIZE =====
function init() {
    loadTasks();
    renderTasks();
    updateStats();
    displayDate();
    setupEventListeners();
}

// ===== LOAD TASKS FROM LOCAL STORAGE =====
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        // Add sample tasks if no tasks exist
        tasks = [
            {
                id: Date.now() + 1,
                text: 'Build my portfolio website',
                priority: 'high',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                text: 'Apply for internships',
                priority: 'medium',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                text: 'Complete Data Structures assignment',
                priority: 'low',
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks();
    }
}

// ===== SAVE TASKS TO LOCAL STORAGE =====
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== DISPLAY CURRENT DATE =====
function displayDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// ===== RENDER TASKS =====
function renderTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No tasks ${currentFilter !== 'all' ? currentFilter : ''} yet</p>
                <p style="font-size: 0.85rem; margin-top: 0.3rem;">Add a new task above!</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
            <span class="task-text">${escapeHTML(task.text)}</span>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            <span class="task-date">${formatDate(task.createdAt)}</span>
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    // Update task count
    taskCount.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;
}

// ===== UPDATE STATISTICS =====
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

// ===== ADD TASK =====
function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    taskInput.value = '';
    taskInput.focus();

    // Add a small animation effect
    const firstTask = taskList.firstChild;
    if (firstTask) {
        firstTask.style.animation = 'none';
        setTimeout(() => {
            firstTask.style.animation = 'slideIn 0.3s ease';
        }, 10);
    }
}

// ===== DELETE TASK =====
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// ===== TOGGLE TASK COMPLETION =====
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// ===== CLEAR COMPLETED TASKS =====
function clearCompleted() {
    const completedExist = tasks.some(task => task.completed);
    if (!completedExist) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm('Delete all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// ===== SET FILTER =====
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    renderTasks();
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - taskDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Add task button
    addTaskBtn.addEventListener('click', addTask);

    // Enter key on input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Task list event delegation (for checkboxes and delete buttons)
    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);

        // Checkbox toggle
        if (e.target.classList.contains('task-checkbox')) {
            toggleTask(taskId);
            return;
        }

        // Delete button
        if (e.target.closest('.delete-btn')) {
            deleteTask(taskId);
            return;
        }
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl + A: Focus on input
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        taskInput.focus();
    }
    // Escape: Clear input
    if (e.key === 'Escape') {
        taskInput.value = '';
        taskInput.blur();
    }
});

// ===== START APP =====
document.addEventListener('DOMContentLoaded', init);

console.log('✅ Task Manager loaded successfully!');
console.log('📧 Email: butthaan971@gmail.com');
console.log('🐙 GitHub: https://github.com/Hassanbutt67');
console.log('⌨️ Shortcuts: Ctrl+A (Add Task), Escape (Clear Input)');
