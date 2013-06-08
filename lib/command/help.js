
var Command = require('./index.js'),
    util = require('util'),
    formatOption = require('../util/help-formatter').formatOption,
	meta = require('../util/meta');

function HelpCommand() {
    Command.call(this);
}

HelpCommand.TYPE = 'help';
util.inherits(HelpCommand, Command);

Command.mix(HelpCommand, {
//    synopsis: function () {
//        return "shows help";
//    },
//
//    usage: function () {
//
//        util.error('\nUsage: ' + this.toolName() + ' ' + this.type() + ' <command>\n');
//        util.error('Available commands are:\n');
//
//        var commandObj;
//        Command.getCommandList().forEach(function (cmd) {
//            commandObj = Command.create(cmd);
//            util.error(formatOption(cmd, commandObj.synopsis()));
//            util.error("\n");
//        });
//        util.error("Command names can be abbreviated as long as the abbreviation is unambiguous");
//        util.error(this.toolName() + ' version:' + VERSION);
//        util.error("\n");
//    },
    run: function (args, callback) {
    	try {
            commandObject = Command.create("instrument");
        } catch (ex) {
            errHandler(inputError.create(ex.message));
        }
        commandObject.usage();
        util.error( meta.NAME + ' version:' + meta.VERSION + '\n');
    }
});


module.exports = HelpCommand;


