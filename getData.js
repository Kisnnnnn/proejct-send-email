let AV = require('leanengine');
let Promise = require('bluebird');

module.exports = {
  getAllUsers() {
    return new AV.Query('_User').find().then((reponse) => {
      return reponse.map(item => Object.assign({}, item._serverData, {
        id: item.id
      }))
    });
  },
  getCurrWeekReport() {
    console.log('projectList');
    const porjectAPI = new AV.Query('projectList');

    porjectAPI.equalTo('isArchive', false);

    return porjectAPI.find().then((reponse) => {
      return reponse.map(item => Object.assign({}, item._serverData, {
        id: item.id
      }))
    });
  },
  getUnSubmitUsers() {
    return Promise.all([this.getAllUsers(), this.getCurrWeekReport()]).then(
      results => {
        let users = results[0];
        let reports = results[1];
        let submitUser = {};
        let unsubmitUsers = [];
        reports.forEach(item => {
          submitUser[item.attributes.userId] = true;
        });

        users.forEach(user => {
          if (
            !submitUser[user.id] &&
            !user.attributes.noReport &&
            user.attributes.email
          ) {
            unsubmitUsers.push({
              name: user.username,
              email: user.attributes.email
            });
          }
        });

        return unsubmitUsers;
      }
    );
  }
};