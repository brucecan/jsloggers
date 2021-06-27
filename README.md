# jsloggers
A javascript logging library

输出示例：

![image](https://user-images.githubusercontent.com/76823086/123559147-37f05500-d768-11eb-9621-d48817567737.png)

用法示例：
```
const { createLog, CONST: { FCRED, FCGREEN, FCYELLOW, FCBLUE, FCNORMAL, NEWLINE } } 
    = require(`${__dirname}/logger.js`);

const log = createLog({
    writer: process.stdout.write.bind(process.stdout),
    timestampFormat: "YYYY-MM-DD HH:mm:ss",
  }, {
    logFilePath: `${__dirname}/log/app.log`,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  });

log.info("hello world");
log.fatal("some error happens");
log.fileln.warn("only for file");
log.console.newLine();
log.info("app ends");
```
