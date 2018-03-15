


class Messages {
    constructor() {
        this.messages = [];
        this.currentId = 0;
    }

    async find(params) {
        // return the list of all Messages
        return this.messages;
    }

    async get(id, params) {
        // find the message by id
        const message = this.messages.find(message => message.id === parseInt(id, 10));

        // Throw an error if it wasn't found
        if(!message) {
            throw new Error('Message with id ${id} not found');
        }

        // Otherwise return the message
        return message;
    }

    async create(data, params) {
        // Create a new object with the original data and an id
        // taken from the incrementing currentId counter
        const message = Object.assign({
            id: ++this.currentId
        }, data);

        this.messages.push(message);

        return message;
    }

    async patch(id, data, params) {
        // Get the existing message. Will throw an error if not found
        const message = await this.get(id);

        // Merge the existing message with the new data
        // and return the result
        return Object.assign(message, data);
    }

    async remove(id, params) {
        // Get the message by id (will throw an error if not found)
        const message = await this.get(id);
        // Find the index of the message in our message array
        const index = this.messages.indexOf(message);

        // Remove the found message from our array
        this.messages.splice(index, 1);

        // Return the removed message
        return message;
    }
}

const app = feathers();

app.use('messages', new Messages());

async function processMessages() {
    app.service('messages').on('created', message => {
        console.log('Created a new message', message);
    });

    app.service('messages').on('removed', message => {
        console.log('Deleted message', message);
    });

    await app.service('messages').create({
        text: 'First message'
    });

    const lastMessage = await app.service('messages').create({
        text: 'Second message'
    });

    await app.service('messages').remove(lastMessage.id);

    const messageList = await app.service('messages').find();

    console.log('Available messages', messageList);
}

processMessages();
