export interface MailInterface {
  to: string | string[] | undefined;
  subject: string;
  text?: string;
  html?: string;
}
