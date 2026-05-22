"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "zh";

const STORAGE_KEY = "alphabox.locale";

const dictionary = {
  en: {
    brandCn: "韭菜盒子",
    navLeaders: "Leaders",
    navFeed: "Feed",
    navStudio: "Studio",
    navAdmin: "Admin",
    checkingAccess: "Checking access...",
    adminAccessRequired: "Admin access required",
    adminAccessRequiredCopy: "Only admin users can generate invitation codes.",
    language: "中文",
    logout: "Log out",
    homeEyebrow: "Invitation only",
    homeTitle: "AlphaBox 韭菜盒子",
    homeCopy:
      "Subscribe to experienced market leaders, read their reasoning, and monitor trading signals in one private workspace. AlphaBox is research distribution software, not a broker and not an execution venue.",
    requestAccess: "Request access",
    loginAction: "Login",
    browseLeaders: "Browse leaders",
    privateNetwork: "Private network",
    privateNetworkCopy: "Invitation codes keep the community controlled.",
    signalFeed: "Signal feed",
    signalFeedCopy: "Posts and signals from subscribed leaders ordered by newest first.",
    noExecution: "No trade execution",
    noExecutionCopy: "No broker connection, custody, or account access.",
    publicDirectory: "Public directory",
    leaders: "Leaders",
    loadingLeaders: "Loading leaders...",
    leaderNotFound: "Leader not found.",
    loadingProfile: "Loading profile...",
    viewProfile: "View profile",
    subscribeFree: "Subscribe free",
    recentSignals: "Recent signals",
    posts: "Posts",
    login: "Login",
    email: "Email",
    password: "Password",
    enterAlphaBox: "Enter AlphaBox",
    registerByInvitation: "Register by invitation",
    displayName: "Display name",
    invitationCode: "Invitation code",
    createAccount: "Create account",
    subscriberFeed: "Subscriber feed",
    latestIntelligence: "Latest intelligence",
    subscriptions: "Subscriptions",
    emptyFeed: "Subscribe to leaders to build your feed.",
    yourSubscriptions: "Your subscriptions",
    leaderStudio: "Leader studio",
    publishMarketIntelligence: "Publish market intelligence",
    createLeaderProfile: "Create leader profile",
    handle: "Handle",
    strategy: "Strategy",
    headline: "Headline",
    riskLevel: "Risk level",
    riskLow: "Low",
    riskMedium: "Medium",
    riskHigh: "High",
    bioMethodology: "Bio and methodology",
    createProfile: "Create profile",
    editProfile: "Edit profile",
    saveProfile: "Save profile",
    profileUpdated: "Profile updated.",
    newPost: "New post",
    newPostCopy: "Long-form context, market commentary, portfolio notes.",
    openEditor: "Open editor",
    newSignal: "New signal",
    newSignalCopy: "Structured symbol, side, timeframe, and thesis.",
    openTicket: "Open ticket",
    edit: "Edit",
    save: "Save",
    title: "Title",
    marketContext: "Market context",
    postPublished: "Post published.",
    publishPost: "Publish post",
    symbol: "Symbol",
    side: "Side",
    long: "Long",
    short: "Short",
    watch: "Watch",
    entry: "Entry",
    target: "Target",
    stopLoss: "Stop loss",
    timeframe: "Timeframe",
    signalThesis: "Signal thesis",
    signalPublished: "Signal published.",
    publishSignal: "Publish signal",
    code: "Code",
    archiveSignal: "Archive signal",
    currentPrice: "Current price",
    archiveAndCalculate: "Archive and calculate",
    archived: "Archived",
    returnRate: "Return",
    archivedSignalLocked: "Archived signals cannot be edited.",
    entryPriceRequired: "Entry price is required to calculate return.",
    profileRequired: "Leader profile required",
    profileRequiredCopy: "Create your leader profile before publishing posts or signals.",
    createProfileNow: "Create profile",
    myActivity: "My activity",
    manageActivityCopy: "Review and remove posts or signals you have published.",
    publishedPosts: "Published posts",
    publishedSignals: "Published signals",
    noPublishedPosts: "No posts yet.",
    noPublishedSignals: "No signals yet.",
    remove: "Remove",
    cancel: "Cancel",
    confirmDeletionTitle: "Confirm deletion",
    confirmDeletePost: "Delete this post? This action cannot be undone.",
    confirmDeleteSignal: "Delete this signal? This action cannot be undone.",
    risk: "Risk"
    ,
    invitationAdmin: "Invitation codes",
    invitationAdminCopy: "Generate one-time invitation codes for new users. Admin login is required.",
    count: "Count",
    generateCodes: "Generate codes",
    generatedCodes: "Generated codes",
    copy: "Copy",
    copied: "Copied",
    copyManual: "Code selected. Press Ctrl+C to copy.",
    adminOnlyHint: "Login with an admin account before generating invitation codes.",
    openRegister: "Open register page",
    unused: "Unused",
    used: "Used",
    delete: "Delete",
    usedBy: "Used by",
    createdAt: "Created",
    userManagement: "User management",
    userManagementCopy: "Review user roles, subscription graph, and account status.",
    user: "User",
    role: "Role",
    status: "Status",
    active: "Active",
    banned: "Banned",
    following: "Following",
    followers: "Followers",
    actions: "Actions",
    promoteAdmin: "Promote admin",
    ban: "Ban",
    unban: "Unban",
    noInvitationCodes: "No invitation codes yet.",
    noUsers: "No users yet.",
    adminRole: "Admin",
    leaderRole: "Leader",
    followerRole: "Follower"
  },
  zh: {
    brandCn: "韭菜盒子",
    navLeaders: "牛人",
    navFeed: "动态",
    navStudio: "创作台",
    navAdmin: "后台",
    checkingAccess: "正在检查权限...",
    adminAccessRequired: "需要管理员权限",
    adminAccessRequiredCopy: "只有管理员用户可以生成邀请码。",
    language: "EN",
    logout: "退出登录",
    homeEyebrow: "仅限邀请",
    homeTitle: "AlphaBox 韭菜盒子",
    homeCopy:
      "订阅有经验的市场牛人，查看他们的投资思路、研究文章和交易信号。AlphaBox 只做研究与信号分发，不连接券商账户，也不执行交易。",
    requestAccess: "申请进入",
    loginAction: "登录",
    browseLeaders: "浏览牛人",
    privateNetwork: "私密网络",
    privateNetworkCopy: "通过一次性邀请码控制社区准入。",
    signalFeed: "信号动态",
    signalFeedCopy: "按时间倒序查看已订阅牛人的文章和交易信号。",
    noExecution: "不执行交易",
    noExecutionCopy: "不连接券商、不托管资金、不访问交易账户。",
    publicDirectory: "公开目录",
    leaders: "牛人",
    loadingLeaders: "正在加载牛人...",
    leaderNotFound: "未找到牛人。",
    loadingProfile: "正在加载资料...",
    viewProfile: "查看资料",
    subscribeFree: "免费订阅",
    recentSignals: "最新信号",
    posts: "文章",
    login: "登录",
    email: "邮箱",
    password: "密码",
    enterAlphaBox: "进入 AlphaBox",
    registerByInvitation: "使用邀请码注册",
    displayName: "显示名称",
    invitationCode: "邀请码",
    createAccount: "创建账号",
    subscriberFeed: "订阅动态",
    latestIntelligence: "最新情报",
    subscriptions: "订阅管理",
    emptyFeed: "订阅牛人后，这里会出现你的专属动态。",
    yourSubscriptions: "我的订阅",
    leaderStudio: "牛人创作台",
    publishMarketIntelligence: "发布市场观点",
    createLeaderProfile: "创建牛人资料",
    handle: "用户名",
    strategy: "策略方向",
    headline: "一句话介绍",
    riskLevel: "风险等级",
    riskLow: "低",
    riskMedium: "中",
    riskHigh: "高",
    bioMethodology: "简介与方法论",
    createProfile: "创建资料",
    editProfile: "编辑资料",
    saveProfile: "保存资料",
    profileUpdated: "资料已更新。",
    newPost: "新文章",
    newPostCopy: "发布长文分析、市场评论和组合观察。",
    openEditor: "打开编辑器",
    newSignal: "新信号",
    newSignalCopy: "填写标的、方向、周期和核心逻辑。",
    openTicket: "打开信号单",
    edit: "编辑",
    save: "保存",
    title: "标题",
    marketContext: "市场观点",
    postPublished: "文章已发布。",
    publishPost: "发布文章",
    symbol: "标的",
    side: "方向",
    long: "看多",
    short: "看空",
    watch: "观察",
    entry: "入场价",
    target: "目标价",
    stopLoss: "止损价",
    timeframe: "周期",
    signalThesis: "信号逻辑",
    signalPublished: "信号已发布。",
    publishSignal: "发布信号",
    code: "代码",
    archiveSignal: "归档",
    currentPrice: "当前价格",
    archiveAndCalculate: "归档并计算",
    archived: "已归档",
    returnRate: "收益率",
    archivedSignalLocked: "已归档的信号不能再修改。",
    entryPriceRequired: "需要入场价才能计算收益率。",
    profileRequired: "需要先创建牛人资料",
    profileRequiredCopy: "发布文章或信号前，请先创建你的牛人资料。",
    createProfileNow: "去创建资料",
    myActivity: "我的动态",
    manageActivityCopy: "查看并删除你已经发布的文章或信号。",
    publishedPosts: "已发布文章",
    publishedSignals: "已发布信号",
    noPublishedPosts: "还没有发布文章。",
    noPublishedSignals: "还没有发布信号。",
    remove: "删除",
    cancel: "取消",
    confirmDeletionTitle: "确认删除",
    confirmDeletePost: "确认删除这篇文章吗？删除后不可恢复。",
    confirmDeleteSignal: "确认删除这条信号吗？删除后不可恢复。",
    risk: "风险",
    invitationAdmin: "邀请码管理",
    invitationAdminCopy: "生成一次性邀请码给新用户注册使用。需要管理员账号登录。",
    count: "数量",
    generateCodes: "生成邀请码",
    generatedCodes: "已生成邀请码",
    copy: "复制",
    copied: "已复制",
    copyManual: "已选中邀请码，请按 Ctrl+C 复制。",
    adminOnlyHint: "请先使用管理员账号登录，再生成邀请码。",
    openRegister: "打开注册页",
    unused: "未使用",
    used: "已使用",
    delete: "删除",
    usedBy: "使用者",
    createdAt: "创建时间",
    userManagement: "用户管理",
    userManagementCopy: "查看用户角色、关注关系和账号状态。",
    user: "用户",
    role: "角色",
    status: "状态",
    active: "正常",
    banned: "已封禁",
    following: "关注数",
    followers: "粉丝数",
    actions: "操作",
    promoteAdmin: "提升管理员",
    ban: "封禁",
    unban: "解封",
    noInvitationCodes: "还没有邀请码。",
    noUsers: "还没有用户。",
    adminRole: "管理员",
    leaderRole: "牛人",
    followerRole: "粉丝"
  }
} as const;

type TranslationKey = keyof typeof dictionary.en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    try {
      const queryLocale = new URLSearchParams(window.location.search).get("lang");
      if (queryLocale === "en" || queryLocale === "zh") {
        setLocaleState(queryLocale);
        window.localStorage.setItem(STORAGE_KEY, queryLocale);
        return;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") setLocaleState(stored);
    } catch {
      setLocaleState("zh");
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const setLocale = (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      try {
        window.localStorage.setItem(STORAGE_KEY, nextLocale);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", nextLocale);
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      } catch {
        // Language still switches in-memory when browser storage is unavailable.
      }
    };

    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "zh" ? "en" : "zh"),
      t: (key) => dictionary[locale][key]
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
