const { schedule } = require('@netlify/functions');

// Función programada que se ejecuta directamente en los servidores de Netlify Cloud
// Horario: 06:30 UTC (03:30 AM hora de Argentina)
const handler = async function(event, context) {
  console.log("[NETLIFY_CRON] Iniciando ciclo diario de sincronización en servidor Netlify...");

  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  
  if (buildHookUrl) {
    try {
      console.log("[NETLIFY_CRON] Disparando redespliegue automático y sincronización en Netlify...");
      const res = await fetch(buildHookUrl, { method: 'POST' });
      console.log([NETLIFY_CRON] Build disparado con código: );
    } catch (e) {
      console.error("[NETLIFY_CRON] Error al llamar al Build Hook:", e);
    }
  } else {
    console.log("[NETLIFY_CRON] Ejecutado sin NETLIFY_BUILD_HOOK_URL.");
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "SUCCESS",
      source: "NETLIFY_SCHEDULED_FUNCTION",
      scheduled_for: "03:30 AM Argentina",
      executed_at: new Date().toISOString()
    })
  };
};

module.exports.handler = schedule('30 6 * * *', handler);
