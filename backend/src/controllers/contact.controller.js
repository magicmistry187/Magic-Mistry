const mailSender = require('../utils/sendEmail');

const sendContactMessage = async (req, res) => {
  try {
    const {
      inquiryType,
      fullName,
      phoneNumber,
      email,
      serviceDistrict,
      responsePriority,
      preferredContactMethod,
      message,
    } = req.body;

  
    if (
      !inquiryType?.trim() ||
      !fullName?.trim() ||
      !phoneNumber?.trim() ||
      !serviceDistrict?.trim() ||
      !responsePriority?.trim() ||
      !preferredContactMethod?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

  
    const data = {
      inquiryType: inquiryType.trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email?.trim().toLowerCase() || '',
      serviceDistrict: serviceDistrict.trim(),
      responsePriority: responsePriority.trim(),
      preferredContactMethod: preferredContactMethod.trim(),
      message: message.trim(),
    };

    
    if (
      data.inquiryType.length > 100 ||
      data.fullName.length > 100 ||
      data.phoneNumber.length > 20 ||
      data.email.length > 254 ||
      data.serviceDistrict.length > 100 ||
      data.responsePriority.length > 50 ||
      data.preferredContactMethod.length > 50 ||
      data.message.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Some fields exceed the allowed length',
      });
    }

  
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim();

    if (!adminEmail) {
      throw new Error('Admin email is not configured');
    }

  
    const escapeHTML = (value) =>
      value.replace(
        /[&<>"']/g,
        (char) =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          })[char],
      );

    // Email template
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; background: #f4f6f9;">

        <div style="background: white; border-radius: 10px; overflow: hidden;">

          <div style="background: #172554; padding: 25px; text-align: center; color: white;">
            <h2>Magic Mistry</h2>
            <p>Customer Support & Operations</p>
          </div>

          <div style="padding: 25px; color: #334155;">

            <h2>New Customer Enquiry</h2>

            <p style="color: #64748b;">
              A new enquiry has been submitted through the Magic Mistry website.
              Please review the details below.
            </p>

            <h3>Enquiry Details</h3>

            <table style="width: 100%; border-collapse: collapse;">

              ${[
                ['Inquiry Type', data.inquiryType],
                ['Full Name', data.fullName],
                ['Phone Number', data.phoneNumber],
                ['Email Address', data.email || 'Not provided'],
                ['Service District', data.serviceDistrict],
                ['Response Priority', data.responsePriority],
                ['Preferred Contact Method', data.preferredContactMethod],
              ]
                .map(
                  ([label, value]) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">
                    ${label}
                  </td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">
                    ${escapeHTML(value)}
                  </td>
                </tr>
              `,
                )
                .join('')}

            </table>

            <h3 style="margin-top: 25px;">Appliance Issue / Query</h3>

            <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; line-height: 1.7;">
              ${escapeHTML(data.message).replace(/\n/g, '<br />')}
            </div>

            <p style="margin-top: 25px; color: #64748b; font-size: 13px;">
              Please contact the customer using their preferred contact method.
            </p>

          </div>

          <div style="background: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
            Automated notification from Magic Mistry.
            <br />
            © ${new Date().getFullYear()} Magic Mistry. All rights reserved.
          </div>

        </div>
      </div>
    `;

    
    await mailSender(
      adminEmail,
      `New Enquiry: ${data.inquiryType}`,
      emailBody,
      data.email || null,
    );

    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been submitted successfully',
    });
  } catch (error) {
    console.error('Contact Us Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to submit your enquiry. Please try again later.',
    });
  }
};



module.exports = { sendContactMessage };
