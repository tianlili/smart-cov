/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var path = require('path'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    fs = require('fs'),
    filesFor = require('../util/file-matcher').filesFor,
    nopt = require('nopt'),
    Instrumenter = require('../../instrumenter'),
    inputError = require('../util/input-error'),
    formatOption = require('../util/help-formatter').formatOption,
    util = require('util'),
    Command = require('./index'),
    NAME = require('../util/meta').NAME,
//    Collector = require('../collector'),
    verbose;

//function BaselineCollector(instrumenter) {
//    this.instrumenter = instrumenter;
//    this.collector = new Collector();
//    this.instrument = instrumenter.instrument.bind(this.instrumenter);
//
//    var origInstrumentSync = instrumenter.instrumentSync;
//    this.instrumentSync = function () {
//        var args = Array.prototype.slice.call(arguments),
//            ret = origInstrumentSync.apply(this.instrumenter, args),
//            baseline = this.instrumenter.lastFileCoverage(),
//            coverage = {};
//        coverage[baseline.path] = baseline;
//        this.collector.add(coverage);
//        return ret;
//    };
//    //monkey patch the instrumenter to call our version instead
//    instrumenter.instrumentSync = this.instrumentSync.bind(this);
//}
//
//BaselineCollector.prototype = {
//    getCoverage: function () {
//        return this.collector.getFinalCoverage();
//    }
//};


function processFiles(instrumenter, inputDir, outputDir, relativeNames) {
    var processor = function (name, callback) {
            var inputFile = path.resolve(inputDir, name),
                outputFile = path.resolve(outputDir, name),
                oDir = path.dirname(outputFile);

            mkdirp.sync(oDir);
            fs.readFile(inputFile, 'utf8', function (err, data) {
                if (err) { return callback(err, name); }
                instrumenter.instrument(data, name, function (iErr, instrumented) {
                    if (iErr) { return callback(iErr, name); }
                    fs.writeFile(outputFile, instrumented, 'utf8', function (err) {
                        return callback(err, name);
                    });
                });
            });
        },
        q = async.queue(processor, 10),
        errors = [],
        count = 0,
        startTime = new Date().getTime();

    q.push(relativeNames, function (err, name) {
        var inputFile, outputFile;
        if (err) {
            errors.push({ file: name, error: err.message || err.toString() });
            inputFile = path.resolve(inputDir, name);
            outputFile = path.resolve(outputDir, name);
            fs.writeFileSync(outputFile, fs.readFileSync(inputFile));
        }
        if (verbose) {
            console.log('Processed: ' + name);
        } else {
            if (count % 100 === 0) { process.stdout.write('.'); }
        }
        count += 1;
    });

    q.drain = function () {
        var endTime = new Date().getTime();
        console.log('\nProcessed [' + count + '] files in ' + Math.floor((endTime - startTime) / 1000) + ' secs');
        if (errors.length > 0) {
            console.log('The following ' + errors.length + ' file(s) had errors and were copied as-is');
            console.log(errors);
        }
    };
}

var blacklist = ['.svn', '.git'];
function copy(origin, target) {
	// exit if origin dir dosen't exist
	if (!fs.existsSync(origin)) {
		console.log(origin + 'is not exist......');
	}
	// make dir id target dir dosen't exist
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target, 0755)
	}
	// read files under the origin dir
	fs.readdir(origin, function(err, datalist) {
		if (err)
			return;
		for ( var i = 0; i < datalist.length; i++) {
			// validate
			var isValid = true;
			for ( var j = 0; j < blacklist.length; j++) {
				// blacklist
				if (datalist[i] == blacklist[j]) {
					isValid = false;
					break;
				}
			}
			// validate success
			if (isValid) {
				var oCurrent = origin + '/' + datalist[i];
				var tCurrent = target + '/' + datalist[i];

				// write files
				if (fs.statSync(oCurrent).isFile()) {
					fs.writeFileSync(tCurrent, fs.readFileSync(oCurrent, ''),
							'');
				}
				// traverse dir
				else if (fs.statSync(oCurrent).isDirectory()) {
					copy(oCurrent, tCurrent);
				}
			}
		}
	});
}

function InstrumentCommand() {
    Command.call(this);
}

InstrumentCommand.TYPE = 'instrument';
util.inherits(InstrumentCommand, Command);

