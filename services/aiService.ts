import 'react-native-get-random-values'; // Must be imported before uuid
import { ANIMAL_ICONS, getRandomAnimalIcon } from '@/constants/animalIcons';
import { Tweet } from '@/stores/tabStore';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { getApiKey } from './apiKeyService';

// AIインスタンスを動的に初期化
async function getAI(): Promise<GoogleGenAI> {
  const apiKey = await getApiKey();
  return new GoogleGenAI({ apiKey });
}

// モデルとGoogle Search groundingの設定
// フォールバック戦略: 検索機能付き上位モデル → 検索なし上位モデル → 軽量モデル
// 2025年12月時点のレート制限（無料プラン）:
// - Google Search使用時: 全モデル共通で20/日
// - 検索なし: gemini-2.5-flash (250/日), gemini-2.5-flash-lite (1000/日)
// 注: gemini-1.5-flashは2025年9月29日に廃止されました
type ModelConfig = {
  model: string;
  useSearch: boolean;
  quota: string;
};

// 検索頻度を減らすため、検索なしを優先
const MODEL_FALLBACK_CHAIN: ModelConfig[] = [
  { model: 'gemini-2.5-flash', useSearch: true, quota: '20/日(検索)' },
  { model: 'gemini-2.5-flash', useSearch: false, quota: '250/日' },
  { model: 'gemini-2.5-flash-lite', useSearch: false, quota: '1000/日' },
];

// assetsの画像をランダムに選択
const avatarImages = [
  require('@/assets/icon1.png'),
  require('@/assets/icon2.png'),
  require('@/assets/icon3.png'),
  require('@/assets/icon4.png'),
];

function getRandomAvatar() {
  return avatarImages[Math.floor(Math.random() * avatarImages.length)];
}

