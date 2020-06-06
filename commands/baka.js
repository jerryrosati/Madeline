module.exports = {
    name: 'baka',
    description: 'Lunch!',
    args: true,

    execute(message, args) {
        const users = message.mentions.users;
        const taggedUser = users.size ? users.first() : message.author;
        message.channel.send(`It's not like I wanted to make ${taggedUser} lunch or anything, baka!`);
    },
};