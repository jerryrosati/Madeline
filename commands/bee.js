const fs = require('fs');

module.exports = {
    name: 'bee',
    description: 'Tell me a story, Madeline',
    args: false,
    execute(message, args) {
        const readScript = async textList => {
            for (const token of textList) {
                console.log(token);
                message.channel.send(token);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        fs.readFile('./resources/entire_bee_movie_script.txt', 'utf8', (err, data) => {
            if (err) throw err;
            const textList = data.split(/ +/);
            readScript(textList);
        });
    },
};