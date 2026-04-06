import { useRef, useState, useEffect } from "react";

export default function OTPInput({ onChange }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }

    onChange(newOtp.join(""));
  };

  const handleKeyDown = (e, index) => {
    // Move back on delete
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    newOtp.forEach((digit, i) => {
      if (inputs.current[i]) {
        inputs.current[i].value = digit;
      }
    });

    onChange(paste);
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
}