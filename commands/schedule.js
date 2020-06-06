const schedule  = require('node-schedule');
const utils = require('./../utils.js');

module.exports = {
    name: 'schedule',
    description: 'Schedule a thing.',
    args: true,
    usage: `<date (in format MM/DD/YYYY)> <time (HH:mm)>`,

    execute(message, args) {
        if (args.length < 2) {
            message.reply(`Wrong number of arguments; the proper usage is \`!schedule ${this.usage}\``);
            return;
        }

        const dateArray = args[0].split(/[.-\/]/);
        console.log(dateArray);

        const timeArray = args[1].split(/[:]/);
        console.log(timeArray);

        // Subtract 1 from the month because months are zero-indexed in JS (0 = January, 11 = December).
        let date = new Date(dateArray[2], dateArray[0] - 1, dateArray[1], timeArray[0], timeArray[1], 0);
        message.channel.send(`Scheduling event for ${date.toString()}`);

        let job = schedule.scheduleJob(date, () => {
            console.log(date.toString());
            message.channel.send("<@377193147203059713> This is a reminder");
        })
    },
};
