import express from "express";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  streamNotifications,
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middleware/checkAuthUser.js";

const notificationRouter = express.Router();

notificationRouter.get("/", verifyJWT, getMyNotifications);
notificationRouter.get("/stream", verifyJWT, streamNotifications);
notificationRouter.patch("/read-all", verifyJWT, markAllNotificationsAsRead);
notificationRouter.patch("/:id/read", verifyJWT, markNotificationAsRead);

export default notificationRouter;

console.log("Notification router is working");
