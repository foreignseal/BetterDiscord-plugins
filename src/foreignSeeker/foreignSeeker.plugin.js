/**
 * @name foreignSeeker
 * @author foreignSeal
 * @authorLink https://github.com/foreignSeal
 * @version 1.0.0
 * @description A way to look at server channels in a foreign way.
 * @website https://github.com/foreignSeal/BetterDiscord-plugins
 * @source https://github.com/foreignSeal/BetterDiscord-plugins/tree/master/src/foreignSeeker/foreignSeeker.plugin.js
 */

MediaSourceHandle.exports = class foreignSeeker {

  // 🦭 ┊  Init
  start() {
    this._patchChannelContextMenu();
  }

  stop() {
    BdApi.Patcher.unpachAll("foreignSeeker");
    document
      .querySelectorAll(".foreign-seeker-item")
      .forEach((el) => el.remove());
  }

  // 🦭 ┊  Patches
  _patchChannelContextMenu() {
    BdApi.ContextMenu.patch("channel-context", (returnValue, props) => {
      const channel = props.channel;
      if (!channel) return;

      const channelName = this._resolveChannelName(channel);

      const copyItem = BdApi.ContextMenu.buildItem({
        label: "Copy Channel Name",
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

      const firstGroup = returnValue?.props?.children?.[0];
      if (firstGroup && Array.isArray(firstGroup.props?.children)) {
        firstGroup.props.children.unshift(copyItem);
      } else {
        const group = BdApi.ContextMenu.buildItem({ type: "separator", })
        returnValue.props.children.push(group, copyItem);
      }
    });
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
      try {
        const UserStore = BdApi.Webpack.getStore("UserStore");
        return "This feature does not support DM Groups yet.";
      } catch {
        return "This feature does not support DM Groups yet.";
      }
    }

    return channel.id; // Fallback ---> Channel ID
  }
};