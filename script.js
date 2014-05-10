$(document).ready(function() {
    let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || [];
    let currentFilter = 'all';

    // Initialize the app
    init();

    function init() {
        renderTasks();
        updateStats();
        bindEvents();
    }

    function bindEvents() {
        // Add task
        $('#addTaskBtn').click(addTask);
        $('#taskInput').keypress(function(e) {
            if (e.which === 13) addTask();
        });

        // Filter tasks
        $('.filter-btn').click(function() {
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');
            currentFilter = $(this).data('filter');
            renderTasks();
        });

        // Clear actions
        $('#clearCompletedBtn').click(clearCompleted);
        $('#clearAllBtn').click(clearAll);

        // Task interactions
        $(document).on('change', '.task-checkbox', toggleTask);
        $(document).on('click', '.task-delete', deleteTask);
    }

    function addTask() {
        const taskText = $('#taskInput').val().trim();
        const priority = $('#prioritySelect').val();

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(task);
        saveTasks();
        renderTasks();
        updateStats();

        // Clear input
        $('#taskInput').val('');
        $('#prioritySelect').val('medium');

        // Show success animation
        showNotification('Task added successfully!');
    }

    function toggleTask() {
        const taskId = parseInt($(this).closest('.task-item').data('id'));
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    function deleteTask() {
        const taskId = parseInt($(this).closest('.task-item').data('id'));
        
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Task deleted!');
        }
    }

    function clearCompleted() {
        const completedCount = tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Completed tasks cleared!');
        }
    }

    function clearAll() {
        if (tasks.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Delete all tasks? This cannot be undone!')) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('All tasks cleared!');
        }
    }

    function renderTasks() {
        const $taskList = $('#taskList');
        const $emptyState = $('#emptyState');
        
        let filteredTasks = tasks;
        
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        if (filteredTasks.length === 0) {
            $taskList.hide();
            $emptyState.show();
            return;
        }

        $emptyState.hide();
        $taskList.show();

        const tasksHtml = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                <button class="task-delete"><i class="fa fa-trash"></i></button>
            </li>
        `).join('');

        $taskList.html(tasksHtml);
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        $('#totalTasks').text(total);
        $('#pendingTasks').text(pending);
        $('#completedTasks').text(completed);
    }

    function saveTasks() {
        localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    }

    function showNotification(message) {
        // Simple notification system
        const $notification = $('<div class="notification">' + message + '</div>');
        $notification.css({
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#28a745',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 1000,
            opacity: 0
        });

        $('body').append($notification);
        $notification.animate({opacity: 1}, 300);

        setTimeout(() => {
            $notification.animate({opacity: 0}, 300, function() {
                $(this).remove();
            });
        }, 2000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add some sample tasks for demo
    if (tasks.length === 0) {
        const sampleTasks = [
            { id: 1, text: 'Complete project documentation', priority: 'high', completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: 'Review code changes', priority: 'medium', completed: true, createdAt: new Date().toISOString() },
            { id: 3, text: 'Update website content', priority: 'low', completed: false, createdAt: new Date().toISOString() }
        ];
        
        tasks = sampleTasks;
        saveTasks();
        renderTasks();
        updateStats();
    }
});
