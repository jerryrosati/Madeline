/**
 * Command to stop the output of the !bee command. Currently stops all ongoing !bee commands.
 */
const utils = require('../utils.js')

module.exports = {
    name: 'safe',
    description: 'Stops the !bee command.',
    args: true,
    argsOptional: true,

    execute(message, args) {
        let identifier
        if (args.length === 0) {
            identifier = 'all'
        } else {
            identifier = args[0]
        }

        utils.emitBeeIdentifier(identifier)
    }
}
