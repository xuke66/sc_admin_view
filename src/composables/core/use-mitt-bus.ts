import {
  OpenThemePanelKey,
  RefreshIFrameKey,
  RefreshPageKey,
} from "@/common/config";
import { mittBus } from "@/common/utils";

export const useMittBus = () => {
  /**
   * 刷新当前页面
   */
  const refreshPage = (value?: boolean) => mittBus.emit(RefreshPageKey, value);
  /**
   * 打开主题面板
   */
  const openThemePanel = () => mittBus.emit(OpenThemePanelKey);

  /**
   * 刷新当前 IFrame 页面
   */
  const refreshIFrame = () => mittBus.emit(RefreshIFrameKey);

  return {
    refreshPage,
    openThemePanel,
    refreshIFrame,
  };
};
