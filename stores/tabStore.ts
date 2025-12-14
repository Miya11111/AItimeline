import { create } from 'zustand';

export type Tweet = {
  id: number;
  image: any;
  name: string;
  nameId: string;
  message: string;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
  animalNum: number;
  // ユーザーのインタラクション情報
  isLiked: boolean; // いいねしているか
  isRetweeted: boolean; // リツイートしているか
  isBookmarked: boolean; // ブックマークしているか
  isAnimaled: boolean; // 動物アイコンを押しているか
};

export type Tab = {
  id: string;
  title: string;
  icon: string;
  tweetIds: number[]; // ツイートIDの配列のみ保持
};

type TabStore = {
  tabs: { [tabId: string]: Tab };
  tweets: { [tweetId: number]: Tweet }; // 全ツイートを正規化して保存
  activeTabId: string;
  tabOrder: string[]; // タブの順序を保持

  addTweetToTab: (tabId: string, tweet: Tweet) => void;
  removeTweetFromTab: (tabId: string, tweetId: number) => void;
  getTweetsForTab: (tabId: string) => Tweet[];
  getActiveTweets: () => Tweet[];
  getActiveTab: () => Tab | undefined;
  getBookmarkedTweets: () => Tweet[];
  setActiveTab: (tabId: string) => void;
  addTab: (tab: Omit<Tab, 'tweetIds'>) => void;
  removeTab: (tabId: string) => void;
  getAllTabs: () => Tab[];
  updateTweetInteraction: (
    tweetId: number,
    updates: Partial<
      Pick<
        Tweet,
        | 'isLiked'
        | 'isRetweeted'
        | 'isBookmarked'
        | 'isAnimaled'
        | 'favoriteNum'
        | 'retweetNum'
        | 'animalNum'
      >
    >
  ) => void;
};

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: {
    bookmarks: {
      id: 'bookmarks',
      title: 'ブックマーク',
      icon: 'bookmark',
      tweetIds: [], // ブックマークタブは動的に取得するため空
    },
    tab1: {
      id: 'tab1',
      title: '日常の話題',
      icon: 'information-circle-outline',
      tweetIds: [],
    },
    tab2: {
      id: 'tab2',
      title: '生物雑学',
      icon: 'information-circle-outline',
      tweetIds: [],
    },
  },
  tweets: {},
  activeTabId: 'tab1',
  tabOrder: ['bookmarks', 'tab1', 'tab2'],

  addTweetToTab: (tabId, tweet) =>
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      // 既に同じIDのツイートが存在する場合は追加しない
      if (tab.tweetIds.includes(tweet.id)) return state;

      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...tab,
            tweetIds: [...tab.tweetIds, tweet.id],
          },
        },
        tweets: {
          ...state.tweets,
          [tweet.id]: tweet,
        },
      };
    }),

  removeTweetFromTab: (tabId, tweetId) =>
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      const newTweetIds = tab.tweetIds.filter((id) => id !== tweetId);

      // このツイートを参照している他のタブがあるかチェック
      const isUsedInOtherTabs = Object.values(state.tabs).some(
        (t) => t.id !== tabId && t.tweetIds.includes(tweetId)
      );

      const newTweets = { ...state.tweets };
      // 他のタブで使われていない場合はツイートも削除
      if (!isUsedInOtherTabs) {
        delete newTweets[tweetId];
      }

      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...tab,
            tweetIds: newTweetIds,
          },
        },
        tweets: newTweets,
      };
    }),

  getTweetsForTab: (tabId) => {
    const state = get();
    const tab = state.tabs[tabId];
    if (!tab) return [];

    return tab.tweetIds
      .map((id) => state.tweets[id])
      .filter((tweet): tweet is Tweet => tweet !== undefined);
  },

  getActiveTweets: () => {
    const state = get();
    return state.getTweetsForTab(state.activeTabId);
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs[state.activeTabId];
  },

  getBookmarkedTweets: () => {
    const state = get();
    return Object.values(state.tweets).filter((tweet) => tweet.isBookmarked);
  },

  setActiveTab: (tabId) => {
    const state = get();
    if (state.tabs[tabId]) {
      set({ activeTabId: tabId });
    }
  },

  getAllTabs: () => {
    const state = get();
    return state.tabOrder
      .map((id) => state.tabs[id])
      .filter((tab): tab is Tab => tab !== undefined);
  },

  updateTweetInteraction: (tweetId, updates) =>
    set((state) => {
      const tweet = state.tweets[tweetId];
      if (!tweet) return state;

      return {
        tweets: {
          ...state.tweets,
          [tweetId]: {
            ...tweet,
            ...updates,
          },
        },
      };
    }),

  addTab: (tab) =>
    set((state) => ({
      tabs: {
        ...state.tabs,
        [tab.id]: {
          ...tab,
          tweetIds: [],
        },
      },
      tabOrder: [...state.tabOrder, tab.id],
    })),

  removeTab: (tabId) =>
    set((state) => {
      // ブックマークタブは削除できないようにする
      if (tabId === 'bookmarks') return state;

      const newTabs = { ...state.tabs };
      delete newTabs[tabId];

      const newTabOrder = state.tabOrder.filter((id) => id !== tabId);

      // アクティブタブが削除される場合は、次のタブをアクティブにする
      const newActiveTabId = state.activeTabId === tabId ? newTabOrder[0] || '' : state.activeTabId;

      return {
        tabs: newTabs,
        tabOrder: newTabOrder,
        activeTabId: newActiveTabId,
      };
    }),
}));
