import { requestUnreadRefresh } from "@/lib/notifications/unread-refresh";

type ToastApi = {
  success: (message: string) => void;
  info?: (message: string) => void;
};

/** Toast + refresh navbar unread badge after actions that may create notifications. */
export function actionSuccessWithNotify(
  toast: ToastApi,
  message: string,
  options?: { info?: boolean },
): void {
  if (options?.info && toast.info) {
    toast.info(message);
  } else {
    toast.success(message);
  }
  requestUnreadRefresh();
}
