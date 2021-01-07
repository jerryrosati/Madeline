/**
 * Command to stop the output of the !bee command.
 *
 * Usage: !safe [identifier]
 */
const utils = require('../utils.js')

module.exports = {
    name: 'safe',
    description: 'Stops the !bee command',
    usage: '[identifier]',
    args: true,
    argsOptional: true,

    execute(message, args) {
        let identifier
        if (args.length === 0) {
            identifier = 'all'
        } else {
            identifier = args[0]
        }

        // Send the identifier to all observers.
        utils.emitBeeIdentifier(identifier)
    }
}
