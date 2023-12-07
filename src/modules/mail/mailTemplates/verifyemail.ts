export const verifyemailTemplate = (storename: string, link: string) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    background-color: #f5f5f5;
  }

  /* Shared styles for headings and paragraphs */
  h1, p {
    margin: 10px 0;
  }

  h1 {
    font-size: 36px;
    font-weight: bold;
    color: #333333;
  }

  p {
    color: #333333;
    font-size: 18px;
    margin-bottom: 10px;

  }

  .highlight {
    color: #2c3e50;
    font-weight: bold;
  }

  /* Button style */
  .button {
    display: inline-block;
    padding: 8px 15px;
    background-color: #3498db;
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
    text-decoration: none;
    border-radius: 5px;
    margin: 10px 0;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #2980b9;
  }

  .button:focus {
    color: #ffffff;
  }

  /* Email container */
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Signature style */
  .signature {
    margin-top: 30px;
  }
  </style>
</head>
<body>
  <div class="email-container">
  <p>Dear ${storename}</p>
  <p>Thank you for registering as a Vendor on KARTIN.</p>
  <p>Here's the link to verify your email:</p>
  <a href="${link}" class="button">Verify Email</a>
  <p>If you did not request this, please ignore this email or contact our support team immediately.</p>
  <p>Thank you for your time.</p>
  <p class="signature">Best regards,</p>
  <p class="signature">The KARTIN Team</p>
  </div>
</body>
</html>
`;
};