// リトライ用のスリープ関数
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateTweets(
  count: number = 5,
  startId: number = 1, // この引数は互換性のため残すが使用しない
  tabTitle?: string
): Promise<Tweet[]> {
  // モデルをフォールバックチェーンに沿って試行
  for (let configIndex = 0; configIndex < MODEL_FALLBACK_CHAIN.length; configIndex++) {
    const config = MODEL_FALLBACK_CHAIN[configIndex];
    const { model: modelName, useSearch, quota } = config;

    try {
      console.log(
        `[generateTweets] Trying ${modelName} (検索: ${useSearch ? 'あり' : 'なし'}, 上限: ${quota})`
      );

      // プロンプトの準備
      const currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const topicInstruction = tabTitle ? `「${tabTitle}」に関する` : '';
      const prompt = `今日は${currentDate}です。${count}個の、${topicInstruction}ランダムなTwitterユーザーとそのツイートを生成してください。
      ${useSearch ? 'タイトルに「本日」「今日」「速報」などの即時性の高いワードが入っている場合のみ、Google検索で最新情報（${currentDate}時点）を調べてください。それ以外の場合は検索せず、2024-2025年の一般的な知識で対応してください。' : '2024-2025年のトレンドを反映してください。'}
各ユーザーは以下の形式のJSONオブジェクトで返してください：
{
  "tweets": [
    {
      "name": "ユーザー名（日本語、3-8文字）",
      "nameId": "ユーザーID（英数字、アンダースコア可）",
      "message": "ツイート内容（日本語、10-140文字）"
    }
  ]
}

ツイート内容は現実のTwitterに即して、キラキラしすぎず、絵文字の使用も最小限にしてください（ツイート内容に応じて使っても構いません）。
場合によって、「○○、△△すぎる」などのTwitterでよく使われる構文も使用してください。
また、抽象的な名詞はできるだけ避け、具体的な商品名などの固有名詞を使用してください。固有名詞は鍵括弧で括らないでください。
ツイート内容は主に短文で生成してください。ランダムに、単語のみ、長文などの他の形式も混ぜてください。
短文や単語のみの場合は句読点をつけないでください。

JSONのみを返してください。他の説明は不要です。`;

      // Google Search grounding 設定（新SDK）
      // 検索頻度を減らすために、プロンプト内で検索使用を制限
      const groundingTool = {
        googleSearch: {},
      };

      const config = useSearch
        ? {
            tools: [groundingTool],
          }
        : {};

      // 新SDKでのAPI呼び出し
      const ai = await getAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });

      const text = response.text || '';

      console.log('[generateTweets] Raw AI response:', text);

      // レスポンスが空の場合は次のモデルを試す
      if (!text || text.trim().length === 0) {
        console.error(`[generateTweets] Empty response from ${modelName}`);
        throw new Error(`Empty response from ${modelName}`);
      }

      // Google Search grounding のメタデータをログ出力（新SDK）
      // 型定義が不完全なため any でアクセス
      if (useSearch) {
        const responseAny = response as any;
        if (responseAny.groundingMetadata || responseAny.candidates?.[0]?.groundingMetadata) {
          const metadata =
            responseAny.groundingMetadata || responseAny.candidates?.[0]?.groundingMetadata;
          console.log('[generateTweets] Grounding metadata:');
          console.log('  - Search queries:', metadata.webSearchQueries);
          console.log('  - Grounding chunks:', metadata.groundingChunks?.length || 0);
          if (metadata.retrievalMetadata?.googleSearchDynamicRetrievalScore) {
            console.log(
              '  - Dynamic retrieval score:',
              metadata.retrievalMetadata.googleSearchDynamicRetrievalScore
            );
          }
        }
      }

      // JSONを抽出（```json ```で囲まれている場合やマークダウンに対応）
      let jsonText = text;

      // マークダウンのコードブロックを削除
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // 複数のJSONオブジェクトが連続している場合、それぞれをパースして結合
      let allTweets: any[] = [];

      // ネストした括弧に対応するため、手動でJSONオブジェクトを分割
      let depth = 0;
      let currentJson = '';
      const jsonObjects: string[] = [];

      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i];

        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
        }

        currentJson += char;

        // トップレベルのオブジェクトが閉じられた
        if (depth === 0 && currentJson.trim().length > 0) {
          jsonObjects.push(currentJson.trim());
          currentJson = '';
        }
      }

      // 各JSONオブジェクトをパース
      jsonObjects.forEach((jsonObj) => {
        try {
          const parsed = JSON.parse(jsonObj);
          if (parsed.tweets && Array.isArray(parsed.tweets)) {
            allTweets = allTweets.concat(parsed.tweets);
          }
        } catch (e) {
          console.warn('[generateTweets] Failed to parse JSON object:', e);
        }
      });

      console.log('[generateTweets] Extracted tweets count:', allTweets.length);

      // 画像はassetsからランダムに割り当て、Tweet型に合わせて変換
      const tweets: Tweet[] = allTweets.map((tweet: any) => {
        const baseFavoriteNum = Math.floor(Math.random() * 10001); // 0-10000
        const retweetRatio = 0.05 + Math.random() * 0.15; // 5-20%
        const baseRetweetNum = Math.floor(baseFavoriteNum * retweetRatio);

        return {
          id: uuidv4(), // UUIDを使用
          image: getRandomAvatar(),
          name: tweet.name,
          nameId: tweet.nameId,
          message: tweet.message,
          retweetNum: baseRetweetNum,
          favoriteNum: baseFavoriteNum,
          impressionNum: Math.floor(baseFavoriteNum * (1.5 + Math.random() * 0.5)), // いいねの1.5-2倍
          animalNum: 0,
          animalIconType: getRandomAnimalIcon(),
          isLiked: false,
          isRetweeted: false,
          isBookmarked: false,
          isAnimaled: false,
        };
      });

      return tweets;
    } catch (error) {
      // エラーメッセージを取得
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error as any;
      const is429Error =
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorObj?.error?.code === 429;
      const is503Error =
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('overloaded') ||
        errorObj?.error?.code === 503;

      if ((is429Error || is503Error) && configIndex < MODEL_FALLBACK_CHAIN.length - 1) {
        // 429/503エラーの場合は静かに次のモデルへフォールバック
        const reason = is429Error ? 'quota exceeded' : 'server overloaded';
        console.log(
          `[generateTweets] ${modelName} ${reason}, trying next model (${MODEL_FALLBACK_CHAIN[configIndex + 1].model})...`
        );
        console.error(`[generateTweets] Error details:`, JSON.stringify(errorObj, null, 2));
        await sleep(1000);
        continue;
      }

      // その他のエラーの場合のみログを出力
      if (!is429Error && !is503Error) {
        console.error(`[generateTweets] Model ${modelName} failed:`, errorMessage);
        console.error(`[generateTweets] Full error object:`, JSON.stringify(errorObj, null, 2));
      }

      // その他のエラーまたは最後のモデルでも失敗時
      break;
    }
  }

  // すべてのリトライが失敗した場合
  const errorMsg = 'AI生成エラー: すべてのモデルで制限に達しました。後でもう一度お試しください。';

  return [
    {
      id: uuidv4(), // UUIDを使用
      image: require('@/assets/icon1.png'),
      name: 'システム通知',
      nameId: 'system',
      message: errorMsg,
      retweetNum: 0,
      favoriteNum: 0,
      impressionNum: 0,
      animalNum: 0,
      animalIconType: ANIMAL_ICONS[0].type,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      isAnimaled: false,
    },
  ];
}

