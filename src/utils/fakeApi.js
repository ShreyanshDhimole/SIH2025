// src/utils/fakeApi.js
export async function sendOtp(mobile) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'OTP sent to ' + mobile });
    }, 800);
  });
}

export async function verifyOtp(mobile, otp) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (otp === '123456') {
        resolve({ success: true, message: 'OTP verified' });
      } else {
        resolve({ success: false, message: 'Invalid OTP' });
      }
    }, 600);
  });
}

export async function checkApplicationStatus(mobile, applicationId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          application_id: applicationId,
          status: 'Under Review',
          message: 'Your application is being processed.'
        }
      });
    }, 1000);
  });
}