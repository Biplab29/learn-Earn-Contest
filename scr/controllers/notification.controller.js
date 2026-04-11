import asyncHandler from "../middleware/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import {
  sendNotificationConnectedEvent,
  sendNotificationHeartbeat,
  subscribeToNotificationStream,
} from "../utils/notificationStream.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit),
    Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    })
  ]);

  res.status(200).json({
    message: "Notifications fetched successfully",
    count: notifications.length,
    unreadCount,
    notifications
  });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.status(200).json({
    message: "Notification marked as read",
    notification
  });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const readAt = new Date();

  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt
      }
    }
  );

  res.status(200).json({
    message: "All notifications marked as read",
    modifiedCount: result.modifiedCount
  });
});

export const streamNotifications = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const unsubscribe = subscribeToNotificationStream(req.user._id, res);

  sendNotificationConnectedEvent(res, {
    userId: req.user._id,
    timestamp: new Date().toISOString()
  });

  const heartbeat = setInterval(() => {
    sendNotificationHeartbeat(res);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
};
