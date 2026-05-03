const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

const sendNotification = async (userId, data) => {
  const notification = await Notification.create({
    userId,
    ...data,
  });

  const io = getIO();
  io.to(userId.toString()).emit("notification", notification);
};

module.exports = sendNotification;