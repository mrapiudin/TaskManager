// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.setTodayAsMinDate();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal close events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });

        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        this.editingTaskId = taskId;
        
        if (taskId) {
            // Edit mode
            const task = this.tasks.find(t => t.id === taskId);
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDeadline').value = task.deadline;
            document.getElementById('saveBtn').textContent = 'Update Task';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            form.reset();
            document.getElementById('saveBtn').textContent = 'Save Task';
        }
        
        modal.classList.add('show');
        document.getElementById('taskTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('show');
        this.editingTaskId = null;
        document.getElementById('taskForm').reset();
    }

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const deadline = document.getElementById('taskDeadline').value;

        if (!title || !deadline) {
            alert('Please fill in all fields');
            return;
        }

        if (this.editingTaskId) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                deadline
            };
        } else {
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                title,
                deadline,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.tasks.unshift(newTask);
        }

        this.saveTasks();
        this.renderTasks();
        this.closeModal();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        task.completed = !task.completed;
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'today':
                return this.tasks.filter(task => task.deadline === today);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'all':
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.getTaskHTML(task)).join('');
        
        // Bind task events
        this.bindTaskEvents();
    }

    bindTaskEvents() {
        // Checkbox events
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.toggleTask(taskId);
            });
        });

        // Edit button events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.openModal(taskId);
            });
        });

        // Delete button events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    getTaskHTML(task) {
        const deadlineClass = this.getDeadlineClass(task.deadline);
        const deadlineText = this.formatDeadline(task.deadline);
        
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-deadline ${deadlineClass}">
                        <span class="deadline-icon"></span>
                        ${deadlineText}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" data-task-id="${task.id}" title="Edit task">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: {
                title: 'No tasks yet',
                message: 'Click "+ Add Task" to create your first task'
            },
            today: {
                title: 'No tasks for today',
                message: 'You have no tasks scheduled for today'
            },
            completed: {
                title: 'No completed tasks',
                message: 'Complete some tasks to see them here'
            }
        };

        const content = messages[this.currentFilter] || messages.all;
        
        return `
            <div class="empty-state">
                <h3>${content.title}</h3>
                <p>${content.message}</p>
            </div>
        `;
    }

    getDeadlineClass(deadline) {
        const today = new Date().toISOString().split('T')[0];
        const taskDate = new Date(deadline);
        const todayDate = new Date(today);
        
        if (deadline === today) {
            return 'today';
        } else if (taskDate < todayDate) {
            return 'overdue';
        }
        return '';
    }

    formatDeadline(deadline) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        if (deadline === today) {
            return 'Today';
        } else if (deadline === tomorrowStr) {
            return 'Tomorrow';
        } else {
            const date = new Date(deadline);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
        }
    }

    setTodayAsMinDate() {
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0');
        document.getElementById('taskDeadline').setAttribute('min', todayStr);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskManagerTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('taskManagerTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

// Add some sample tasks for demonstration (only if no tasks exist)
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('taskManagerTasks');
    if (!saved || JSON.parse(saved).length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const sampleTasks = [
            {
                id: '1',
                title: 'Complete project documentation',
                deadline: today,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Review code changes',
                deadline: tomorrowStr,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Team meeting preparation',
                deadline: today,
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('taskManagerTasks', JSON.stringify(sampleTasks));
    }
});