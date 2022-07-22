const socket_io = require("socket.io");
const io = socket_io();
const socketService = {};
socketService.io = io;

io.on("connection", function () {
    console.log("A socket user connected");
});

socketService.alert = function () {
    io.sockets.emit("test", {msg: "test socket"});
};

socketService.successUploadedCSV = function (obj) {
    console.log(obj);
    io.sockets.emit("upload_success", obj);
};

socketService.failedUpload = function (obj, message) {
    console.log(obj);
    io.sockets.emit("upload_failed", {
        data: obj,
        message: message,
    });
};

module.exports = socketService;
