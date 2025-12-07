// src/components/form/OTPInput.jsx
import React, { useState } from "react";
import { sendOtp, verifyOtp } from "../../utils/fakeApi";
import "./OTPInput.css";

function OTPInput({ mobile, onVerified }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setMessage("Enter a valid mobile number before sending OTP.");
      return;
    }
    await sendOtp(mobile);
    setOtpSent(true);
    setMessage("OTP sent successfully.");
  };

  const handleVerify = async () => {
    if (otp === "123456") {
      setMessage("OTP Verified ✔");
      onVerified();
    } else {
      setMessage("Invalid OTP ❌");
    }
  };

  return (
    <div className="otp-wrapper">
      {!otpSent ? (
        <button type="button" className="otp-btn" onClick={handleSendOtp}>
          Send OTP
        </button>
      ) : (
        <div className="otp-input-row">
          <input
            className="otp-input"
            type="text"
            maxLength="6"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="button" className="otp-verify-btn" onClick={handleVerify}>
            Verify
          </button>
        </div>
      )}

      {message && <p className="otp-msg">{message}</p>}
    </div>
  );
}

export default OTPInput;
