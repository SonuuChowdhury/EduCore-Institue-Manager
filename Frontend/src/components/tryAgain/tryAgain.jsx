/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import './tryAgain.css';


function GetPopUpMessage(status) {
  switch (status) {
    case 500:
    case 3:
      return "Oops! An Error Occurred";
    case 404:
      return "No OTPs found or they expired.";
    case 400:
      return "Invalid OTP!";
    case 1:
      return "Password Mismatched!";
    case 2:
      return "Please Enter the New Password!";
    case 4:
      return "Password Changed Succesfully!";
    case 5:
      return "OTP Verified Succesfully! Redirecting...";
    case 6:
      return "Wrong OTP Entered!";
    case 7:
      return "OTP Expired.";
    case 8:
      return "Invalid Roll Number.";
    case 9:
      return "Profile Photo Changed! Finishing...";
    case 10:
      return "Profile Photo Removed! Finishing..."
    default:
      return "Something went wrong!";
  }
}


function TryAgainTopBarPopup({ status }) {
  const [show, setShow] = useState(true);

  // Automatically hide the popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
      <div className={`top-bar-popup ${show ? 'show' : 'hide'}`}>
        {GetPopUpMessage(status)}
    </div>
  );
}

export default TryAgainTopBarPopup;
