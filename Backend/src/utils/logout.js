export const logoutUserUtil = (res) => {
  // Clear all auth cookies
  res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });
};