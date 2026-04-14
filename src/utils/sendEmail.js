import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await emailApi.sendTransacEmail({
      sender: { email: "no-reply@talex.com", name: "Talex Jobs" },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};