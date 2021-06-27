const readline = require('readline');
const logger = require("simple-node-logger"),
  consoleOpts = {
    writer: process.stdout.write.bind(process.stdout),
    timestampFormat: "YYYY-MM-DD HH:mm:ss",
  },
  fileOpts = {
    logFilePath: `${__dirname}/log/log.data`,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  };

// console character color
const FCRED = "\x1b[31m";
const FCGREEN = "\x1b[32m";
const FCYELLOW = "\x1b[33m";
const FCBLUE = "\x1b[34m";
const FCNORMAL = "\x1b[0m";

const NEWLINE = "\r\n";

let logs = {};

function createLog(consoleOpts = consoleOpts, fileOpts = fileOpts, level = "all", name = "global") {
  if(logs[name]) return logs[name];
  // create a log manager
  const manager = new logger();
  let consoleAppender = manager.createConsoleAppender(consoleOpts);
  let fileAppender = manager.createFileAppender(fileOpts);

  consoleAppender.formatter = function(entry) {
    let flag = undefined;
    if(entry.msg[0] !== null && typeof entry.msg[0] === "object"){
      flag = entry.msg.shift();
    }

    const fields = this.formatEntry( entry );
    if(flag)
      entry.msg.unshift(flag);

    // remove the timestamp field for console log
    //fields.shift(1);

    if(flag && flag.empty)
      fields.length = 0;

    if(!flag || (flag.console && flag.consoleln))
      fields.push(NEWLINE);
  
    return fields.join( this.separator );
  };
  consoleAppender.formatEntry = function (entry, thisArg) {
    const apdr = thisArg || this;

    const fields = [];

    if (entry.domain) {
      fields.push(entry.domain);
    }

    fields.push(apdr.formatTimestamp(entry.ts));
    // enclose the level with a bracket,like [INFO] xxxx
    fields.push("[" + apdr.formatLevel(entry.level) + "]");

    if (entry.category) {
      fields.push(entry.category);
    }

    fields.push(apdr.formatMessage(entry.msg));

    return fields;
  };

  // bracket notation syntax to use a variable is a feature of ES6
  const mapObj = {
    [FCRED]: "",
    [FCGREEN]: "",
    [FCYELLOW]: "",
    [FCBLUE]: "",
    [FCNORMAL]: "",
  };

  /*
  str = str.replace(/xxx|yyy|zzz/gi, function (matched) {
	  return mapObj[matched];
  });
  */
  function escapeRegExp(stringToGoIntoTheRegex) {
    return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  function replaceAll(string, mapObj, caseSensitive = true) {
    if(typeof string !== "string")
      return string;

    let flag = "gi";
    if (caseSensitive) flag = "g";
    var regExp = new RegExp(Object.keys(mapObj).map((item) => escapeRegExp(item)).join("|"), flag);

    return string.replace(regExp, function (matched) {
      if (caseSensitive) return mapObj[matched];
      else return mapObj[matched.toLowerCase()];
    });
  }

  fileAppender.formatter = function (entry) {
    let flag = undefined;
    if(entry.msg[0] !== null && typeof entry.msg[0] === "object"){
      flag = entry.msg.shift();
    }

    const fields = this.formatEntry(entry);
    if(flag)
      entry.msg.unshift(flag);
  
    if(flag && flag.empty)
      fields.length = 0;

    if(!flag || (flag.file && flag.fileln))
      fields.push(NEWLINE);

    return fields.join(this.separator);
  };

  fileAppender.formatEntry = function (entry, thisArg) {
    const apdr = thisArg || this;

    const fields = [];

    if (entry.domain) {
      fields.push(entry.domain);
    }

    fields.push(apdr.formatTimestamp(entry.ts));
    // enclose the level with a bracket,like [INFO] xxxx
    fields.push("[" + apdr.formatLevel(entry.level) + "]");

    if (entry.category) {
      fields.push(entry.category);
    }

    if (Array.isArray(entry.msg))
      entry.msg = entry.msg.map((item) => replaceAll(item, mapObj));
    else entry.msg = replaceAll(entry.msg, mapObj);

    fields.push(apdr.formatMessage(entry.msg));
    return fields;
  };

  let log = manager.createLogger();
  log.setLevel(level); 

  log.orig = {};
  logger.Logger.STANDARD_LEVELS.forEach(item => { log.orig[item] = log[item]; });
  logger.Logger.STANDARD_LEVELS.forEach(item => {
    log[item] = function(){
      let paras = [].slice.call(arguments);
      paras.unshift({console: true, file: true, consoleln: true, fileln: true});
      log.orig[item].apply(log, paras);
    }
  });

  log.log = function defaultLog(level, msg) {
    const entry = this.createEntry(level, msg);
    let appenders = this.getAppenders();

    let flag = undefined;
    if(entry.msg[0] !== null && typeof entry.msg[0] === "object"){
      flag = entry.msg[0];
    }

    process.nextTick(function () {
      // write the message to the appenders...
      appenders.forEach(function (appender) {
        if(!flag)
      	  appender.write(entry);
        else if (flag.console && appender instanceof logger.appenders.ConsoleAppender)
      	  appender.write(entry);
        else if (flag.file && appender instanceof logger.appenders.FileAppender)
      	  appender.write(entry);
      });

      /*
      if ((level === "error" && typeof errorEventName === "string") ||
        typeof errorEventName === String) {
        process.emit(errorEventName, entry);
      }*/
    });

    return entry;
  }

  Object.defineProperties(log, {
    console: {
      get: function () {
        let logWrapper = {
          resetLine: function(){
            process.nextTick(function () {
              readline.clearLine(process.stdout);
              readline.cursorTo(process.stdout, 0);
            });
            return logWrapper;
          },
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: true, file: false, consoleln: true, fileln: false, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: true, file: false, consoleln: false, fileln: false});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    },
    consoleln: {
      get: function () {
        let logWrapper = {
          resetLine: function(){
            process.nextTick(function () {
              readline.clearLine(process.stdout);
              readline.cursorTo(process.stdout, 0);
            });
            return logWrapper;
          },
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: true, file: false, consoleln: true, fileln: false, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: true, file: false, consoleln: true, fileln: false});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    },
    file: {
      get: function () {
        let logWrapper = {
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: false, file: true, consoleln: false, fileln: true, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: false, file: true, consoleln: false, fileln: false});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    },
    fileln: {
      get: function () {
        let logWrapper = {
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: false, file: true, consoleln: false, fileln: true, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: false, file: true, consoleln: false, fileln: true});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    },
    write: {
      get: function () {
        let logWrapper = {
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: true, file: true, consoleln: true, fileln: true, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: true, file: true, consoleln: false, fileln: false});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    },
    writeln: {
      get: function () {
        let logWrapper = {
          newLine: function(){
            let paras = [].slice.call(arguments);
            paras.unshift({console: true, file: true, consoleln: true, fileln: true, empty: true});
            log.orig.info.apply(log, paras);
          }
        };
        logger.Logger.STANDARD_LEVELS.forEach(item => logWrapper[item] = function(){
          let paras = [].slice.call(arguments);
          paras.unshift({console: true, file: true, consoleln: true, fileln: true});
          log.orig[item].apply(log, paras);
        });
        return logWrapper;
      },
      enumerable: true,
      configurable: true
    }
  });


  log.getLogger = () => logger;
  logs[name] = log;

  return log;
}

module.exports = {
  createLog: createLog,
  CONST: {
    FCRED: FCRED,
    FCGREEN: FCGREEN,
    FCYELLOW: FCYELLOW,
    FCBLUE: FCBLUE,
    FCNORMAL: FCNORMAL,
    NEWLINE: NEWLINE
  } 
};
