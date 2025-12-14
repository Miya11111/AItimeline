import { Tweet } from '@/stores/tabStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRandomAnimalIcon } from '@/constants/animalIcons';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const modelName = models[modelIndex];

    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const topicInstruction = tabTitle
        ? `「${tabTitle}」に関する最新情報を検索し、それに関する`
        : '';
      const prompt = `${count}個の、${topicInstruction}ランダムなTwitterユーザーとそのツイートを生成してください。
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
  return [
    {
      id: startId,
      image: require('@/assets/icon1.png'),
      name: 'AIユーザー',
      nameId: 'ai_user',
      message: 'ツイート生成に失敗しました。しばらく待ってから再試行してください。',
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
