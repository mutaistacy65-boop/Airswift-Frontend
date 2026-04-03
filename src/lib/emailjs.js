import emailjs from "@emailjs/browser";

export const sendOTPEmail = async (to_email, otp) => {
  try {
    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      {
        to_email: to_email,
        otp: otp,
        from_name: "AIRSWIFT",
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );

    return result;
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};