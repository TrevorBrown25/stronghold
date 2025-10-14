"use client";

const CHANNEL_NAME = "stronghold-refresh";
const MESSAGE_TYPE = "refresh";

type RefreshMessage = {
  type: typeof MESSAGE_TYPE;
};

export function broadcastRefresh() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  const message: RefreshMessage = { type: MESSAGE_TYPE };
  channel.postMessage(message);
  channel.close();
}

export function subscribeToRefresh(callback: () => void) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  const handler = (event: MessageEvent<RefreshMessage>) => {
    if (event.data?.type === MESSAGE_TYPE) {
      callback();
    }
  };

  channel.addEventListener("message", handler);

  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
