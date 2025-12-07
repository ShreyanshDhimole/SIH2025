export function isValidPin(pin) {
  return /^\d{6}$/.test(pin);
}

export function isValidAadhaar(aadhaar) {
  return /^\d{12}$/.test(aadhaar);
}

export function isEligible(obc, below3) {
  return obc === 'yes' && below3 === 'yes';
}


export function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}
