const fs = require('fs')
const { Observable } = require('rxjs')
const { take } = require('rxjs/operators')

module.exports = {
    name: 'bee',
    description: 'Tell me a story, Madeline',
    args: false,

    execute(message, args) {
        let observable
        let i = 0
        let textList

        // Read in the script.
        fs.readFile('./resources/entire_bee_movie_script.txt', 'utf8', (err, data) => {
            if (err) {
                message.reply('The bee movie script is lost right now, why don\'t you ask me later.')
                return
            }

            textList = data.split(/ +/)
            observable = new Observable(function subscribe(subscriber) {
                const intervalId = setInterval(() => {
                    subscriber.next(textList[i++])
                }, 2000)

                return function unsubscribe() {
                    clearInterval(intervalId)
                }
            })

            // Send the script one word at a time.
            observable.pipe(take(textList.length)).subscribe(word => message.channel.send(word))
        })
    }
}
