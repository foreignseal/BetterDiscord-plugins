/**
 * @name foreignSeeker
 * @author foreignSeal
 * @authorLink https://github.com/foreignSeal
 * @version 1.0.1
 * @description A way to look at server channels in a foreign way.
 * @website https://github.com/foreignSeal/BetterDiscord-plugins
 * @source https://github.com/foreignSeal/BetterDiscord-plugins/blob/main/src/foreignSeeker/foreignSeeker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/foreignSeal/BetterDiscord-plugins/refs/heads/main/src/foreignSeeker/foreignSeeker.plugin.js
 */

module.exports = class foreignSeeker {

  // 🦭 ┊  Init
  start() {
    this._patchChannelContextMenu();
    this._patchCategoryContextMenu();
  }

  stop() {
    // Unpatch all modifications and clean up
    BdApi.Patcher.unpatchAll("foreignSeeker");
    document
      .querySelectorAll(".foreign-seeker-item")
      .forEach((el) => el.remove());
  }

  // 🦭 ┊  Patches
  _patchChannelContextMenu() {
    BdApi.ContextMenu.patch("channel-context", (returnValue, props) => {
      const channel = props.channel;
      if (!channel) return;

      // Check if type is Category (type 4)
      if (channel.type === 4) return;

      const channelName = this._resolveChannelName(channel);
      this._injectCopyItem(returnValue, "Copy Channel Name", channelName, "copy-channel-id");
    });
  }

  _patchCategoryContextMenu() {
    BdApi.ContextMenu.patch("channel-context", (returnValue, props) => {
      const category = props.channel;
      if (!category || category.type !== 4) return;

      this._injectCopyItem(returnValue, "Copy Category Name", category.name ?? category.id, "copy-category-id");
    });
  }

  // 🦭 ┊  Context Menu Injection
  _injectCopyItem(returnValue, label, value, itemId) {

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
        DiscordNative.clipboard.copy(channelName);
        BdApi.UI.showToast(`Copied: ${channelName}`, { type: "success", timeout: 2000, });
      },
    });

    // Look for target sibling
    const groups = returnValue?.props?.children;
    if(!Array.isArray(groups)) return;

    for (const group of groups) {
      const children = group?.props?.children;
      if (!Array.isArray(children)) continue;

      const idx = children.findIndex((item) => item?.props?.id === targetId);
      if (idx !== -1) {
        children.splice(idx + 1, 0, copyItem);
        return;
      }
    }

    //Fallback
    const firstChildren = groups[0]?.props?.children;
    if (Array.isArray(firstChildren)) {
      firstChildren.unshift(copyItem);
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