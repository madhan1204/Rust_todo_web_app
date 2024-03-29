document.addEventListener("DOMContentLoaded", function() {
    // Your JavaScript code here
    document.getElementById("add-list-button").addEventListener("click", function() {
        document.getElementById("todo-container").style.display = "block";
        document.getElementById("post-btn").style.display = "inline-block"; // Make the POST button visible
    });

    // Event listener for view-todos-button
    document.getElementById("view-todos-button").addEventListener("click", function() {
        document.getElementById("todo-view-container").style.display = "block";
    });

    // Function to add todo input container
    function addTodoContainer() {
        var todoContainer = document.createElement('div');
        todoContainer.innerHTML = `
            <input type="text" class="todo-input" placeholder="Enter your todo">
        `;
        document.getElementById('todo-input-container').appendChild(todoContainer);
    }

    // Function to remove todo input container
    function removeTodoContainer() {
        var todoInputContainer = document.querySelector('#todo-input-container');
        if (todoInputContainer.children.length > 1) {
            todoInputContainer.removeChild(todoInputContainer.lastElementChild);
        }
    }

    // Function to send todo data to the server
    function postTodoData() {
        var dateInput = document.querySelector('input[type="date"]').value; // Get the date input value
        var todoInputs = document.querySelectorAll('.todo-input');
        var todos = [];
        todoInputs.forEach(function(input) {
            if (input.value.trim() !== '') {
                todos.push(input.value.trim());
            }
        });

        // Sending data to the server
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/add_todo", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("Todo data sent to server");
                alert("Data Sent to server");
                // You can add any further action here upon successful addition
            }
        };
        var data = JSON.stringify({ date: dateInput, todos: todos });
        xhr.send(data);
    }

    // Add event listener to the Add Todo button
    document.getElementById('add-btn').addEventListener('click', addTodoContainer);
    document.getElementById('rm-btn').addEventListener('click', removeTodoContainer);
    // Ensure post-btn is correctly attached after DOMContentLoaded
    document.getElementById('post-btn').addEventListener('click', postTodoData);
});

document.getElementById("search-btn").addEventListener("click", function() {
    var dateInput = document.getElementById("search-date-input").value;

    fetch(`/search_todos/${dateInput}`)
        .then(response => response.json())
        .then(data => {
            var todosContainer = document.getElementById("todo-view-contents");
            todosContainer.innerHTML = '';

            // Create the table
            var table = document.createElement('table');
            table.classList.add('todo-table');

            // Create table headers
            var headers = ['Check', 'Tasks'];
            var headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                var headerCell = document.createElement('th');
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });
            table.appendChild(headerRow);

            // Add todo items as rows in the table
            data.forEach(todo => {
                var todoRow = document.createElement('tr');
                
                // Checkbox column
                var checkboxCell = document.createElement('td');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('todo-checkbox');
                checkbox.id = `todo-${todo.id}`;
                var label = document.createElement('label');
                label.htmlFor = `todo-${todo.id}`;
                checkboxCell.appendChild(checkbox);
                checkboxCell.appendChild(label);
                todoRow.appendChild(checkboxCell);
                
                // Task column
                var taskCell = document.createElement('td');
                taskCell.textContent = todo.event_tasks;
                todoRow.appendChild(taskCell);

                table.appendChild(todoRow);
            });

            todosContainer.appendChild(table);
        })
        .catch(error => console.error('Error fetching todos:', error));
});


//
document.getElementById("del-btn").addEventListener("click", function() {
    var checkedCheckboxes = document.querySelectorAll('.todo-checkbox:checked');
    var todoIds = [];

    checkedCheckboxes.forEach(function(checkbox) {
        var todoId = checkbox.id.split('-')[1];
        todoIds.push(parseInt(todoId)); // Parse ID as integer
    });

    fetch(`/delete_todo`, { // Change endpoint to delete_todo
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoIds) // Send array of IDs
    })
    .then(response => {
        if (response.ok) {
            checkedCheckboxes.forEach(function(checkbox) {
                var todoRow = checkbox.parentElement.parentElement;
                todoRow.remove();
            });
            alert("Selected TODO items deleted successfully!");
        } else {
            console.error('Failed to delete TODO items');
            alert("Failed to delete selected TODO items");
        }
    })
    .catch(error => console.error('Error deleting TODO items:', error));
});