// 複数の返信を生成（5〜10件）
type ReplyTweetData = {
  name: string;
  nameId: string;
  message: string;
};

export async function generateReplyTweets(
  originalMessage: string,
  startId: number = 1 // この引数は互換性のため残すが使用しない
): Promise<Tweet[]> {
  const replyCount = Math.floor(Math.random() * 6) + 5; // 5〜10件

  // モデルをフォールバックチェーンに沿って試行
  for (let configIndex = 0; configIndex < MODEL_FALLBACK_CHAIN.length; configIndex++) {
    const config = MODEL_FALLBACK_CHAIN[configIndex];
    const { model: modelName, useSearch, quota } = config;

    try {
      console.log(
        `[generateReplyTweets] Trying ${modelName} (検索: ${useSearch ? 'あり' : 'なし'}, 上限: ${quota})`
      );

      const prompt = `以下のツイートに対する返信を${replyCount}個生成してください：

「${originalMessage}」

各返信は以下の形式のJSONオブジェクトで返してください：
{
  "tweets": [
    {
      "name": "ユーザー名（日本語、3-8文字）",
      "nameId": "ユーザーID（英数字、アンダースコア可）",
      "message": "返信内容（日本語、10-140文字）"
    }
  ]
}

返信内容は、${originalMessage}が速報系、ネガティブ系である場合は批判的なツイートが、知識系である場合は追加知識が、それ以外の場合は共感が多めで生成してください。
ツイート内容は現実のTwitterに即して、キラキラしすぎず、絵文字の使用も最小限にしてください（ツイート内容に応じて使っても構いません）。
また、抽象的な名詞はできるだけ避け、具体的な商品名などの固有名詞を使用してください。固有名詞は鍵括弧で括らないでください。
ツイート内容は主に短文で生成してください。ランダムに、単語のみ、長文などの他の形式も混ぜてください。

JSONのみを返してください。他の説明は不要です。`;

      const ai = await getAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {},
      });

      const text = response.text || '';

      if (!text || text.trim().length === 0) {
        console.error(`[generateReplyTweets] Empty response from ${modelName}`);
        throw new Error(`Empty response from ${modelName}`);
      }

      console.log('[generateReplyTweets] Raw AI response:', text);

      // JSONを抽出
      let jsonText = text;
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      let allTweets: ReplyTweetData[] = [];

      // JSONオブジェクトを分割してパース
      let depth = 0;
      let currentJson = '';
      const jsonObjects: string[] = [];

      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i];

        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
        }

        currentJson += char;

        if (depth === 0 && currentJson.trim().length > 0) {
          jsonObjects.push(currentJson.trim());
          currentJson = '';
        }
      }

      jsonObjects.forEach((jsonObj) => {
        try {
          const parsed = JSON.parse(jsonObj);
          if (parsed.tweets && Array.isArray(parsed.tweets)) {
            allTweets = allTweets.concat(parsed.tweets);
          }
        } catch (e) {
          console.warn('[generateReplyTweets] Failed to parse JSON object:', e);
        }
      });

      console.log('[generateReplyTweets] Extracted replies count:', allTweets.length);

      // Tweet型に変換
      const tweets: Tweet[] = allTweets.map((tweet: ReplyTweetData) => {
        const baseFavoriteNum = Math.floor(Math.random() * 500); // 0-500（返信なので控えめ）
        const retweetRatio = 0.03 + Math.random() * 0.1; // 3-13%
        const baseRetweetNum = Math.floor(baseFavoriteNum * retweetRatio);

        return {
          id: uuidv4(), // UUIDを使用
          image: getRandomAvatar(),
          name: tweet.name,
          nameId: tweet.nameId,
          message: tweet.message,
          retweetNum: baseRetweetNum,
          favoriteNum: baseFavoriteNum,
          impressionNum: Math.floor(baseFavoriteNum * (1.3 + Math.random() * 0.5)), // いいねの1.3-1.8倍
          animalNum: 0,
          animalIconType: getRandomAnimalIcon(),
          isLiked: false,
          isRetweeted: false,
          isBookmarked: undefined,
          isAnimaled: false,
        };
      });

      return tweets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error as any;
      const is429Error =
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorObj?.error?.code === 429;
      const is503Error =
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('overloaded') ||
        errorObj?.error?.code === 503;

      if ((is429Error || is503Error) && configIndex < MODEL_FALLBACK_CHAIN.length - 1) {
        const reason = is429Error ? 'quota exceeded' : 'server overloaded';
        console.log(
          `[generateReplyTweets] ${modelName} ${reason}, trying next model (${MODEL_FALLBACK_CHAIN[configIndex + 1].model})...`
        );
        console.error(`[generateReplyTweets] Error details:`, JSON.stringify(errorObj, null, 2));
        await sleep(1000);
        continue;
      }

      if (!is429Error && !is503Error) {
        console.error(`[generateReplyTweets] Model ${modelName} failed:`, errorMessage);
        console.error(
          `[generateReplyTweets] Full error object:`,
          JSON.stringify(errorObj, null, 2)
        );
      }

      break;
    }
  }

  // すべてのリトライが失敗した場合
  const errorMsg = 'AI生成エラー: すべてのモデルで制限に達しました。後でもう一度お試しください。';

  return [
    {
      id: uuidv4(), // UUIDを使用
      image: require('@/assets/icon1.png'),
      name: 'システム通知',
      nameId: 'system',
      message: errorMsg,
      retweetNum: 0,
      favoriteNum: 0,
      impressionNum: 0,
      animalNum: 0,
      animalIconType: ANIMAL_ICONS[0].type,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: undefined,
      isAnimaled: false,
    },
  ];
}

