const make2 = (str) => {
  str = str.toString();
  return str.length == 1 ? "0".concat(str) : str;
};
const toUnix = (strDate) => Date.parse(strDate) / 1000;
const fromUnix = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = make2(a.getMonth() + 1);
  var date = make2(a.getDate());
  var hour = make2(a.getHours());
  var min = make2(a.getMinutes());
  var sec = make2(a.getSeconds());
  var time =
    month + "/" + date + "/" + year + " " + hour + ":" + min + ":" + sec;
  return time;
};

module.exports = {make2, toUnix, fromUnix};