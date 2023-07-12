
interface Todo {
    id: string
    text: string
    completed: boolean;
}
// Definir una interfaz

let todos: Todo[] = JSON.parse(localStorage.getItem('todos')) || []

const textTask = document.querySelector('.text-task') as HTMLInputElement
const listTasks = document.querySelector('.task-list') as HTMLUListElement
const footer = document.querySelector('.footer') as HTMLDivElement;
const todoCount = document.querySelector('.todo-count') as HTMLSpanElement;
const allTask = document.querySelector('.all') as HTMLLIElement;
const activeTask = document.querySelector('.active') as HTMLLIElement;
const completedTask = document.querySelector('.liCompleted') as HTMLLIElement;
const clearCompleted = document.querySelector('.clear-completed') as HTMLButtonElement;
const deleteTask = document.querySelector('.destroy') as HTMLButtonElement;

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function toggleCompleted(todoId: string) {
    const todo = todos.find(todo => todo.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTasks(todos);
        updateDeleteAllButton()
    }
}

function updateDeleteAllButton() {
    const hasCompletedTasks = todos.some(task => task.completed);

    const deleteAllTasks = document.querySelector('.clear-completed');
    if (hasCompletedTasks) {
        if (!deleteAllTasks) {
            const newDeleteAllTasks = document.createElement('button');
            newDeleteAllTasks.innerHTML = "Borrar completados";
            newDeleteAllTasks.classList.add('clear-completed');
            footer.appendChild(newDeleteAllTasks);
        }
    } else {
        if (deleteAllTasks) {
            footer.removeChild(deleteAllTasks);
        }
    }
}

function renderTask(task: Todo) {
    const li = document.createElement('li');
    li.innerHTML = `
            <div class="view">
                <input class="toggle" type="checkbox">
                <label class="task-label" data-id="${task.id}">${task.text}</label>
                <button class="destroy" data-id="${task.id}"></button>
            </div>
            <input class="edit" value="${task.text}">
        `;
    li.classList.add('task-list__item');
    if (task.completed) {
        li.classList.add('completed')
    }

    const checkbox = li.querySelector('.toggle') as HTMLInputElement;
    checkbox.checked = task.completed;

    checkbox.addEventListener('click', () => {
        toggleCompleted(task.id)
        li.classList.toggle('completed');
    })

    listTasks.appendChild(li);
}

function renderTasks(tasks: Todo[]) {
    listTasks.innerHTML = '';
    tasks.forEach(task => {
        renderTask(task);
        updateDeleteAllButton();
    })

    let taskPending = todos.filter(task => !task.completed).length;

    switch (taskPending) {
        case 0:
            todoCount.innerHTML = '0 tareas pendientes';
            break;
        case 1:
            todoCount.innerHTML = '1 tarea pendiente';
            break;
        default:
            todoCount.innerHTML = taskPending.toString() + ' tareas pendientes';
            break;
    }
}

renderTasks(todos)

textTask.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const task = textTask.value.trim();
        textTask.value = '';

        if (task !== '') {
            const newTodo: Todo = {
                id: Date.now().toString(),
                text: task,
                completed: false
            };

            todos.push(newTodo);
            saveTodos();
            renderTask(newTodo);
            updateDeleteAllButton();
            renderTasks(todos);
        }
    }
});

function handleClick(element: HTMLElement, filterFunction: (task: Todo) => boolean) {
    renderTasks(todos.filter(filterFunction))
    const lists = [allTask, activeTask, completedTask]
    lists.forEach(list => list.classList.remove('selected'))
    element.classList.add('selected')
}

listTasks.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('destroy')) {
        const todoId = target.dataset.id;
        todos = todos.filter(task => task.id !== todoId);
        saveTodos();
        renderTasks(todos);
    }

})

listTasks.addEventListener('dblclick', (event) => {
    const target = event.target as HTMLElement;
    const task = target.closest('.task-list__item') as HTMLLIElement;
    if (task && task.classList.contains('editing')) return

    if (task) {
        task.classList.add('editing');
        const label = task.querySelector('.task-label') as HTMLLabelElement;
        const input = task.querySelector('.edit') as HTMLInputElement;
        input.value = label.innerText;
        label.replaceWith(input.value);
        input.focus();

        // Establecer el cursor al final del texto al editar
        const textLength = input.value.length;
        input.setSelectionRange(textLength, textLength);

        input.addEventListener('blur', () => {
            const updatedText = input.value.trim();
            const id = label.dataset.id;
            if (id && updatedText !== '') {
                const todo = todos.find(task => task.id === id);
                if (todo) {
                    todo.text = updatedText;
                    saveTodos();
                    renderTasks(todos);
                }
            } else {
                input.classList.remove('editing');
            }
        })

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                input.blur();
            }

        })

    }
})

allTask.addEventListener('click', () => {
    handleClick(allTask, () => true)
})

activeTask.addEventListener('click', () => {
    handleClick(activeTask, task => !task.completed)
})

completedTask.addEventListener('click', () => {
    handleClick(completedTask, task => task.completed)
})

footer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clear-completed')) {
        todos = todos.filter(task => !task.completed);
        saveTodos();
        renderTasks(todos);
    }
});

