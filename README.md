# jsloggers
A javascript logging library

## Output

![image](https://user-images.githubusercontent.com/76823086/123559147-37f05500-d768-11eb-9621-d48817567737.png)

## Usage
```
// if package is installed through "npm install jsloggers"
const { createLog, CONST: { FCRED, FCGREEN, FCYELLOW, FCBLUE, FCNORMAL, NEWLINE } } = require('jsloggers');

// or downloading the jsloggers.js file only
//const { createLog, CONST: { FCRED, FCGREEN, FCYELLOW, FCBLUE, FCNORMAL, NEWLINE } } 
//    = require(`${__dirname}/jsloggers.js`);

// if you want to put the log files into directory ${__dirname}/log, please make sure 
// ${__dirname}/log exists first. jsloggers is not responsible for creating any dirs.
const log = createLog({
    writer: process.stdout.write.bind(process.stdout),
    timestampFormat: "YYYY-MM-DD HH:mm:ss",
  }, {
    logFilePath: `${__dirname}/log/app.log`,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  });

log.error("1.this error log is for both console (+newline) and file (+newline)");
log.debug("2.this debug log is for both console (+newline) and file (+newline)");

// By default, log.sync === false, and any logging operations will be put into microtasks 
// by process.nextTick() and be scheduled to execute in next tick.
// Here, enabling log.sync will switch over from async logging to sync logging. It means
// you will see the logging outputs immediately once any logging function is called after
// this time point.
// In production environment, async logging is sugggested because of higher throughput and
// performance.
// log.sync is an accessor property, and there is another method called log.setSync does the 
// same. Either one works.
log.sync = true;

log.console.fatal("3.this fatal log is for console only (no newline)");
log.consoleln.warn("4.this warn log is for console only (+newline)");
log.file.debug("5.this debug log is for file only (no newline)");
log.file.warn("6.this warn log is for file only (no newline)");
log.fileln.fatal("7.this fatal log is for file only (+newline)");
log.fileln.trace("8.this trace log is for file only (+newline)");

// enabling async logging again
log.sync = false;

log.write.info("9.this info log is for both console (no newline) and file (no newline)");
log.write.debug("10.this debug log is for both console (no newline) and file (no newline)");
log.writeln.warn("11.this warn log is for both console (+newline) and file (+newline)");
log.console.resetLine().info("12.reset console and output log (without adding a new line)");

// add an empty new line in file log only
log.file.newLine();

// reset console and output color-font logs
log.console.resetLine().info(FCRED + "RED text " + FCNORMAL + FCYELLOW + "YELLOW text" + FCNORMAL);

// for both console and file,
// in this case, the FONT COLOR escape characters only poses an effect on console, 
// and those escape characters will be removed automatically before being writing to file
log.info(FCRED + "RED text " + FCNORMAL + FCYELLOW + "YELLOW text" + FCNORMAL);

// close all log-file streams before app ends
(async () => {
  await log.closeFile();
  console.log("App ends.");
})();
```
## Notes
### Configuration for stdout when debugging in IDE environment
You might see nothing (no console output) when debugging jsloggers in an IDE environment like Visual Studio Code. The following configuration (in launch.json) works like a charm in VSCode:

```
"console": "integratedTerminal"
```
Other IDEs may have similar options.

### Align output fields using String.prototype.padEnd() and String.prototype.padStart()
Arranging left or right aligned fields is a good way to produce visually-friendly outputs. String.prototype.padEnd() and String.prototype.padStart() satisfy this type of needs.

```
log.info(field1.padEnd(30) + field2.padEnd(28) + field3.padEnd(36));
log.info(field1.padStart(30) + field2.padStart(28) + field3.padStart(36));
```

### Flexibility
jsloggers provides a bunch of logging and configuration functions to cope with different situations. 

```
log.sync = true, log.sync = false
enabling sync logging or enabling async logging 
```
```
log.info, log.warn, log.fatal ...... 
produce logs ending with a new-line character, for both console and file.
```
```
log.console.info, log.console.warn, log.console.fatal ...... 
produce logs without ending new-line character, for console only.
```
```
log.consoleln.info, log.consoleln.warn, log.consoleln.fatal ...... 
produce logs ending with a new-line character, for console only.
```
```
log.file.info, log.file.warn, log.file.fatal ...... 
produce logs without ending new-line character, for file only.
```
```
log.fileln.info, log.fileln.warn, log.fileln.fatal ...... 
produce logs ending with a new-line character, for file only.
```
```
log.write.info, log.write.warn, log.write.fatal ...... 
produce logs without ending new-line character, for both console and file.
```
```
log.writeln.info(=log.info), log.writeln.warn(=log.warn), log.writeln.fatal(=log.fatal) ...... 
produce logs ending with a new-line character, for both console and file.

log.write.info(something + "\n")=log.writeln.info(something) ......
produce logs ending with a new-line character, for both console and file.
```
```
log.write.newLine() = log.writeln.newLine()
produce an empty line, for both console and file
```
```
log.info() without providing any parameters
produce an empty line, with leading level information goes like this: [INFO]
```
```
log.closeFile
close all log-file streams before app ends
```
## Acknowledgements
- [simple-node-logger](https://github.com/darrylwest/simple-node-logger)
