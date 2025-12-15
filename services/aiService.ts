import { getRandomAnimalIcon } from '@/constants/animalIcons';
import { Tweet } from '@/stores/tabStore';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// モデルとGoogle Search groundingの設定
// フォールバック戦略: 検索機能付き上位モデル → 検索なし上位モデル → 検索なし軽量モデル
type ModelConfig = {
  model: string;
  useSearch: boolean;
  quota: string;
};

const MODEL_FALLBACK_CHAIN: ModelConfig[] = [
  { model: 'gemini-2.5-flash', useSearch: true, quota: '20/日' },
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
  startId: number = 1,
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

      const topicInstruction = tabTitle
        ? `「${tabTitle}」に関する`
        : "";
      const prompt = `今日は${currentDate}です。${count}個の、${topicInstruction}ランダムなTwitterユーザーとそのツイートを生成してください。
      タイトルに「最新」「速報」「ニュース」などの即時性に関するワードが入っている場合、${useSearch ? "最新の情報（${currentDate}時点）をGoogle検索で調べてください。" : "2024-2025年のトレンドを反映してください。"} 
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
      const groundingTool = {
        googleSearch: {},
      };

      const config = useSearch
        ? {
            tools: [groundingTool],
          }
        : {};

      // 新SDKでのAPI呼び出し
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });

      const text = response.text || '';

      console.log('[generateTweets] Raw AI response:', text);

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
      const tweets: Tweet[] = allTweets.map((tweet: any, index: number) => {
        const baseFavoriteNum = Math.floor(Math.random() * 10001); // 0-10000
        const retweetRatio = 0.05 + Math.random() * 0.15; // 5-20%
        const baseRetweetNum = Math.floor(baseFavoriteNum * retweetRatio);

        return {
          id: startId + index,
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
      // 429エラーの場合は次のモデルへフォールバック
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[generateTweets] Model ${modelName} failed:`, errorMessage);
      console.error('[generateTweets] Full error:', error);

      if (errorMessage.includes('429') && configIndex < MODEL_FALLBACK_CHAIN.length - 1) {
        // 次のモデルを試す前に少し待機
        console.log(`[generateTweets] Retrying with next model...`);
        await sleep(2000);
        continue;
      }

      // その他のエラーまたは最後のモデルでも失敗時
      break;
    }
  }

  // すべてのリトライが失敗した場合
  const errorMsg =
    'すべてのモデルで制限に達しました。フォールバック: gemini-2.5-flash(検索あり,20/日) → gemini-2.5-flash(検索なし,250/日) → gemini-2.5-flash-lite(検索なし,1000/日)。明日の午前9時(太平洋時間0時)にリセットされます。';

  return [
    {
      id: startId,
      image: require('@/assets/icon1.png'),
      name: 'システム通知',
      nameId: 'system',
      message: errorMsg,
      retweetNum: 0,
      favoriteNum: 0,
      impressionNum: 0,
      animalNum: 0,
      animalIconType: getRandomAnimalIcon(),
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      isAnimaled: false,
    },
  ];
}
