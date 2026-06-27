// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// const sendEmail = async ({ to, subject, html }) => {
//   const mailOptions = {
//     from: `"SnappHire Placements" <${process.env.GMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };
//   await transporter.sendMail(mailOptions);
// };

// // Invitation email template
// exports.sendInvitationEmail = async ({ to, jobTitle, company, token }) => {
//   const link = `${process.env.CLIENT_URL}/accept-invite/${token}`;
//   await sendEmail({
//     to,
//     subject: `You've been invited to apply — ${jobTitle} at ${company}`,
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:auto">
//         <h2 style="color:#534AB7">SnappHire</h2>
//         <p>You have been personally invited to apply for:</p>
//         <h3 style="margin:0">${jobTitle}</h3>
//         <p style="color:#666;margin-top:4px">${company}</p>
//         <a href="${link}"
//            style="display:inline-block;margin-top:20px;padding:12px 24px;
//                   background:#534AB7;color:#fff;border-radius:8px;
//                   text-decoration:none;font-weight:500">
//           View &amp; Apply
//         </a>
//         <p style="color:#999;font-size:12px;margin-top:24px">
//           This invitation expires in 48 hours. If you did not expect this email, you can ignore it.
//         </p>
//       </div>
//     `,
//   });
// };

// // Application status update email
// exports.sendStatusEmail = async ({ to, name, jobTitle, status }) => {
//   const statusMap = {
//     shortlisted: { label: 'Shortlisted', color: '#185FA5' },
//     selected:    { label: 'Selected',    color: '#0F6E56' },
//     rejected:    { label: 'Not selected', color: '#A32D2D' },
//   };
//   const s = statusMap[status] || { label: status, color: '#534AB7' };
//   await sendEmail({
//     to,
//     subject: `Application update: ${jobTitle}`,
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:auto">
//         <h2 style="color:#534AB7">SnappHire</h2>
//         <p>Hi ${name},</p>
//         <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
//         <p style="font-size:18px;font-weight:600;color:${s.color}">Status: ${s.label}</p>
//         <a href="${process.env.CLIENT_URL}/my-applications"
//            style="display:inline-block;margin-top:16px;padding:10px 20px;
//                   background:#534AB7;color:#fff;border-radius:8px;text-decoration:none">
//           View my applications
//         </a>
//       </div>
//     `,
//   });
// };

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

// Test connection on startup
transporter.verify((error) => {
  if (error) console.error('❌ Email service error:', error.message);
  else console.log('✅ Email service ready');
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Placemint Placements" <${process.env.GMAIL_USER}>`,
    to, subject, html,
  });
};

exports.sendInvitationEmail = async ({ to, jobTitle, company, token }) => {
  const link = `${process.env.CLIENT_URL}/accept-invite/${token}`;
  await sendEmail({
    to, subject: `Invitation to apply — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#534AB7;margin-bottom:4px">SnappHire</h2>
        <p style="color:#888;font-size:13px;margin-bottom:24px">Campus Placement Platform</p>
        <p style="color:#333">You have been personally invited to apply for:</p>
        <div style="background:#f5f4ff;border-radius:10px;padding:16px;margin:16px 0">
          <h3 style="margin:0;color:#222">${jobTitle}</h3>
          <p style="margin:4px 0 0;color:#666;font-size:14px">${company}</p>
        </div>
        <a href="${link}" style="display:inline-block;background:#534AB7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;margin-top:8px">View &amp; Apply →</a>
        <p style="color:#bbb;font-size:12px;margin-top:24px">This invitation expires in 48 hours.</p>
      </div>
    `,
  });
};

exports.sendStatusEmail = async ({ to, name, jobTitle, status }) => {
  const map = { shortlisted:['Shortlisted 🎉','#185FA5'], selected:['Selected! 🎊','#0F6E56'], rejected:['Application update','#A32D2D'] };
  const [label, color] = map[status] || ['Updated','#534AB7'];
  await sendEmail({
    to, subject: `Application update: ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#534AB7">SnappHire</h2>
        <p style="color:#333">Hi ${name},</p>
        <p style="color:#333">Your application for <strong>${jobTitle}</strong> has been updated.</p>
        <div style="background:#f5f5f5;border-radius:10px;padding:16px;margin:16px 0;border-left:4px solid ${color}">
          <p style="margin:0;font-size:18px;font-weight:600;color:${color}">${label}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/my-applications" style="display:inline-block;background:#534AB7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500">View my applications</a>
      </div>
    `,
  });
};