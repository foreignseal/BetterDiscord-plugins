/**
 * @name foreignFixedURL
 * @author foreignSeal
 * @authorLink https://github.com/foreignSeal
 * @version 1.0.1
 * @description Ok, I'll just fix your broken X.com URLs for you.
 * @website https://github.com/foreignSeal/BetterDiscord-plugins
 * @source https://github.com/foreignSeal/BetterDiscord-plugins/blob/main/src/foreignFixedURL/foreignFixedURL.plugin.js
 * @updateUrl https://raw.githubusercontent.com/foreignSeal/BetterDiscord-plugins/refs/heads/main/src/foreignFixedURL/foreignFixedURL.plugin.js
 */

module.exports = class foreignFixedURL {

  // 🦭 ┊  Init
  start() {
    this._patchMessageSend();
  }

  stop() {
    BdApi.Patcher.unpatchAll("foreignFixedURL");
  }

  // 🦭 ┊  Patches
  _patchMessageSend() {
    const MessageActions = BdApi.Webpack.getModule(
      BdApi.Webpack.Filters.byKeys("sendMessage", "editMessage")
    );

    if (!MessageActions) {
      return BdApi.showToast("foreignFixedURL: Could not find MessageActions module.", { type: "error" });
    }

    BdApi.Patcher.before("foreignFixedURL", MessageActions, "sendMessage", (_, args) => {
      const message = args[1];
      if (message && typeof message.content === "string" && message.content.includes("x.com")) {
        message.content = message.content.replace(/https?:\/\/x\.com/g, "https://fixupx.com");
      }
    });
  }
};