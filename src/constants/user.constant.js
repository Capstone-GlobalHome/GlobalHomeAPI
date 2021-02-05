export const USER_ROLE = {
   ADMIN: 'ADMIN',
   USER: 'USER',
   MANAGER: 'MANAGER'
}

export const STATUS = {
   PENDING: 0,
   ACTIVE: 1,
   BLOCK: 2
}

export const RESEND_CODE_TIME = {
   SIGNUP_CODE: 0,
   ACCOUNT_WARNING_ONE: 1,
   ACCOUNT_WARNING_TWO: 2,
   ACCOUNT_WARNING_TREE: 3,
   ACCOUNT_BLOCK: 4
}

export const MESSAGES = {
   VALIDATION_ERROR: "All fields are required.",
   ACCOUNT_BLOCK: "Account has been blocked.",
   EMAIL_SERVER_ERROR: "Email server error.",
   SENT_VERIFICATION_CODE: "Verification code has been sent your email address.",
   VERIFICATION_CODE_EXPIRED: "Verification code has been expired.",
   VERIFICATION_CODE_WRONG: "Wrong verification code.",
   DATA_NOT_FOUND: "Data not found."
}