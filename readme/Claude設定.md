# Claude Code Configuration

このドキュメントではClaude Codeの設定とhooksについて説明します。

## 設定ファイルの場所

`.claude/config.json` - Claude Codeの設定ファイル

## Hooks

### post-tool-use.sh

ファイル変更後に自動的に`npm run check`を実行します。

**実行タイミング:**

- `Edit`ツール使用後（ファイル編集）
- `Write`ツール使用後（ファイル作成）
- `NotebookEdit`ツール使用後（Notebookファイル編集）

**動作:**

1. Prettierでコードを自動フォーマット
2. ESLintでlintチェックを実行
3. エラーがあれば表示

## カスタムインストラクション

### ファイル整理ルール

- すべてのREADMEファイルとドキュメントファイル(\*.md)は`readme/`ディレクトリに格納
- 新しいREADMEやドキュメントファイルを作成する際は、必ず`readme/`フォルダに配置
- ファイル命名規則: 日本語または英語で分かりやすい名前を使用（例: `readme/色の設定.md`, `readme/hooks設定.md`）
- 例外: ルートのREADME.mdは例外

## 設定の永続化

この設定はプロジェクトの`.claude`ディレクトリに保存されているため、Claude Code再起動後も保持されます。

## 無効化する場合

hookを一時的に無効にしたい場合は、以下のファイルをリネームしてください：

```bash
mv .claude/hooks/post-tool-use.sh .claude/hooks/post-tool-use.sh.disabled
```

再度有効化：

```bash
mv .claude/hooks/post-tool-use.sh.disabled .claude/hooks/post-tool-use.sh
```