Command.mix(InstrumentCommand, {
//    synopsis: function synopsis() {
//        return "instruments a file or a directory tree and writes the instrumented code to the desired output location";
//    },

    usage: function () {
        console.error('\nUsage: ' + NAME + ' instrument <file-or-directory> <options>\n\nOptions are:\n\n' +
            [
                formatOption('--output <file-or-dir> [-o <file-or-dir>]', 'The output file or directory. This is required when the input is a directory, ' +
                    'defaults to standard output when input is a file'),
                formatOption('--exclude <exclude-pattern> [-x <exclude-pattern>]', 'One or more fileset patterns (e.g. "**/vendor/**" to ignore all files ' +
                    'under a vendor directory). Also see the --default-excludes option'),
//                formatOption('--variable <global-coverage-variable-name>', 'change the variable name of the global coverage variable from the ' +
//                    'default value of `__coverage__` to something else'),
//                formatOption('--embed-source', 'embed source code into the coverage object, defaults to false'),
                formatOption('--compact [-c]', 'Produce [non]compact output, defaults to noncompact'),
                formatOption('--verbose [-v]', 'Show the instrumenting process, like "Processed a.js", defaults to false'),
//                formatOption('--save-baseline', 'produce a baseline coverage.json file out of all files instrumented'),
//                formatOption('--baseline-file <file>', 'filename of baseline file, defaults to coverage/coverage-baseline.json')
                formatOption('--nocontroller [-n]', 'Do not procude controller files(smart-cov.html, smart-cov.js etc.)')
            ].join('\n\n') + '\n');
    },

    run: function (args, callback) {

        var config = {
                output: path,
                exclude: [Array, String],
//                variable: String,
                compact: Boolean,
                verbose: Boolean,
//                'save-baseline': Boolean,
//                'baseline-file': path,
//                'embed-source': Boolean
                nocontroller: Boolean
            },
            opts = nopt(config, {}, args, 0),
            cmdArgs = opts.argv.remain,
            file,
            stats,
            stream,
            instrumenter = new Instrumenter();
//            needBaseline = opts['save-baseline'],
//            baselineFile = opts['baseline-file'] || path.resolve(process.cwd(), 'coverage', 'coverage-baseline.json');

        verbose = opts.verbose;
        if (cmdArgs.length !== 1) {
            return callback(inputError.create('Need exactly one filename/ dirname argument for the instrument command!'));
        }

        instrumenter = new Instrumenter({
//            coverageVariable: opts.variable,
            embedSource: true,
            noAutoWrap: true,
            noCompact: !opts.compact
        });

//        if (needBaseline) {
//            mkdirp.sync(path.dirname(baselineFile));
//            instrumenter = new BaselineCollector(instrumenter);
//            process.on('exit', function () {
//                util.puts('Saving baseline coverage at: ' + baselineFile);
//                fs.writeFileSync(baselineFile, JSON.stringify(instrumenter.getCoverage()), 'utf8');
//            });
//        }
        
        //instrument
        file = path.resolve(cmdArgs[0]);
        try {
        	stats = fs.statSync(file);
            if (stats.isDirectory()) {
                if (!opts.output) { return callback(inputError.create('Need an output directory [-o <dir>] when input is a directory!')); }
                if (opts.output === file) { return callback(inputError.create('Cannot instrument into the same directory/ file as input!')); }
                mkdirp.sync(opts.output);
                filesFor({
                    root: file,
                    includes: ['**/*.js'],
                    excludes: opts.exclude || ['**/node_modules/**'],
                    relative: true
                }, function (err, files) {
                    if (err) { return callback(err); }
                    processFiles(instrumenter, file, opts.output, files);
                });
            } else {
                if (opts.output) {
                    stream = fs.createWriteStream(opts.output);
                } else {
                    stream = process.stdout;
                }
                stream.write(instrumenter.instrumentSync(fs.readFileSync(file, 'utf8'), file));
                if (stream !== process.stdout) {
                    stream.end();
                }
            }
        } catch (ex) {
        	return callback(inputError.create(ex.message));
        }
        
        //copy controller files
        try {
        	if(opts.output && !opts.nocontroller){
        		copy(path.resolve(__dirname, '../controller'), path.resolve(opts.output, 'smart-cov'));
        		copy(path.resolve(__dirname, '../../bootstrap'), path.resolve(opts.output, 'smart-cov/bootstrap'));
        		copy(path.resolve(__dirname, '../../controller-resources'), path.resolve(opts.output, 'smart-cov/controller-resources'));
        		console.log('\nController files are generated\n');
        	}
        } catch (ex) {
        	return callback(inputError.create(ex.message));
        }
    }
});

module.exports = InstrumentCommand;

