let AV = require('leanengine');
let api = require('./getData.js');

const http = require('http');
const querystring = require('querystring');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function (request) {
  return 'Hello world!';
});

function writeLog(info) {
  let date = new Date();
  let Log = AV.Object.extend('EmailLogs');
  let log = new Log();
  log.set('date', date);
  log.set('info', info);
  log.save().then(res => {
    console.log('邮件发送日志已记录！');
  });
}
// 发起一个post请求
function post(data) {
  const options = {
    hostname: 'fe.epoint.com.cn',
    port: 8080,
    path: '/mobileweeklyreport/mail/sendmail.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let info = '';
    res.on('data', chunk => {
      info += chunk;
    });
    res.on('end', () => {
      writeLog(info);
    });
  });

  req.on('error', e => {
    console.error(`problem with request: ${e.message}`);
    console.error(`problem with request: ${JSON.stringify(e)}`);
  });

  // write data to request body
  req.write(data);
  req.end();
}

// 周日提醒
AV.Cloud.define('sendEmailwarning', function (request) {
  console.log('准备处理发送邮件');
  let d = new Date();
  return api.getAllUsers().then(async users => {
    let projectList = await api.getCurrWeekReport();

    let userData = users.filter(({
      teamLeader
    }) => teamLeader != 4);

    userData = userData.map(({
      displayName
    }) => {
      return {
        name: displayName,
        value: 0,
        project: ''
      }
    });

    console.log('周日：准备给组长发送邮件：');

    projectList.forEach(item => {
      let data = userData.find(useritem => useritem.name == item.developer);
      data.value += Number(item.weekTime)
      data.project += item.projectName + '-' + item.weekTime + 'H,'
    });

    api.saveWeekTimeReport(userData, d).then(() => {
      console.log('发送处理完成, 耗时' + (+new Date() - d) + 'ms');
      // 
      console.log('开清空况数据');
      api.emptyWeekReport()
    })
  });
});

// 接受客户端保存用户信息的请求
AV.Cloud.define('savePersonData', function (request) {
  let id = request.params.id;
  let data = request.params.data;
  let keys = Object.keys(data);
  let person = AV.Object.createWithoutData('_User', id);
  keys.forEach(k => {
    person.set(k, data[k]);
  });
  return person.save();
});