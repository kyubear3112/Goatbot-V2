const { checkLiveCookie } = require("neokex-fca");

/**
 * Validate a Facebook session.
 * Delegates to neokex-fca's built-in checkLiveCookie, which performs a real FCA
 * bootstrap. The previous implementation checked mbasic.facebook.com, which now
 * serves a "Facebook is not available on this browser" page and therefore
 * reported valid cookies as invalid (causing GoatBot to fall back to its
 * email/password re-login and log the account out).
 *
 * @param {string} cookie Cookie string as `c_user=123;xs=123;datr=123;` format
 * @param {string} userAgent Optional user agent to use for the bootstrap
 * @returns {Promise<Boolean>} True if the cookies are valid, false otherwise
 */
module.exports = async function (cookie, userAgent) {
	try {
		if (!cookie) return false;
		return await checkLiveCookie(cookie, { userAgent: userAgent || undefined });
	}
	catch (e) {
		return false;
	}
};
