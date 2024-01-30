import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  whatsappNumber: z.string().regex(/^\+[1-9]\d{1,14}$/i, {
    message: 'Invalid WhatsApp number format. Please include the country code, e.g., +123456789',
  }),
  storeName: z.string(),
});
