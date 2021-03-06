const apikey = '********************************';
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

        if (title.length && description.length) {
            apiCreateTask(title, description).then(
                (response) => {
                    const task = response.data
                    renderTask(task.id, task.title, task.description, task.status);
                }
            )
        } else {
            alert('Wypełnij pola danymi!')
        }
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
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json();
        }
    )
}

function renderTask(taskId, title, description, status) {
    document.querySelector("input[name='title']").value = "";
    document.querySelector("input[name='description']").value = "";

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
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click', () => {
            apiUpdateTask(taskId, title, description, status).then(
                () => {
                    const toRemove = section.querySelectorAll(".js-task-open-only");
                    toRemove.forEach(
                        (el) => el.remove()
                    );
                }
            );
        });

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
        addOperationDiv.className = 'card-body js-task-open-only';
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

        addOperationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (operationInput.value.length) {
                apiCreateOperationForTask(taskId, operationInput.value).then(
                    (response) => {
                        const operation = response.data;
                        renderOperation(operationsListUl, operation.id, status, operation.description, operation.timeSpent);
                    }
                );
                operationInput.value = "";
            } else {
                alert('Wypełnij pole!')
            }
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        apiDeleteTask(taskId).then(
            () => {
                section.remove();
            }
        );
    })

}

function apiListOperationsForTask(taskId) {
    return fetch(apihost + `/api/tasks/${taskId}/operations`, {
        headers: {
            Authorization: apikey
        }
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
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
        buttonsDiv.className = 'js-task-open-only';
        operationLi.appendChild(buttonsDiv);

        const button15m = document.createElement('button');
        button15m.className = 'btn btn-outline-success btn-sm mr-2';
        button15m.innerText = '+15m';
        buttonsDiv.appendChild(button15m);

        button15m.addEventListener('click', () => {
            timeSpent += 15;

            apiUpdateOperation(operationId, operationDescription, timeSpent).then(
                (response) => {
                    const changedOperation = response.data;
                    time.innerText = formatTime(changedOperation.timeSpent);
                }
            )
        });

        const button1h = document.createElement('button');
        button1h.className = 'btn btn-outline-success btn-sm mr-2';
        button1h.innerText = '+1h';
        buttonsDiv.appendChild(button1h);

        button1h.addEventListener('click', () => {
            timeSpent += 60;

            apiUpdateOperation(operationId, operationDescription, timeSpent).then(
                (response) => {
                    const changedOperation = response.data;
                    time.innerText = formatTime(changedOperation.timeSpent);
                }
            )
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.innerText = 'Delete';
        buttonsDiv.appendChild(deleteButton);

        deleteButton.addEventListener('click', () => {
            apiDeleteOperation(operationId).then(
                () => {
                    operationLi.remove();
                }
            );
        });
    }
}

function formatTime(time) {
    if (time < 60) {
        return time + 'm';
    } else {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
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
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
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
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json()
        }
    )
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(apihost + `/api/tasks/${taskId}/operations`, {
        method: 'POST',
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({description: description, timeSpent: 0})
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json()
        }
    )
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(apihost + `/api/operations/${operationId}`, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({description: description, timeSpent: timeSpent}),
        method: 'PUT'
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json()
        }
    )
}

function apiDeleteOperation(operationId) {
    return fetch(apihost + `/api/operations/${operationId}`, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        method: 'DELETE'
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json()
        }
    )
}

function apiUpdateTask(taskId, title, description) {
    return fetch(apihost + `/api/tasks/${taskId}`, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({title: title, description: description, status: 'closed'}),
        method: 'PUT'
    }).then(
        (resp) => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny')
            }
            return resp.json()
        }
    )
}

