 
  const otpTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Magic Mistry OTP Verification</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
          <tr>
              <td align="center">

                  <table width="600" cellpadding="0" cellspacing="0"
                      style="background:#ffffff;border-radius:10px;overflow:hidden;">

                      <!-- Header -->
                      <tr>
                          <td align="center"
                              style="background:#FFD60A;padding:25px;color:#000;font-size:30px;font-weight:bold;">
                              Magic Mistry
                          </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                          <td style="padding:40px;">

                              <h2 style="margin-top:0;color:#333;">
                                  Email Verification
                              </h2>

                              <p style="font-size:16px;color:#555;line-height:1.6;">
                                  Hello,
                              </p>

                              <p style="font-size:16px;color:#555;line-height:1.6;">
                                  Thank you for registering with
                                  <strong>Magic Mistry</strong>.
                                  Please use the following One-Time Password (OTP)
                                  to verify your email address.
                              </p>

                              <!-- OTP -->
                              <div style="text-align:center;margin:35px 0;">
                                  <span
                                      style="
                                      display:inline-block;
                                      background:#FFD60A;
                                      color:#000;
                                      padding:18px 35px;
                                      font-size:34px;
                                      font-weight:bold;
                                      border-radius:8px;
                                      letter-spacing:8px;">
                                      ${otp}
                                  </span>
                              </div>

                              <p style="font-size:16px;color:#555;">
                                  This OTP is valid for
                                  <strong>5 minutes</strong>.
                              </p>

                              <p style="font-size:16px;color:#555;">
                                  <strong>Never share this OTP with anyone.</strong>
                                  Magic Mistry will never ask for your OTP.
                              </p>

                              <p style="font-size:16px;color:#555;">
                                  If you did not request this verification,
                                  you can safely ignore this email.
                              </p>

                              <hr style="margin:35px 0;border:none;border-top:1px solid #ddd;">

                              <p style="font-size:14px;color:#888;text-align:center;">
                                  Need help?
                                  Contact us at
                                  <a href="mailto:support@magicmistry.com">
                                      support@magicmistry.com
                                  </a>
                              </p>

                              <p style="font-size:13px;color:#999;text-align:center;">
                                  This is an automated email from Magic Mistry.
                                  Please do not reply to this email.
                              </p>

                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>

  </html>
  `;
};

module.exports = otpTemplate;