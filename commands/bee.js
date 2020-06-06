const fs = require('fs');

module.exports = {
    name: 'bee',
    description: 'Tell me a story, Madeline',
    args: false,

    execute(message, args) {
        // Send the bee movie script one word at a time.
        const readScript = async textList => {
            for (const token of textList) {
                console.log(token);
                message.channel.send(token);

                // Pause for 2 seconds between each message.
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        // Read in the script.
        fs.readFile('./resources/entire_bee_movie_script.txt', 'utf8', (err, data) => {
            if (err) {
                message.reply("The bee movie script is lost right now, why don't you ask me later.");
                return;
            }

            const textList = data.split(/ +/);
            readScript(textList);
        });
    },
};