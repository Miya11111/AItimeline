import { getRandomAnimalIcon } from '@/constants/animalIcons';
import { Tweet } from '@/stores/tabStore';
import { DynamicRetrievalMode, GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Google Search grounding を有効化
// 注意: Google Search を使うとレート制限が厳しくなります
// - gemini-2.5-flash: 1日20リクエスト（検索あり）vs 1500リクエスト（検索なし）
// - gemini-1.5-flash: より緩い制限で利用可能
const USE_GOOGLE_SEARCH = false; // 必要に応じて true に変更

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
  // 429エラー時のフォールバックモデル
  // Google Search使用時: gemini-2.5-flash (20/日) が制限厳しい
  // 検索なし: gemini-2.5-flash-lite (1000/日) が最も余裕がある
  const models = USE_GOOGLE_SEARCH
    ? ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite']
    : ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash'];

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const modelName = models[modelIndex];

    try {
      // Google Search grounding 設定
      const groundingTool = {
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: DynamicRetrievalMode.MODE_DYNAMIC,
            dynamicThreshold: 0.5, // 検索を使う（低いほど検索しやすい）
          },
        },
      };

      const model = USE_GOOGLE_SEARCH
        ? genAI.getGenerativeModel({
            model: modelName,
            tools: [groundingTool],
          })
        : genAI.getGenerativeModel({ model: modelName });

      const currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const topicInstruction = tabTitle
        ? `「${tabTitle}」に関する最新情報（${currentDate}時点）を${USE_GOOGLE_SEARCH ? 'Google検索で調べて、' : ''}それに基づいた`
        : `${USE_GOOGLE_SEARCH ? '最新のトレンドをGoogle検索で調べて、' : ''}`;
      const prompt = `今日は${currentDate}です。${count}個の、${topicInstruction}ランダムなTwitterユーザーとそのツイートを生成してください。
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

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('[generateTweets] Raw AI response:', text);

      // Google Search grounding のメタデータをログ出力
      if (USE_GOOGLE_SEARCH && response.candidates?.[0]?.groundingMetadata) {
        const metadata = response.candidates[0].groundingMetadata;
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

      if (errorMessage.includes('429') && modelIndex < models.length - 1) {
        // 次のモデルを試す前に少し待機
        await sleep(2000);
        continue;
      }

      // その他のエラーまたは最後のモデルでも失敗時
      break;
    }
  }

  // すべてのリトライが失敗した場合
  const errorMsg = USE_GOOGLE_SEARCH
    ? 'Google検索機能を使用すると1日20リクエストまでです。aiService.tsでUSE_GOOGLE_SEARCH=falseに設定すると1日1000リクエスト使えます。'
    : 'API制限に達しました。明日の午前9時(太平洋時間の深夜0時)にリセットされます。';

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
