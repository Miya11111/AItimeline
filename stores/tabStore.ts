import { AnimalIconType } from '@/constants/animalIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type Tweet = {
  id: string; // UUIDに変更
  image: any;
  name: string;
  nameId: string;
  message: string;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
  animalNum: number;
  animalIconType: AnimalIconType; // 表示される動物アイコンの種類
  // ユーザーのインタラクション情報
  isLiked: boolean; // いいねしているか
  isRetweeted: boolean; // リツイートしているか
  isBookmarked: boolean | undefined; // ブックマークしているか
  isAnimaled: boolean; // 動物アイコンを押しているか
};

export type Tab = {
  id: string;
  title: string;
  icon: string;
  tweetIds: string[]; // UUIDに変更
  stockIds: string[]; // UUIDに変更
  isGenerating: boolean; // ツイート生成中かどうか
};

type TabStore = {
  tabs: { [tabId: string]: Tab };
  tweets: { [tweetId: string]: Tweet }; // UUIDに変更
  activeTabId: string;
  tabOrder: string[]; // タブの順序を保持
  isHydrated: boolean; // ストレージからの読み込みが完了したか

  // 既存の関数
  addTweetToTab: (tabId: string, tweet: Tweet) => void;
  removeTweetFromTab: (tabId: string, tweetId: string) => void; // UUIDに変更
  getTweetsForTab: (tabId: string) => Tweet[];
  getActiveTweets: () => Tweet[];
  getActiveTab: () => Tab | undefined;
  getBookmarkedTweets: () => Tweet[];
  setActiveTab: (tabId: string) => void;
  addTab: (tab: Omit<Tab, 'tweetIds' | 'stockIds' | 'isGenerating'>) => void;
  removeTab: (tabId: string) => void;
  getAllTabs: () => Tab[];
  updateTweetInteraction: (
    tweetId: string, // UUIDに変更
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
  reorderTabs: (newOrder: string[]) => void;
  updateTabTitle: (tabId: string, newTitle: string) => void;
  hydrate: () => Promise<void>;

  // 新しいストック管理機能
  addTweetsToStock: (tabId: string, tweets: Tweet[]) => void; // ストックに追加
  loadTweetsFromStock: (tabId: string, count: number) => Tweet[]; // ストックから表示用に移動
  getStockCount: (tabId: string) => number; // ストック数を取得
  setGenerating: (tabId: string, isGenerating: boolean) => void; // 生成中フラグを設定
};

// ストレージキー
const STORAGE_KEYS = {
  TABS: '@tabStore/tabs',
  TAB_ORDER: '@tabStore/tabOrder',
  BOOKMARKED_TWEETS: '@tabStore/bookmarkedTweets',
};

// デフォルトタブ
const DEFAULT_TABS = {
  bookmarks: {
    id: 'bookmarks',
    title: 'ブックマーク',
    icon: 'bookmark',
    tweetIds: [],
    stockIds: [],
    isGenerating: false,
  },
  tab1: {
    id: 'tab1',
    title: '日常の話題',
    icon: 'information-circle-outline',
    tweetIds: [],
    stockIds: [],
    isGenerating: false,
  },
  tab2: {
    id: 'tab2',
    title: '生物雑学',
    icon: 'information-circle-outline',
    tweetIds: [],
    stockIds: [],
    isGenerating: false,
  },
};

const DEFAULT_TAB_ORDER = ['bookmarks', 'tab1', 'tab2'];

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: DEFAULT_TABS,
  tweets: {},
  activeTabId: DEFAULT_TAB_ORDER.find((id) => id !== 'bookmarks') || DEFAULT_TAB_ORDER[1],
  tabOrder: DEFAULT_TAB_ORDER,
  isHydrated: false,

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

      const newTweets = {
        ...state.tweets,
        [tweetId]: {
          ...tweet,
          ...updates,
        },
      };

      // ブックマーク状態が変更された場合は永続化
      if ('isBookmarked' in updates) {
        saveBookmarkedTweets(newTweets);
      }

      return {
        tweets: newTweets,
      };
    }),

  addTab: (tab) =>
    set((state) => {
      const newTabs = {
        ...state.tabs,
        [tab.id]: {
          ...tab,
          tweetIds: [],
          stockIds: [],
          isGenerating: false,
        },
      };
      const newTabOrder = [...state.tabOrder, tab.id];

      // 永続化
      saveTabs(newTabs, newTabOrder);

      return {
        tabs: newTabs,
        tabOrder: newTabOrder,
      };
    }),

  removeTab: (tabId) =>
    set((state) => {
      // ブックマークタブは削除できないようにする
      if (tabId === 'bookmarks') return state;

      const newTabs = { ...state.tabs };
      delete newTabs[tabId];

      const newTabOrder = state.tabOrder.filter((id) => id !== tabId);

      // アクティブタブが削除される場合は、次のタブをアクティブにする
      const newActiveTabId = state.activeTabId === tabId ? newTabOrder[0] || '' : state.activeTabId;

      const newState = {
        tabs: newTabs,
        tabOrder: newTabOrder,
        activeTabId: newActiveTabId,
      };

      // 永続化
      saveTabs(newTabs, newTabOrder);

      return newState;
    }),

  reorderTabs: (newOrder) =>
    set((state) => {
      // ブックマークタブは常に先頭に固定
      const bookmarkIndex = newOrder.indexOf('bookmarks');
      if (bookmarkIndex !== -1 && bookmarkIndex !== 0) {
        // ブックマークタブを削除して先頭に移動
        const reorderedTabs = newOrder.filter((id) => id !== 'bookmarks');
        newOrder = ['bookmarks', ...reorderedTabs];
      } else if (bookmarkIndex === -1) {
        // ブックマークタブが存在しない場合は先頭に追加
        newOrder = ['bookmarks', ...newOrder];
      }

      // 永続化
      saveTabs(state.tabs, newOrder);

      return {
        tabOrder: newOrder,
      };
    }),

  updateTabTitle: (tabId, newTitle) =>
    set((state) => {
      // ブックマークタブのタイトルは変更できない
      if (tabId === 'bookmarks') return state;

      const tab = state.tabs[tabId];
      if (!tab) return state;

      const newTabs = {
        ...state.tabs,
        [tabId]: {
          ...tab,
          title: newTitle,
        },
      };

      // 永続化
      saveTabs(newTabs, state.tabOrder);

      return {
        tabs: newTabs,
      };
    }),

  // ストックに複数のツイートを追加
  addTweetsToStock: (tabId, tweets) =>
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) {
        console.warn(`[addTweetsToStock] Tab ${tabId} not found`);
        return state;
      }

      // 後方互換性のためstockIdsがない場合は空配列を使用
      const currentStockIds = tab.stockIds || [];
      const currentTweetIds = tab.tweetIds || [];

      // 新しいツイートをtweetsストアに追加
      const newTweetsMap = { ...state.tweets };
      const newStockIds = [...currentStockIds];

      tweets.forEach((tweet) => {
        // 既に存在するIDは追加しない
        if (!currentStockIds.includes(tweet.id) && !currentTweetIds.includes(tweet.id)) {
          newTweetsMap[tweet.id] = tweet;
          newStockIds.push(tweet.id);
        }
      });

      console.log(
        `[addTweetsToStock] Added ${newStockIds.length - currentStockIds.length} tweets to stock for ${tabId}`
      );

      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...tab,
            stockIds: newStockIds,
            isGenerating: tab.isGenerating || false, // デフォルト値を設定
          },
        },
        tweets: newTweetsMap,
      };
    }),

  // ストックから指定数のツイートを表示用に移動
  loadTweetsFromStock: (tabId, count) => {
    const state = get();
    const tab = state.tabs[tabId];
    if (!tab) {
      console.warn(`[loadTweetsFromStock] Tab ${tabId} not found`);
      return [];
    }

    // 後方互換性のためstockIdsがない場合は空配列を使用
    const currentStockIds = tab.stockIds || [];
    const currentTweetIds = tab.tweetIds || [];

    // ストックから取得する数を決定
    const actualCount = Math.min(count, currentStockIds.length);
    const loadIds = currentStockIds.slice(0, actualCount);
    const remainingStockIds = currentStockIds.slice(actualCount);

    console.log(`[loadTweetsFromStock] Loading ${actualCount} tweets from stock for ${tabId}`);

    // 表示用に移動
    set((state) => ({
      tabs: {
        ...state.tabs,
        [tabId]: {
          ...tab,
          tweetIds: [...currentTweetIds, ...loadIds],
          stockIds: remainingStockIds,
          isGenerating: tab.isGenerating || false,
        },
      },
    }));

    // 移動したツイートを返す
    return loadIds.map((id) => state.tweets[id]).filter((tweet) => tweet !== undefined);
  },

  // ストック数を取得
  getStockCount: (tabId) => {
    const state = get();
    const tab = state.tabs[tabId];
    if (!tab) return 0;
    return (tab.stockIds || []).length;
  },

  // 生成中フラグを設定
  setGenerating: (tabId, isGenerating) =>
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      return {
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...tab,
            isGenerating,
          },
        },
      };
    }),

  hydrate: async () => {
    try {
      // タブとタブ順序を読み込み
      const [tabsJson, tabOrderJson, bookmarkedTweetsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TABS),
        AsyncStorage.getItem(STORAGE_KEYS.TAB_ORDER),
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_TWEETS),
      ]);

      const loadedTabs = tabsJson ? JSON.parse(tabsJson) : null;
      const loadedTabOrder = tabOrderJson ? JSON.parse(tabOrderJson) : null;
      const loadedBookmarkedTweets = bookmarkedTweetsJson ? JSON.parse(bookmarkedTweetsJson) : [];

      // ブックマークタブが存在することを保証
      const tabs = loadedTabs || DEFAULT_TABS;
      if (!tabs.bookmarks) {
        tabs.bookmarks = DEFAULT_TABS.bookmarks;
      }

      // 既存のタブにstockIdsとisGeneratingを追加（マイグレーション）
      Object.keys(tabs).forEach((tabId) => {
        if (!tabs[tabId].stockIds) {
          tabs[tabId].stockIds = [];
        }
        if (tabs[tabId].isGenerating === undefined) {
          tabs[tabId].isGenerating = false;
        }
      });

      const tabOrder = loadedTabOrder || DEFAULT_TAB_ORDER;
      if (!tabOrder.includes('bookmarks')) {
        tabOrder.unshift('bookmarks');
      }

      // ブックマークされたツイートを復元（既存のツイートとマージ）
      const currentState = get();
      const tweets: { [tweetId: string]: Tweet } = { ...currentState.tweets };
      loadedBookmarkedTweets.forEach((tweet: Tweet) => {
        tweets[tweet.id] = tweet;
      });

      // ブックマーク以外の最初のタブをアクティブタブに設定
      const firstNonBookmarkTab = tabOrder.find((id: string) => id !== 'bookmarks') || tabOrder[1];

      console.log('[hydrate] Successfully loaded tabs:', Object.keys(tabs));

      set({
        tabs,
        tabOrder,
        tweets,
        activeTabId: firstNonBookmarkTab,
        isHydrated: true,
      });
    } catch (error) {
      console.error('Failed to load from storage:', error);
      set({ isHydrated: true });
    }
  },
}));

// ヘルパー関数: タブとタブ順序を保存
const saveTabs = async (tabs: { [tabId: string]: Tab }, tabOrder: string[]) => {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs)),
      AsyncStorage.setItem(STORAGE_KEYS.TAB_ORDER, JSON.stringify(tabOrder)),
    ]);
  } catch (error) {
    console.error('Failed to save tabs:', error);
  }
};

// ヘルパー関数: ブックマークされたツイートを保存
const saveBookmarkedTweets = async (tweets: { [tweetId: string]: Tweet }) => {
  try {
    const bookmarkedTweets = Object.values(tweets).filter((tweet) => tweet.isBookmarked);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_TWEETS, JSON.stringify(bookmarkedTweets));
  } catch (error) {
    console.error('Failed to save bookmarked tweets:', error);
  }
};
