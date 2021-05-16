/**
 * Prints out the bee movie script one word at a time.
 *
 * Usage: !bee [identifier]
 */
const fs = require('fs')
const utils = require('./../../utils')
const config = require('./../../config.json')
const { Observable, zip, interval } = require('rxjs')
const { take, map, filter } = require('rxjs/operators')
const { Command } = require('discord.js-commando')

module.exports = class BeeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bee',
            group: 'misc',
            memberName: 'bee',
            description: 'Tell me a story, Madeline.',
            args: [
                {
                    key: 'identifier',
                    prompt: 'What is the identifier for your bee movie script instance?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    run(message, { identifier }) {
        let observable
        let subscription

        // Read in the script.
        fs.readFile(config.bee_movie_script_path, 'utf8', (err, data) => {
            if (err) {
                message.reply('The bee movie script is lost right now, why don\'t you ask me later.')
                return
            }

            const textList = data.split(/ +/)
            let i = 0
            observable = new Observable(function subscribe(subscriber) {
                // Emit a word from the script every 2 seconds.
                const intervalId = setInterval(() => {
                    subscriber.next(textList[i++])
                }, 2000)

                // Clear the interval when unsubscribing.
                return function unsubscribe() {
                    clearInterval(intervalId)
                }
            })

            // Send the script one word at a time.
            // Zip to keep time interval consistent.
            subscription = observable
                .pipe(source => zip(source, interval(2000)),
                    map(([word, number]) => word),
                    take(textList.length))
                .subscribe(word => message.channel.send(word), error => console.log(error))
        })

        // Listen for identifiers that signal the instance of !bee to stop.
        // The command will stop if the identifier is correct, or the identifier is "all".
        utils.getBeeIdentifierSubject()
            .pipe(filter(id => {
                console.log(`!safe identifier received = ${id}`)
                console.log(`!bee instance identifier = ${identifier}`)
                return id === identifier || id === 'all'
            }))
            .subscribe(word => subscription.unsubscribe(), error => console.log(error))
    }
}
