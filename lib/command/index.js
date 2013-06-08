
var Factory = require('../util/factory'),
    factory = new Factory('command', __dirname, true);

function Command() {}
// add register, create, mix, loadAll, getCommandList, resolveCommandName to the Command object
factory.bindClassMethods(Command);

Command.prototype = {
    usage: function () {
        console.error("the developer has not provided a usage for the " + this.type() + " command");
    },
    run: function (args, callback) {
        return callback(new Error("run: must be overridden for the " + this.type() + " command"));
    }
};

module.exports = Command;

