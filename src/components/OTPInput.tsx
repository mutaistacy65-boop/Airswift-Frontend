import { useRef, useState } from "react";

export default function OTPInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move forward
    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    // Complete OTP
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return;

    const digits = pasteData.slice(0, length).split("");
    const newOtp = [...otp];

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    if (digits.length === length) {
      onComplete(digits.join(""));
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          ref={(el) => { inputsRef.current[index] = el }}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-xl font-semibold bg-gray-100 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-primary focus:shadow-md transition-all duration-200 focus:scale-105"
        />
      ))}
    </div>
  );
}