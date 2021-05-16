/**
 * Pull command.
 *
 * Performs a git pull.
 */
const config = require('./../../config.json')
const { exec } = require('child_process')

module.exports = {
    name: 'pull',
    description: 'Pulls the newest code from the git branch',
    usage: '',
    args: false,

    execute(message, args) {
        if (message.author.id !== config.dev_id) {
            message.reply('Not permitted to run git pull :(')
            return
        }

        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`)
            }

            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
            message.reply('Performed git pull')
        })
    }
}
