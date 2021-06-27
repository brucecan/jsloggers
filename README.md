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
支持特性（部分特性基于simple-node-logger的已有功能）：
1.支持日志分级管理(level，如trace, error, warn, debug, info等等)。simple-node-logger原有特性。<br/>
2.一条log语句同时输出到console和file（console and file），而不需要写两条语句来达到目的，后者很容易漏掉日志输出语句。另外，jsloggers也支持单方向输出（console or file）。<br/>
3.能分别定义输出到console和file的信息格式（如时间戳格式等），以满足console和file对日志的不同格式要求（如console日志有屏幕宽度限制，文件日志不带颜色属性等）。simple-node-logger原有特性。
4.能向console输出带颜色和格式控制等特殊escape字符串的内容，而同一份内容输出到file时要能过滤掉这些escape字符串，不至于打乱file日志。
5.能够指定日志文件名称，能支持按时间rolling文件名。simple-node-logger原有特性。
6.console和file两个方向都支持不换行和换行日志，都能输出带level信息的（如[INFO]）和不带level信息的空行。
7.console日志支持resetLine功能，即在控制台的同一行上不断刷新信息，而不增加新行。
8.支持创建、管理和获取多个不同的日志，比如说针对app全局设定一个global日志，针对网络管理设定一个network_log日志，针对文件管理设定一个file_log，针对业务逻辑设定一个business_log，这些log都可以输出到console，另外还可以分别输出到不同文件中，日志格式也可以单独定义。在node.js main app module中执行的时候可以使用global logger，而进入各分项module的时候可以使用各自的分项logger，当然各模块也可以交叉获取和使用所有这些logger。在整个app的生命周期中，这些logger都需要遵循一次创建(Create)，无限次使用(Get)的原则，而不会被重复创建。
9.支持同步和异步日志。同步日志直观而迅速，但过多的同步日志操作会阻塞和影响整个应用的性能。异步日志没有那么直观，但将日志操作放入task queue或micro task queue，使得整个应用的执行更加顺畅，性能和整体吞吐率都能得到提升。jsloggers继承了simple-node-logger的异步日志功能。由于日志是被process.nextTick放入microtask队列中，因此具备相对较高优先级。在此基础上要实现同步日志也不难，只需要扩充flag对象中的标志位，并同时在log对象中增加一些新的accessor properties，如log.sconsole, logsconsoleln, log.sfile, log.sfileln, log.swrite, log.swriteln等等，前缀s表示同步(sync)输出，在这些s开头的accessor property的函数代码中准备好flag对象的相应标志位，然后再略微修改一下log.log函数代码，在log.log中如果看到相应的同步日志标志位，则直接轮询appenders.forEach实施日志输出，而不用放到process.nextTick中轮询和输出。由于异步日志更实用，jsloggers中目前暂未实现这些同步日志功能。
10.可控结束。在整个app结束时，能够有序关闭各文件日志stream，从而将buffer的日志信息都flush到相应的文件中，以免丢失信息。这部分逻辑并未包含在jsworkers中，应用程序通过轮询一遍appender，获取每个log stream，并逐个调用stream.end即可。
11.i18n国际化支持。完善中，目前还不具备i18n日志能力。
