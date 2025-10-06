import { getAllScheduledNotifications } from './app/services/notificationService';
const notifs = await getAllScheduledNotifications();
console.log("Total notificaciones:", notifs.length);
notifs.forEach((n, i) => {
  console.log(`${i+1}. ${n.content.title}`);
  console.log("   Trigger:", JSON.stringify(n.trigger, null, 2));
});
