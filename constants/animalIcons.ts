// 動物アイコンの設定（weightの合計は100推奨）
export const ANIMAL_ICONS = [
  { type: 'paw', name: '肉球', weight: 30 },
  { type: 'cat', name: '猫', weight: 20 },
  { type: 'dog', name: '犬', weight: 20 },
  { type: 'dove', name: 'ハト', weight: 10 },
  { type: 'fish', name: '魚', weight: 10 },
  { type: 'frog', name: 'カエル', weight: 5 },
  { type: 'horse', name: '馬', weight: 4 },
  { type: 'kiwi-bird', name: 'キウイ', weight: 0.9 },
  { type: 'dragon', name: 'ドラゴン', weight: 0.09 },
  { type: 'child', name: '人間', weight: 0.01 },
] as const;

// ANIMAL_ICONSから型を自動生成
export type AnimalIconType = (typeof ANIMAL_ICONS)[number]['type'];

export type AnimalIcon = {
  type: AnimalIconType;
  name: string; // 日本語表示名
  weight: number; // 出現率（重み）
};

// ランダムに動物アイコンを選択
export function getRandomAnimalIcon(): AnimalIconType {
  const totalWeight = ANIMAL_ICONS.reduce((sum, icon) => sum + icon.weight, 0);
  let random = Math.random() * totalWeight;

  for (const icon of ANIMAL_ICONS) {
    random -= icon.weight;
    if (random <= 0) {
      return icon.type;
    }
  }

  return ANIMAL_ICONS[0].type;
}

// 動物アイコンタイプから表示名を取得
export function getAnimalIconName(type: AnimalIconType): string {
  return ANIMAL_ICONS.find((icon) => icon.type === type)?.name || '';
}
