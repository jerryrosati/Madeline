const config = require('./config.json');

module.exports = {
    /**
     * Capitalizes the first letter of the given string.
     * 
     * @param {String} string 
     */
    capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },

    /**
     * Callback when errors are caught; logs the error and alerts the bot developer.
     * 
     * @param {Message} message 
     * @param {*} error 
     */
    logError(message, error) {
        message.channel.send(`<@${config.dev_id}> Madeline has encountered an error and is shutting down for now.`);
        console.log(error);
    }
}