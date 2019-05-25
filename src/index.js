const h = require('virtual-dom/h');
const diff = require('virtual-dom/diff');
const patch = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');

// ======================== MODEL ========================

const initModel = {
    initialData: "",
    input: "",
    items: [
        { id: 1, task: "Get milk." },
        { id: 2, task: "Get eggs." },
        { id: 3, task: "Get chocolate." },
        { id: 4, task: "Get bread." },
    ],
    contentOne: null,
    contentTwo: null,
};

// Initialize the view.
let init = {
    model: initModel,
    command: getInitialData()
}

// ======================== HTTP COMMANDS ========================

function getInitialData(model) {
    return {
        request: { url: `https://swapi.co/api/people/1/` },
        // If the request succeeds, dispatch a message with these parameters.
        successMsg: (response) => {
            return {
                type: MSGS.GET_INITIAL_DATA_SUCCESS,
                payload: response,
            }
        },
        // If the request fails, dispatch a message with these parameters.
        errorMsg: (response) => {
            return {
                type: MSGS.GET_INITIAL_DATA_ERROR,
                payload: response,
            }
        }
    }
}

function getDataOne(model) {
    return {
        request: { url: `https://jsonplaceholder.typicode.com/posts/1` },
        // If the request succeeds, dispatch a message with these parameters.
        successMsg: (response) => {
            return {
                type: MSGS.GET_DATA_ONE_SUCCESS,
                payload: response,
            }
        },
        // If the request fails, dispatch a message with these parameters.
        errorMsg: (response) => {
            return {
                type: MSGS.GET_DATA_ONE_ERROR,
                payload: response,
            }
        }
    }
}

function getDataTwo(model) {
    return {
        request: { url: `https://jsonplaceholder.typicode.com/posts/2` },
        successMsg: (response) => {
            return {
                type: MSGS.GET_DATA_TWO_SUCCESS,
                payload: response,
            }
        },
        errorMsg: (response) => {
            return {
                type: MSGS.GET_DATA_TWO_ERROR,
                payload: response,
            }
        }
    }
}

// ======================== MESSAGES ========================

const MSGS = {
    INPUT: 'INPUT',
    SAVE: 'SAVE',
    DELETE: 'DELETE',
    GET_INITIAL_DATA_SUCCESS: 'GET_INITIAL_DATA_SUCCESS',
    GET_INITIAL_DATA_ERROR: 'GET_INITIAL_DATA_ERROR',
    GET_DATA_ONE: 'GET_DATA_ONE',
    GET_DATA_ONE_SUCCESS: 'GET_DATA_ONE_SUCCESS',
    GET_DATA_ONE_ERROR: 'GET_DATA_ONE_ERROR',
    GET_DATA_TWO: 'GET_DATA_TWO',
    GET_DATA_TWO_SUCCESS: 'GET_DATA_TWO_SUCCESS',
    GET_DATA_TWO_ERROR: 'GET_DATA_TWO_ERROR',
};

// ======================== UPDATE ========================

function update(msg, model) {
    switch (msg.type) {

        case MSGS.INPUT: {
            let newModel = model;
            newModel.input = msg.payload;
            return newModel;
            break;
        }

        case MSGS.SAVE: {
            let newModel = model;
            // Simulate Id incrementing.
            let id = newModel.items.length > 0 ? lastId = newModel.items[newModel.items.length - 1].id + 1 : 1;
            newModel.items.push({ id: id, task: newModel.input });
            newModel.input = "";
            return newModel;
            break;
        }

        case MSGS.DELETE: {
            let newModel = model;
            newModel.items = newModel.items.filter(item => item.id != msg.payload);
            return newModel;
            break;
        }

        case MSGS.GET_INITIAL_DATA_SUCCESS: {
            let newModel = model;
            newModel.initialData = JSON.stringify(msg.payload);
            return newModel;
            break;
        }

        case MSGS.GET_INITIAL_DATA_ERROR: {
            let newModel = model;
            newModel.initialData = msg.payload;
            return newModel;
            break;
        }

        case MSGS.GET_DATA_ONE: {
            // Model to be sent in app.
            let newModel = model;
            newModel.contentOne = "Loading..."

            // Command, executed in the app.
            let command = getDataOne();
            // Send to app. Must be an array.
            return [newModel, command]
            break;
        }

        case MSGS.GET_DATA_ONE_SUCCESS: {
            let newModel = model;
            newModel.contentOne = msg.payload.body;
            return newModel;
            break;
        }

        case MSGS.GET_DATA_ONE_ERROR: {
            let newModel = model;
            newModel.contentOne = msg.payload;
            return newModel;
            break;
        }

        case MSGS.GET_DATA_TWO: {
            // Model to be sent in app.
            let newModel = model;
            newModel.contentTwo = "Loading..."

            // Command, executed in the app.
            let command = getDataTwo();
            // Send to app. Must be an array.
            return [newModel, command]
            break;
        }

        case MSGS.GET_DATA_TWO_SUCCESS: {
            let newModel = model;
            newModel.contentTwo = msg.payload.body;
            return newModel;
            break;
        }

        case MSGS.GET_DATA_TWO_ERROR: {
            let newModel = model;
            newModel.contentTwo = msg.payload;
            return newModel;
            break;
        }

    }
}

