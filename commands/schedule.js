const schedule  = require('node-schedule');
const utils = require('./../utils.js');

module.exports = {
    name: 'schedule',
    description: 'Schedule a thing.',
    args: true,

    execute(message, args) {
        let date = new Date(2020, 5, 6, 0, 22, 0);
        message.channel.send(`@everyone Scheduling event for ${date.toString()}`);
        utils.logError(message, "error");

        let job = schedule.scheduleJob(date, () => {
            console.log(date.toString());
            message.channel.send("This is a reminder");
        })
    },
};
