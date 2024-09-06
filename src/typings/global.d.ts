export {};

declare global {
  export interface Window {
    /** NProgress instance */
    NProgress?: import('nprogress').NProgress;
    /** Loading bar instance */
    $loadingBar?: import('naive-ui').LoadingBarProviderInst;
    /** Dialog instance */
    $dialog?: import('naive-ui').DialogProviderInst;
    /** Message instance */
    $message?: import('naive-ui').MessageProviderInst;
    /** Notification instance */
    $notification?: import('naive-ui').NotificationProviderInst;
    ssq: any; // 可以更精确地定义 ssq 的类型
    // ssc配置
    __ssc?: {
      // 设置
      setting?: {
        // 是否隐藏图标
        hideIcon?: boolean;
      };
    };
  }

  interface ViewTransition {
    ready: Promise<void>;
  }

  export interface Document {
    startViewTransition?: (callback: () => Promise<void> | void) => ViewTransition;
  }

  /** Build time of the project */
  export const BUILD_TIME: string;
}
