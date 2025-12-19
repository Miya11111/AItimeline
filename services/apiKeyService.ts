import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'user_gemini_api_key';

/**
 * ユーザーのAPIキーをSecureStoreに保存
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
    console.log('[apiKeyService] API key saved successfully');
  } catch (error) {
    console.error('[apiKeyService] Failed to save API key:', error);
    throw error;
  }
}

/**
 * SecureStoreからユーザーのAPIキーを取得
 * ユーザーキーがなければ.envのキーを返す
 */
export async function getApiKey(): Promise<string> {
  try {
    const userApiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);

    if (userApiKey) {
      console.log('[apiKeyService] Using user-provided API key');
      return userApiKey;
    }

    // ユーザーキーがない場合は.envのキーを使用
    const envApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    console.log('[apiKeyService] Using .env API key');
    return envApiKey;
  } catch (error) {
    console.error('[apiKeyService] Failed to get API key:', error);
    // エラー時は.envのキーを返す
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  }
}

/**
 * ユーザーのAPIキーを削除
 */
export async function deleteApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    console.log('[apiKeyService] API key deleted successfully');
  } catch (error) {
    console.error('[apiKeyService] Failed to delete API key:', error);
    throw error;
  }
}

/**
 * APIキーが有効かどうかをチェック
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // 簡単なリクエストを送信してAPIキーの有効性を確認
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: 'Hello',
    });

    return !!response.text;
  } catch (error) {
    console.error('[apiKeyService] API key validation failed:', error);
    return false;
  }
}

/**
 * ユーザーがAPIキーを設定済みかどうかをチェック
 */
export async function hasUserApiKey(): Promise<boolean> {
  try {
    const userApiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    return !!userApiKey;
  } catch (error) {
    console.error('[apiKeyService] Failed to check user API key:', error);
    return false;
  }
}
