#!/usr/bin/env node

var Command = require('./command'),
    inputError = require('./util/input-error'),
    util = require('util'),
    NAME = require('./util/meta').NAME,
    exit = process.exit; //hold a reference to original process.exit so that we are not affected even when a test changes it

Command.loadAll();

function findCommandPosition(args) {
    var i;

    for (i = 0; i < args.length; i += 1) {
        if (args[i].charAt(0) !== '-') {
            return i;
        }
    }

    return -1;
}

function errHandler (ex) {
    if (!ex) { return; }
    if (!ex.inputError) {
        throw ex; // turn it into an uncaught exception
    } else {
        //don't print nasty traces but still exit(1)
        util.error(ex.message);
        util.error('Try "' + NAME + ' help" for usage');
        exit(1);
    }
}

function runCommand(args, callback) {
    var pos = findCommandPosition(args),
        command,
        commandArgs,
        commandObject;

    if (pos < 0) {
        return callback(inputError.create('Need a command to run'));
    }

    commandArgs = args.slice(0, pos);
    command = args[pos];
    commandArgs.push.apply(commandArgs, args.slice(pos + 1));

    try {
        commandObject = Command.create(command);
    } catch (ex) {
        errHandler(inputError.create(ex.message));
    }
    commandObject.run(commandArgs, errHandler, __dirname);
}

function runToCompletion(args) {
    runCommand(args, errHandler);
}

if (require.main === module) {
    var args = Array.prototype.slice.call(process.argv, 2);
    runToCompletion(args);
}

module.exports = {
    runToCompletion: runToCompletion
};

