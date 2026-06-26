const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"SnappHire Placements" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Invitation email template
exports.sendInvitationEmail = async ({ to, jobTitle, company, token }) => {
  const link = `${process.env.CLIENT_URL}/accept-invite/${token}`;
  await sendEmail({
    to,
    subject: `You've been invited to apply — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#534AB7">SnappHire</h2>
        <p>You have been personally invited to apply for:</p>
        <h3 style="margin:0">${jobTitle}</h3>
        <p style="color:#666;margin-top:4px">${company}</p>
        <a href="${link}"
           style="display:inline-block;margin-top:20px;padding:12px 24px;
                  background:#534AB7;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:500">
          View &amp; Apply
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          This invitation expires in 48 hours. If you did not expect this email, you can ignore it.
        </p>
      </div>
    `,
  });
};

// Application status update email
exports.sendStatusEmail = async ({ to, name, jobTitle, status }) => {
  const statusMap = {
    shortlisted: { label: 'Shortlisted', color: '#185FA5' },
    selected:    { label: 'Selected',    color: '#0F6E56' },
    rejected:    { label: 'Not selected', color: '#A32D2D' },
  };
  const s = statusMap[status] || { label: status, color: '#534AB7' };
  await sendEmail({
    to,
    subject: `Application update: ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#534AB7">SnappHire</h2>
        <p>Hi ${name},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
        <p style="font-size:18px;font-weight:600;color:${s.color}">Status: ${s.label}</p>
        <a href="${process.env.CLIENT_URL}/my-applications"
           style="display:inline-block;margin-top:16px;padding:10px 20px;
                  background:#534AB7;color:#fff;border-radius:8px;text-decoration:none">
          View my applications
        </a>
      </div>
    `,
  });
};