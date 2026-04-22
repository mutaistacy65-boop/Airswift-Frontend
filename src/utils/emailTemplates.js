// Email Templates for Transactional Emails

// Payment Receipt Template
export const paymentReceiptTemplate = ({ name, amount, receipt }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #27ae60; margin: 0;">✅ Payment Successful</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <b>${name}</b>,
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Your payment has been received successfully. Thank you for your transaction!
      </p>

      <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
        <p style="margin: 10px 0;">
          <strong>Amount Paid:</strong> <span style="color: #27ae60; font-size: 18px;">KES ${amount}</span>
        </p>
        <p style="margin: 10px 0;">
          <strong>M-Pesa Receipt:</strong> <span style="font-family: monospace; background: white; padding: 5px 10px; border-radius: 4px;">${receipt}</span>
        </p>
        <p style="margin: 10px 0; color: #666; font-size: 14px;">
          <strong>Transaction Date:</strong> ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        A copy of your receipt has been saved to your account. You can download it anytime from your dashboard.
      </p>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #2e7d32; font-size: 16px;">
          ✨ Your application is one step closer to success! Check your email for next steps.
        </p>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
        Thank you for using <b>Talex</b> 🚀
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@talex.com
      </p>
    </div>
  `;
};

// Application Confirmation Template
export const applicationConfirmationTemplate = ({ name, jobTitle, company }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2196F3; margin: 0;">✅ Application Submitted</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <b>${name}</b>,
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Thank you for applying to the position of <b>${jobTitle}</b> at <b>${company}</b>.
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        We have received your application and will review it shortly. You will receive updates about your application status via email.
      </p>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
        <p style="margin: 0; color: #1565c0;"><strong>📋 Position:</strong> ${jobTitle}</p>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        • Check your dashboard to track your application status<br>
        • You will be notified when your application moves to the next stage<br>
        • Make sure to check your email regularly for updates
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
        Best of luck! We hope to see you soon. 🌟
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@talex.com
      </p>
    </div>
  `;
};

// Interview Scheduled Template
export const interviewScheduledTemplate = ({ name, jobTitle, date, time, interviewerName, zoomLink }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #9c27b0; margin: 0;">🎤 Interview Scheduled</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <b>${name}</b>,
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Congratulations! You have been selected for an interview for the position of <b>${jobTitle}</b>.
      </p>

      <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9c27b0;">
        <h3 style="color: #333; margin-top: 0;">Interview Details</h3>
        <p style="margin: 10px 0;">
          <strong>📅 Date:</strong> ${date}
        </p>
        <p style="margin: 10px 0;">
          <strong>⏰ Time:</strong> ${time}
        </p>
        <p style="margin: 10px 0;">
          <strong>👤 Interviewer:</strong> ${interviewerName}
        </p>
        ${zoomLink ? `<p style="margin: 10px 0;">
          <strong>🔗 Zoom Link:</strong> <a href="${zoomLink}" style="color: #9c27b0; text-decoration: none;">${zoomLink}</a>
        </p>` : ""}
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Please make sure to:<br>
        • Join 5 minutes before the scheduled time<br>
        • Test your internet connection and audio/video<br>
        • Find a quiet place for the interview<br>
        • Have a copy of your resume ready
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
        Looking forward to meeting you! 🤝
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@talex.com
      </p>
    </div>
  `;
};

// Status Update Template
export const statusUpdateTemplate = ({ name, jobTitle, status }) => {
  const statusColor = {
    accepted: "#27ae60",
    rejected: "#e74c3c",
    shortlisted: "#f39c12",
  }[status.toLowerCase()] || "#3498db";

  const statusMessage = {
    accepted: "Congratulations! Your application has been accepted. You will receive more details about the next steps soon.",
    rejected: "Thank you for your interest. Unfortunately, we have decided to move forward with other candidates at this time.",
    shortlisted: "Great news! Your application has been shortlisted. We will contact you soon for an interview.",
  }[status.toLowerCase()] || "Your application status has been updated.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: ${statusColor}; margin: 0;">📢 Application Status Update</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <b>${name}</b>,
      </p>

      <div style="background: ${statusColor}15; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
        <p style="margin: 10px 0;">
          <strong>Position:</strong> ${jobTitle}
        </p>
        <p style="margin: 10px 0;">
          <strong>Status:</strong> <span style="color: ${statusColor}; font-size: 18px; font-weight: bold;">${status.toUpperCase()}</span>
        </p>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        ${statusMessage}
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
        Thank you for your interest in joining our team! 🙏
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@talex.com
      </p>
    </div>
  `;
};
