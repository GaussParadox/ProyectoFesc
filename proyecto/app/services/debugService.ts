    import * as Notifications from "expo-notifications";

    export async function debugScheduledNotifications() {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    console.log(`\n📋 Total de notificaciones programadas: ${allNotifications.length}\n`);
    
    for (let i = 0; i < allNotifications.length; i++) {
        const notif = allNotifications[i];
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Notificación ${i + 1}:`);
        console.log(`  📌 Título: ${notif.content.title}`);
        console.log(`  📝 Cuerpo: ${notif.content.body}`);
        console.log(`  🔔 ID: ${notif.identifier}`);
        
        if (notif.trigger && 'type' in notif.trigger) {
        const trigger = notif.trigger as any;
        console.log(`  ⏰ Tipo de trigger: ${trigger.type}`);
        
        if (trigger.type === 'calendar') {
            console.log(`  📅 Configuración:`);
            console.log(`     - Hora: ${trigger.hour ?? 'no especificada'}`);
            console.log(`     - Minuto: ${trigger.minute ?? 'no especificado'}`);
            console.log(`     - Se repite: ${trigger.repeats ? 'Sí' : 'No'}`);
            
            // Mostrar cuándo se disparará
            if (trigger.value) {
            const nextTrigger = new Date(trigger.value);
            console.log(`     - Próxima ejecución: ${nextTrigger.toLocaleString('es-MX')}`);
            }
        }
        }
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }


    export async function testImmediateNotification() {
    console.log("🧪 Programando notificación de prueba en 5 segundos...");
    
    const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
    };
    
    await Notifications.scheduleNotificationAsync({
        content: {
        title: "Prueba Inmediata",
        body: "Esta notificación se programó hace 5 segundos",
        sound: true,
        },
        trigger,
    });
    
    console.log("✅ Notificación de prueba programada");
    }


    export async function testDailyNotification(hour: number, minute: number) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log(`\n🧪 Prueba de notificación diaria:`);
    console.log(`   Hora actual: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    console.log(`   Hora programada: ${hour}:${minute.toString().padStart(2, '0')}`);
    
    const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
    };
    
    const notifId = await Notifications.scheduleNotificationAsync({
        content: {
        title: "Prueba Diaria",
        body: `Programada para las ${hour}:${minute.toString().padStart(2, '0')}`,
        sound: true,
        },
        trigger,
    });
    
    console.log(`✅ Notificación programada con ID: ${notifId}`);
    
    // Verificar cuándo se disparará
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const thisNotif = scheduled.find(n => n.identifier === notifId);
    
    if (thisNotif && thisNotif.trigger) {
        console.log(`📋 Información del trigger:`, JSON.stringify(thisNotif.trigger, null, 2));
    }
    }
