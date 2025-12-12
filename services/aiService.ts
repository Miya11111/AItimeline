import { TweetType } from '@/components/organisms/tweet';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateTweets(count: number = 5): Promise<TweetType[]> {
  // 429エラー時のフォールバックモデル
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
  ];

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const modelName = models[modelIndex];

    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `${count}個のランダムなTwitterユーザーとそのツイートを生成してください。
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

ツイート内容は現実のTwitterに即して、キラキラしすぎず、絵文字の使用も最小限にしてください。
場合によって、「○○、△△すぎる」などのTwitterでよく使われる構文も使用してください。
また、抽象的な名詞はできるだけ避け、具体的な商品名などの固有名詞を使用してください。

JSONのみを返してください。他の説明は不要です。`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONを抽出（```json ```で囲まれている場合やマークダウンに対応）
    let jsonText = text;

    // マークダウンのコードブロックを削除
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // JSONを抽出（配列またはオブジェクト）
    const jsonMatch = jsonText.match(/[\[\{][\s\S]*[\]\}]/);
    jsonText = jsonMatch ? jsonMatch[0] : '{"tweets":[]}';

    // 余分な改行やスペースを削除
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);

    // Geminiが配列形式で返した場合の処理
    let allTweets: any[] = [];
    if (Array.isArray(parsed)) {
      // 各要素からtweetsを抽出して結合
      parsed.forEach((item: any) => {
        if (item.tweets && Array.isArray(item.tweets)) {
          allTweets = allTweets.concat(item.tweets);
        }
      });
    } else if (parsed.tweets && Array.isArray(parsed.tweets)) {
      // オブジェクト形式の場合
      allTweets = parsed.tweets;
    }

    // 画像はassetsからランダムに割り当て
    const tweets: TweetType[] = allTweets.map((tweet: any) => ({
      ...tweet,
      image: getRandomAvatar(),
    }));

    return tweets;
    } catch (error) {
      // 429エラーの場合は次のモデルへフォールバック
      const errorMessage = error instanceof Error ? error.message : String(error);
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
      image: require('@/assets/icon1.png'),
      name: 'AIユーザー',
      nameId: 'ai_user',
      message: 'ツイート生成に失敗しました。しばらく待ってから再試行してください。',
    },
  ];
}
