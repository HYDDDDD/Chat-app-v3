const moment = require("moment");

function formatMessage(id, text) {
  return {
    id,
    text,
    timebot: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;
