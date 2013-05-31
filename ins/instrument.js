#!/usr/bin/env node

/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var Command = require('./command'),
    inputError = require('./util/input-error'),
    util = require('util'),
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

function errHandler (ex, commandObject) {
    if (!ex) { return; }
    if (!ex.inputError) {
        throw ex; // turn it into an uncaught exception
    } else {
        //don't print nasty traces but still exit(1)
        util.error(ex.message);
        if(commandObject)
        	commandObject.usage();
        exit(1);
    }
}

function runCommand(args, callback) {
    var pos = findCommandPosition(args),
        command,
        commandArgs,
        commandObject;
//
//    if (pos < 0) {
//        return callback(inputError.create('Need a command to run'));
//    }
//
//    commandArgs = args.slice(0, pos);
//    command = args[pos];
//    commandArgs.push.apply(commandArgs, args.slice(pos + 1));

    try {
        commandObject = Command.create("instrumentCommand");
    } catch (ex) {
        errHandler(inputError.create(ex.message));
    }
    commandObject.run(args, errHandler);
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

