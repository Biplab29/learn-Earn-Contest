import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { emitNotificationToUsers } from "./notificationStream.js";
import { sendEmail } from "./sendEmail.js";

export const notifyAdminsAboutPendingTeam = async ({
  team,
  contest,
  leader,
  inviteEmails = []
}) => {
  const admins = await User.find({
    role: "admin",
    email: { $exists: true, $ne: null }
  }).select("_id name email");

  if (admins.length === 0) {
    return {
      notificationsCreated: 0,
      realtimeRecipients: 0,
      emailSentTo: [],
      emailFailedFor: []
    };
  }

  const frontendUrl =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";

  const invitedSummary =
    inviteEmails.length > 0 ? inviteEmails.join(", ") : "No invited members yet";
  const title = `Team approval needed: ${team.teamName}`;
  const message = `${leader?.name || "A user"} created team "${team.teamName}" for ${contest?.title || "a contest"} and it is waiting for admin approval.`;

  const notificationDocs = admins.map((admin) => ({
    recipient: admin._id,
    type: "team_approval_requested",
    title,
    message,
    link: frontendUrl,
    data: {
      teamId: team._id,
      contestId: contest?._id || null,
      teamName: team.teamName,
      contestTitle: contest?.title || null,
      leaderName: leader?.name || null,
      leaderEmail: leader?.email || null,
      inviteEmails
    }
  }));

  const notifications = await Notification.insertMany(notificationDocs);

  emitNotificationToUsers(
    notifications.map((notification, index) => ({
      userId: admins[index]._id.toString(),
      notification
    }))
  );

  const emailHtml = `
    <h2>New team pending admin approval</h2>
    <p>A new team has been created and is waiting for review.</p>
    <p><strong>Team Name:</strong> ${team.teamName}</p>
    <p><strong>Contest:</strong> ${contest?.title || "N/A"}</p>
    <p><strong>Leader:</strong> ${leader?.name || "Unknown"} (${leader?.email || "No email"})</p>
    <p><strong>Invited Members:</strong> ${invitedSummary}</p>
    <p><strong>Current Status:</strong> ${team.status}</p>
    <br/>
    <a href="${frontendUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;" clicktracking="off">
      Open Admin App
    </a>
  `;

  const emailResults = await Promise.allSettled(
    admins.map((admin) => sendEmail(admin.email, title, emailHtml))
  );

  const emailSentTo = [];
  const emailFailedFor = [];

  emailResults.forEach((result, index) => {
    const adminEmail = admins[index].email?.toLowerCase().trim();

    if (!adminEmail) {
      return;
    }

    if (result.status === "fulfilled") {
      emailSentTo.push(adminEmail);
      return;
    }

    emailFailedFor.push({
      email: adminEmail,
      error: result.reason?.message || "Email could not be sent"
    });
  });

  return {
    notificationsCreated: notifications.length,
    realtimeRecipients: notifications.length,
    emailSentTo,
    emailFailedFor
  };
};
