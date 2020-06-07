const config = require('./config.json');

module.exports = {
    /**
     * Capitalizes the first letter of the given string.
     * 
     * @param {String} string A string to capitalize.
     */
    capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },

    /**
     * Callback when errors are caught; logs the error and alerts the bot developer.
     * 
     * @param {Message} message The message containing the command.
     * @param {*} error The error that occurred.
     */
    logError(message, error) {
        message.channel.send(`<@${config.dev_id}> Madeline has encountered an error and is shutting down for now.`);
        console.log(error);
    },

    /**
     * Report command usage errors.
     * 
     * @param {*} command The command being executed.
     * @param {Message} message The message containing the command.
     * @param {String} errorDescription The reply to send back to the user who initiated the command.
     * 
     */
    reportCommandUsageError(command, message, errorDescription) {
        let reply = `${errorDescription}, ${message.author}`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }
}