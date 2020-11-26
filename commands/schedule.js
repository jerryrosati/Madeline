/**
 * Schedule command. Used to schedule schedule an event for a specific date/time and
 * notify people at that time.
 *
 * Usage: !schedule date (as MM/DD/YYYY) time (as HH:mm in 24-hour time)
 * Example: !schedule 6/6/2020 16:30
 */
const schedule = require('node-schedule')
const utils = require('./../utils.js')

module.exports = {
    name: 'schedule',
    description: 'Schedule a thing.',
    usage: 'date (as MM/DD/YYYY) time (as HH:mm in 24-hour time)',
    args: true,
    argsOptional: false,

    execute(message, args) {
        if (args.length < 2) {
            utils.reportCommandUsageError(this,
                message,
                'Wrong number of arguments')
            return
        }

        const dateArray = args[0].split(/[.-/]/)
        console.log(dateArray)

        const timeArray = args[1].split(/[:]/)
        console.log(timeArray)

        // Subtract 1 from the month because months are zero-indexed in JS (0 = January, 11 = December).
        const date = new Date(dateArray[2], dateArray[0] - 1, dateArray[1], timeArray[0], timeArray[1], 0)
        message.channel.send(`Scheduling event for ${date.toString()}`)

        schedule.scheduleJob(date, () => {
            console.log(date.toString())
            message.channel.send('@377193147203059713 This is a reminder')
        })
    }
}
