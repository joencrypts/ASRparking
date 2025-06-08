import twilio from 'twilio';

// Twilio Configuration
const accountSid = 'AC111d4322edde53255c15569afc905555';
const authToken = '000a8307a41c67fe9ad6f6395109a020';
const whatsappNumber = 'whatsapp:+14155238886';
const contentSid = 'HX350d429d32e64a552466cafecbe95f3c';

// Initialize Twilio client
let client;
try {
  client = twilio(accountSid, authToken);
  console.log('📱 WhatsApp service configured successfully with account:', accountSid);
} catch (error) {
  console.error('⚠️ WhatsApp service configuration error:', error.message);
  client = null;
}

export const sendWhatsAppMessage = async (to, body, templateVariables = null) => {
  if (!client) {
    console.log('📱 WhatsApp not configured. Message would be sent to:', to);
    console.log('📱 Message:', body);
    console.log('📱 Configuration Status:', {
      accountSid: accountSid ? '✓' : '✗',
      authToken: authToken ? '✓' : '✗',
      whatsappNumber: whatsappNumber ? '✓' : '✗',
      contentSid: contentSid ? '✓' : '✗'
    });
    return { 
      success: false, 
      message: 'WhatsApp not configured',
      details: {
        to,
        body,
        configuration: {
          accountSid: !!accountSid,
          authToken: !!authToken,
          whatsappNumber: !!whatsappNumber,
          contentSid: !!contentSid
        }
      }
    };
  }

  try {
    // Format phone number for WhatsApp
    const formattedNumber = to.startsWith('+') ? `whatsapp:${to}` : `whatsapp:+91${to}`;
    
    const messageParams = {
      to: formattedNumber,
      from: whatsappNumber
    };

    // If template variables are provided, use the template
    if (templateVariables) {
      messageParams.contentSid = contentSid;
      messageParams.contentVariables = JSON.stringify(templateVariables);
    } else {
      // Format the message body with proper line breaks
      messageParams.body = body;
    }

    console.log('📱 Attempting to send WhatsApp message:', {
      to: formattedNumber,
      usingTemplate: !!templateVariables,
      params: messageParams
    });

    const message = await client.messages.create(messageParams);

    console.log('📱 WhatsApp message sent successfully:', {
      to: formattedNumber,
      messageId: message.sid,
      status: message.status,
      usingTemplate: !!templateVariables
    });
    
    return { 
      success: true, 
      messageId: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('📱 WhatsApp error:', {
      message: error.message,
      code: error.code,
      to,
      body,
      templateVariables,
      error: error
    });
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      details: error
    };
  }
};

// Direct message functions
export const sendExitMessage = async (phone, vehicleNumber, billAmount) => {
  const message = `Your vehicle ${vehicleNumber} has exited ASR Parking Lot.\nFinal bill: ₹${billAmount}\n\nThanks for visiting! Visit again!\n-ASR Parking Lot`;
  return await sendWhatsAppMessage(phone, message);
};

export const sendEntryMessage = async (phone, vehicleNumber, tokenNumber) => {
  const message = `Welcome to ASR Parking Lot!\n\nVehicle: ${vehicleNumber}\nToken: ${tokenNumber}\n\nPlease keep this token safe for exit.\n-ASR Parking Lot`;
  return await sendWhatsAppMessage(phone, message);
};

// Template message functions (if needed)
export const sendParkingEntryMessage = async (phone, vehicleNumber, tokenNumber) => {
  const templateVariables = {
    "1": vehicleNumber,
    "2": tokenNumber
  };
  return await sendWhatsAppMessage(phone, null, templateVariables);
};

export const sendParkingExitMessage = async (phone, vehicleNumber, billAmount) => {
  const templateVariables = {
    "1": vehicleNumber,
    "2": `₹${billAmount}`
  };
  return await sendWhatsAppMessage(phone, null, templateVariables);
};

export const sendDailySummary = async (adminPhone, vehicleCount, totalRevenue) => {
  const message = `ASR Parking Daily Report\n\nVehicles Parked: ${vehicleCount}\nTotal Revenue: ₹${totalRevenue}\n\n-ASR Parking Lot`;
  return await sendWhatsAppMessage(adminPhone, message);
};