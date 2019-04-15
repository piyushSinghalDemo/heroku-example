
export const REGISTRATION_SUCCESS_MESSAGE = 'You are done. In order to access your account please click on the link sent to your registered email id'

export const REGISTRATION_FAILED_MESSAGE = "Failed to Register. Please try again"

export const LOGIN_FAILED_MESSAGE = "Failed to login. Please try again later"

export const FORGOT_PASSWORD_MESSAGE = "Thank You, For Registering with ERP DATA CLOUD, Inorder to access your account please click on the link send to your email"

export const RESET_PASSWORD_MESSAGE = "Successfully reset password."

export const VERIFY_TOKEN_MESSAGE = "Token verified successfully"

export const VERIFY_TOKEN_EXPIRED = "Verify token expired register again"

export const SERVER_ERROR = "Something went wrong!! Please contact with your admin"

export const SESSION_EXPIRED = "Session Expired"
export function reset_password_message(email){
	return "Reset password link sent successfully to " + email + " Kindly check your mail to reset password"

} 