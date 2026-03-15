/**
 * @name foreignSeeker
 * @author foreignSeal
 * @authorLink https://github.com/foreignSeal
 * @version 1.1.1
 * @description A way to look at server channels in a foreign way.
 * @website https://github.com/foreignSeal/BetterDiscord-plugins
 * @source https://github.com/foreignSeal/BetterDiscord-plugins/blob/main/src/foreignSeeker/foreignSeeker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/foreignSeal/BetterDiscord-plugins/refs/heads/main/src/foreignSeeker/foreignSeeker.plugin.js
 */

module.exports = class foreignSeeker {

  // 🦭 ┊  Init
  start() {
    this._patchCopyContextMenu();
  }

  stop() {
    // Unpatch all modifications and clean up
    BdApi.Patcher.unpatchAll("foreignSeeker");
    // Manual unpatch for context menus
    BdApi.ContextMenu.unpatch("channel-context", this._channelPatch);
  }

  // 🦭 ┊  Patches
  _patchCopyContextMenu() {
    this._channelPatch = (returnValue, props) => {
      const channel = props.channel;
      if (!channel) return;

      // Check if type is Category (type 4)
      if (channel.type === 4) {
        // Category
        this._injectCopyItem(returnValue, "Copy Category Name", channel.name ?? channel.id);
      } else {
        const channelName = this._resolveChannelName(channel);
        this._injectCopyItem(returnValue, "Copy Channel Name", channelName);
      }
    };
    BdApi.ContextMenu.patch("channel-context", this._channelPatch);
  }

  // 🦭 ┊  Context Menu Injection
  _injectCopyItem(returnValue, label, value) {
    const copyItem = BdApi.ContextMenu.buildItem({
      label,
      id: "foreign-seeker-copy-name",
      icon: () =>
        BdApi.React.createElement("svg", {
          width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor",
        },
        BdApi.React.createElement("path", {
          d: "M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
        })
      ),
      action: () => {
        DiscordNative.clipboard.copy(value);
        BdApi.UI.showToast(`Copied: ${value}`, { type: "success", timeout: 2000, });
      },
    });

    // Look for target sibling
    const groups = returnValue?.props?.children;
    if(!Array.isArray(groups)) return;

    // Devmode not found || Fallback
    const newGroup = BdApi.ContextMenu.buildItem({ type: "separator" });
    if (Array.isArray(returnValue.props.children)) {
      returnValue.props.children.push(newGroup, copyItem);
    }
  }

  // 🦭 ┊  Helpers
  _resolveChannelName(channel) {
    // Servers ===> Channel Name
    if (channel.name) return channel.name;

    // DM Channels (type 1) ===> Recipient's Username
    if (channel.type === 1) {
      try {
        const UserStore = BdApi.Webpack.getStore("UserStore");
        const recipientId = UserStore.getUser(channel.recipients?.[0]);
        return recipientId?.username ?? "Unknown";
      } catch {
        return "Direct Message";
      }
    }

    // DM Group (type 3) ===> Group Name
    if (channel.type === 3) {
      if (channel.name) return channel.name; // It was simpler than I thought...
      return "Group DM";
    }

    return channel.id; // Fallback ---> Channel ID
  }
};