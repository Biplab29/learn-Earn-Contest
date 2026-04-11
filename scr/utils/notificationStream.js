const notificationClients = new Map();

const writeSseEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const subscribeToNotificationStream = (userId, res) => {
  const normalizedUserId = userId.toString();

  if (!notificationClients.has(normalizedUserId)) {
    notificationClients.set(normalizedUserId, new Set());
  }

  notificationClients.get(normalizedUserId).add(res);

  return () => {
    const clientSet = notificationClients.get(normalizedUserId);

    if (!clientSet) {
      return;
    }

    clientSet.delete(res);

    if (clientSet.size === 0) {
      notificationClients.delete(normalizedUserId);
    }
  };
};

export const emitNotificationToUser = (userId, notification) => {
  const clientSet = notificationClients.get(userId.toString());

  if (!clientSet || clientSet.size === 0) {
    return;
  }

  const payload =
    typeof notification?.toObject === "function"
      ? notification.toObject()
      : notification;

  for (const res of clientSet) {
    writeSseEvent(res, "notification", payload);
  }
};

export const emitNotificationToUsers = (entries = []) => {
  for (const entry of entries) {
    if (!entry?.userId || !entry?.notification) {
      continue;
    }

    emitNotificationToUser(entry.userId, entry.notification);
  }
};

export const sendNotificationHeartbeat = (res) => {
  writeSseEvent(res, "ping", { timestamp: new Date().toISOString() });
};

export const sendNotificationConnectedEvent = (res, payload = {}) => {
  writeSseEvent(res, "connected", payload);
};
