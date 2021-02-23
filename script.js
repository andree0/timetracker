const apikey = 'ad0b9056-8273-45ff-afa8-231f9496f1b2';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', function() {
apiListTasks().then(
    (response) => {
        response.data.forEach(
            (task) => {
                renderTask(task.id, task.title, task.description, task.status);
            }
        );
    }
);

const addNewTaskForm = document.querySelector("form.js-task-adding-form");

addNewTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = e.currentTarget.querySelector("input[name='title']").value;
    const description = e.currentTarget.querySelector("input[name='description']").value;

    apiCreateTask(title, description).then(
        (response) => {
            const task = response.data
            renderTask(task.id, task.title, task.description, task.status);
        }
    )
});
});

function apiListTasks() {
    return fetch(apihost + '/api/tasks', {
        headers: {
            Authorization: apikey
        }
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('zjebałeś')
            }
            return resp.json();
        }
    )
}

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';
    document.querySelector("main").appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        apiDeleteTask(taskId).then(
            section.remove()
        );
    })

    const operationsListUl = document.createElement('ul');
    section.className = 'list-group list-group-flush';
    section.appendChild(operationsListUl);

    apiListOperationsForTask(taskId).then(
        (response) => {
            response.data.forEach(
                (operation) => { renderOperation(
                    operationsListUl,
                    operation.id,
                    status,
                    operation.description,
                    operation.timeSpent);
                }
            )
        }
    )

    const addOperationDiv = document.createElement('div');
    addOperationDiv.className = 'card-body';
    section.appendChild(addOperationDiv);

    const addOperationForm = document.createElement('form');
    addOperationDiv.appendChild(addOperationForm);

    const inputOperationDiv = document.createElement('div');
    inputOperationDiv.className = 'input-group';
    addOperationForm.appendChild(inputOperationDiv);

    const operationInput = document.createElement('input');
    operationInput.className = 'form-control';
    operationInput.placeholder = 'Operation description';
    operationInput.type = 'text';
    operationInput.minLength = 5;
    inputOperationDiv.appendChild(operationInput);

    const buttonAddOperationDiv = document.createElement('div');
    buttonAddOperationDiv.className = 'input-group-append';
    inputOperationDiv.appendChild(buttonAddOperationDiv);

    const addOperationButton = document.createElement('button');
    addOperationButton.className = 'btn btn-info';
    addOperationButton.innerText = 'Add';
    buttonAddOperationDiv.appendChild(addOperationButton);

}

function apiListOperationsForTask(taskId) {
    return fetch(apihost + `/api/tasks/${taskId}/operations`, {
        headers: {
            Authorization: apikey
        }
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Zjebałeś')
            }
            return resp.json();
    })
}

function renderOperation(operationsList, operationId, status, operationDescription, timeSpent) {
    const operationLi = document.createElement('li');
    operationLi.className = 'list-group-item d-flex justify-content-between align-items-center';
    operationsList.append(operationLi);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    operationLi.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = formatTime(timeSpent);
    descriptionDiv.appendChild(time);

    if (status === "open") {
        const buttonsDiv = document.createElement('div');
        operationLi.appendChild(buttonsDiv);

        const button15m = document.createElement('button');
        button15m.className = 'btn btn-outline-success btn-sm mr-2';
        button15m.innerText = '+15m';
        buttonsDiv.appendChild(button15m);

        const button1h = document.createElement('button');
        button1h.className = 'btn btn-outline-success btn-sm mr-2';
        button1h.innerText = '+1h';
        buttonsDiv.appendChild(button1h);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.innerText = 'Delete';
        buttonsDiv.appendChild(deleteButton);
    }
}

function formatTime(time) {
    if (time < 60) {
        return time + 'm';
    } else {
        const hours = Math.floor(time / 60);
        const minutes = (time % 60) * 60;
        if (minutes === 0) {
            return hours + 'h '
        } else {
           return hours + 'h ' + minutes + 'm';
        }
    }
}

function apiCreateTask(title, description) {
    return fetch(apihost + '/api/tasks', {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, description: description, status: 'open' }),
        method: 'POST'
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Zjebałeś na maksa')
            }
            return resp.json();
        }
    )
}

function apiDeleteTask(taskId) {
    return fetch(apihost + `/api/tasks/${taskId}`, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json'},
        method: 'DELETE'
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Zjebałeś usuwanie zadania')
            }
            return resp.json()
        }
    )
}

function apiCreateOperationForTask() {
    console.log('funkcja apiCreateOperationForTask');
}

function apiUpdateOperation() {
    console.log('funkcja apiUpdateOperation');
}

function apiDeleteOperation() {
    console.log('funkcja apiDeleteOperation');
}

function apiUpdateTask() {
    console.log('funkcja apiUpdateTask');
}

apiCreateOperationForTask();
apiUpdateOperation();
apiDeleteOperation();
apiUpdateTask();