// 検索クエリに基づいてツイートを生成
export async function generateSearchTweets(searchQuery: string): Promise<Tweet[]> {
  const tweetCount = Math.floor(Math.random() * 6) + 5; // 5〜10件

  // モデルをフォールバックチェーンに沿って試行
  for (let configIndex = 0; configIndex < MODEL_FALLBACK_CHAIN.length; configIndex++) {
    const config = MODEL_FALLBACK_CHAIN[configIndex];
    const { model: modelName, useSearch, quota } = config;

    try {
      console.log(
        `[generateSearchTweets] Trying ${modelName} (検索: ${useSearch ? 'あり' : 'なし'}, 上限: ${quota})`
      );

      const currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const prompt = `今日は${currentDate}です。「${searchQuery}」に関する詳細な情報を含むツイートを${tweetCount}個生成してください。
${useSearch ? 'Google検索で最新情報（' + currentDate + '時点）を調べて、正確な情報を提供してください。' : '2024-2025年の一般的な知識で対応してください。'}

各ツイートは以下の形式のJSONオブジェクトで返してください：
{
  "tweets": [
    {
      "name": "ユーザー名（日本語、3-8文字）",
      "nameId": "ユーザーID（英数字、アンダースコア可）",
      "message": "ツイート内容（日本語、10-140文字、検索クエリに関する具体的な情報を含む）"
    }
  ]
}

ツイート内容は現実のTwitterに即して、キラキラしすぎず、絵文字の使用も最小限にしてください。
検索クエリに関する具体的な情報、統計、事実、意見などを含めてください。
抽象的な名詞はできるだけ避け、具体的な商品名などの固有名詞を使用してください。固有名詞は鍵括弧で括らないでください。

JSONのみを返してください。他の説明は不要です。`;

      const groundingTool = {
        googleSearch: {},
      };

      const configObj = useSearch
        ? {
            tools: [groundingTool],
          }
        : {};

      const ai = await getAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: configObj,
      });

      const text = response.text || '';

      if (!text || text.trim().length === 0) {
        console.error(`[generateSearchTweets] Empty response from ${modelName}`);
        throw new Error(`Empty response from ${modelName}`);
      }

      console.log('[generateSearchTweets] Raw AI response:', text);

      // JSONを抽出
      let jsonText = text;
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      let allTweets: any[] = [];

      // JSONオブジェクトを分割してパース
      let depth = 0;
      let currentJson = '';
      const jsonObjects: string[] = [];

      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i];

        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
        }

        currentJson += char;

        if (depth === 0 && currentJson.trim().length > 0) {
          jsonObjects.push(currentJson.trim());
          currentJson = '';
        }
      }

      jsonObjects.forEach((jsonObj) => {
        try {
          const parsed = JSON.parse(jsonObj);
          if (parsed.tweets && Array.isArray(parsed.tweets)) {
            allTweets = allTweets.concat(parsed.tweets);
          }
        } catch (e) {
          console.warn('[generateSearchTweets] Failed to parse JSON object:', e);
        }
      });

      console.log('[generateSearchTweets] Extracted tweets count:', allTweets.length);

      // Tweet型に変換
      const tweets: Tweet[] = allTweets.map((tweet: any) => {
        const baseFavoriteNum = Math.floor(Math.random() * 5000); // 0-5000
        const retweetRatio = 0.05 + Math.random() * 0.15; // 5-20%
        const baseRetweetNum = Math.floor(baseFavoriteNum * retweetRatio);

        return {
          id: uuidv4(),
          image: getRandomAvatar(),
          name: tweet.name,
          nameId: tweet.nameId,
          message: tweet.message,
          retweetNum: baseRetweetNum,
          favoriteNum: baseFavoriteNum,
          impressionNum: Math.floor(baseFavoriteNum * (1.5 + Math.random() * 0.5)),
          animalNum: 0,
          animalIconType: getRandomAnimalIcon(),
          isLiked: false,
          isRetweeted: false,
          isBookmarked: false,
          isAnimaled: false,
        };
      });

      return tweets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error as any;
      const is429Error =
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorObj?.error?.code === 429;
      const is503Error =
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('overloaded') ||
        errorObj?.error?.code === 503;

      if ((is429Error || is503Error) && configIndex < MODEL_FALLBACK_CHAIN.length - 1) {
        const reason = is429Error ? 'quota exceeded' : 'server overloaded';
        console.log(
          `[generateSearchTweets] ${modelName} ${reason}, trying next model (${MODEL_FALLBACK_CHAIN[configIndex + 1].model})...`
        );
        await sleep(1000);
        continue;
      }

      if (!is429Error && !is503Error) {
        console.error(`[generateSearchTweets] Model ${modelName} failed:`, errorMessage);
      }

      break;
    }
  }

  // すべてのリトライが失敗した場合
  const errorMsg = 'AI生成エラー: すべてのモデルで制限に達しました。後でもう一度お試しください。';

  return [
    {
      id: uuidv4(),
      image: require('@/assets/icon1.png'),
      name: 'システム通知',
      nameId: 'system',
      message: errorMsg,
      retweetNum: 0,
      favoriteNum: 0,
      impressionNum: 0,
      animalNum: 0,
      animalIconType: ANIMAL_ICONS[0].type,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      isAnimaled: false,
    },
  ];
}
