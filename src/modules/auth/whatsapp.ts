import axios from 'axios';

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'your-access-token';
const FROM_PHONE_NUMBER_ID = '118541104678708';

const NumberPlaceholder = '[ Number]';
const PasswordPlaceholder = '[ Password]';

const MESSAGE_CONTENT = `Welcome to Kartin!\n\nYour login details are as follows:\nWhatsApp Number: ${NumberPlaceholder}\nPassword: ${PasswordPlaceholder}\n\nThank you for choosing Kartin, and we look forward to serving you! If you have any questions or need assistance, please don't hesitate to reach out to our customer support team.`;

export async function sendWhatsAppMessage(
  to: string,
  Number: string,
  Password: string,
): Promise<string | undefined> {
  const replacedMessageContent = MESSAGE_CONTENT.replace(NumberPlaceholder, Number).replace(
    PasswordPlaceholder,
    Password,
  );

  const apiUrl = `https://graph.facebook.com/v18.0/${FROM_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: replacedMessageContent,
    },
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Message sent successfully:', response.data);
    return `Message sent successfully: ${response.data}`;
  } catch (error) {
    console.log(error);
  }
}
