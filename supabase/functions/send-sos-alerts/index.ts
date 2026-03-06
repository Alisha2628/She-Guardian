import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AlertRequest {
  alertId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alertId }: AlertRequest = await req.json();

    const { data: alert, error: alertError } = await supabase
      .from('sos_alerts')
      .select('*, profiles(full_name, phone_number)')
      .eq('id', alertId)
      .single();

    if (alertError || !alert) {
      throw new Error('Alert not found');
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', alert.user_id)
      .order('priority', { ascending: true });

    if (contactsError) {
      throw new Error('Failed to fetch contacts');
    }

    const alertMessages = contacts.map((contact) => ({
      to: contact.phone_number,
      email: contact.email,
      message: `EMERGENCY ALERT from ${alert.profiles.full_name}.
Location: https://www.google.com/maps?q=${alert.latitude},${alert.longitude}
Alert Type: ${alert.alert_type}
Threat Level: ${alert.threat_level}
Time: ${new Date(alert.created_at).toLocaleString()}
${alert.detected_keywords?.length ? `Keywords detected: ${alert.detected_keywords.join(', ')}` : ''}`,
    }));

    console.log('Alerts prepared for contacts:', alertMessages.length);

    return new Response(
      JSON.stringify({
        success: true,
        alertsSent: alertMessages.length,
        messages: alertMessages,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending alerts:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
