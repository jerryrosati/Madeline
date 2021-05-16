/**
 * Command to stop the output of the !bee command.
 *
 * Usage: !safe [identifier]
 */
const { Command } = require('discord.js-commando')
const utils = require('./../../utils.js')

module.exports = class SafeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'safe',
            group: 'misc',
            memberName: 'safe',
            description: 'Stops a bee movie script instance.',
            args: [
                {
                    key: 'identifier',
                    prompt: 'What is the identifier of the bee movie script instance you want to stop?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    run(message, { identifier }) {
        if (!identifier) {
            identifier = 'all'
        }

        // Send the identifier to all observers.
        utils.emitBeeIdentifier(identifier)
    }
}