// ======================== VIEW ========================

function view(dispatch, model) {

    function table() {
        var rows = []
        for (var i = 0; i < model.items.length; i++) {
            var item = model.items[i]
            rows.push(
                h('tr', {
                    attributes: { 'data-id': item.id },
                    onclick: (e) => {
                        dispatch({
                            type: MSGS.DELETE,
                            payload: e.target.parentNode.attributes["data-id"].value
                        })
                    }
                }, [
                        h('td', [item.task]),
                    ])
            )
        }
        return h('table', [
            h('tbody', rows)
        ])
    }

    function input() {
        return h('input', {
            value: model.input,
            onkeyup: (e) => {
                if (e.key == "Enter") {
                    dispatch({
                        type: MSGS.SAVE
                    })
                } else {
                    dispatch({
                        type: MSGS.INPUT,
                        payload: e.target.value
                    })
                }
            }
        })
    }

    return h('div', [
        h('div', [model.initialData]),
        h('button', {
            onclick: () => {
                dispatch({
                    type: MSGS.GET_DATA_ONE
                })
            }
        },
            "Get data one"
        ),
        h('div', [model.contentOne]),
        h('br'),
        h('button', {
            onclick: () => {
                dispatch({
                    type: MSGS.GET_DATA_TWO
                })
            }
        },
            "Get data two"
        ),
        h('div', [model.contentTwo]),
        h('br'),
        input(),
        h('span', [model.input]),
        table()
    ]);
}

// ======================== APP ========================

function app(init, update, view, node) {
    // The model is set to the initModel
    let model = init.model;
    // The command is the initial data from an HTTP request.
    // If there is a command, execute the HTTP request.
    // // Update view at future time with the response.
    let command = init.command;
    if (command) httpEffects(dispatch, command);
    // The new view is rendered based on the initial model.
    let currentView = view(dispatch, model);
    // The new view is created and appended to the DOM.
    let rootNode = createElement(currentView);
    node.appendChild(rootNode);

    // Dispatch sends a message with a type and payload.
    function dispatch(msg) {
        // Update "catches" it, updates the current model, and returns it.
        // returns either a model or an array with model and command
        const updates = update(msg, model);
        // Array check boolean
        const isArray = updates.constructor === Array;
        // Get the model from the array. If not array, it's just the model.
        model = isArray ? updates[0] : updates;
        // Get the command form the array
        const command = isArray ? updates[1] : null;
        // Pass the dispatch function and command object for HTTP execution.
        // Update view at future time with the response.
        httpEffects(dispatch, command);
        // Return the new view either from normal types, or HTTP ones
        // The new view is rendered based on the returned new model.
        const updatedView = view(dispatch, model);
        // The DOM updates are defined.
        const patches = diff(currentView, updatedView);
        // The DOM updates are applied.
        rootNode = patch(rootNode, patches);
        // The new view becomes the old view in for future dispatches.
        currentView = updatedView;
    }
}

// This returns data at a future time. The app renders something else until then.
function httpEffects(dispatch, command) {
    if (command === null) {
        return;
    }
    // Get the request object from the command.
    let request = command.request;
    // Fetch, and dispatch a success or fail message.
    fetch(request.url, request.headers, request.body)
        .then(res => res.json())
        .then(result => {
            // Dispatch the returned message defined in the command.
            dispatch(command.successMsg(result));
        })
        .catch(error => {
            // Dispatch the returned message defined in the command.
            dispatch(command.errorMsg(error));
        });
}

// App initializing.
const rootNode = document.getElementById('app');
app(init, update, view, rootNode);