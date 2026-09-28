# 99. 付録: チートシート & 困ったとき

## Claude Code よく使う操作

| やりたいこと | 方法 |
| --- | --- |
| ヘルプ | `/help` |
| 会話をリセット | `/clear` |
| 生成を止める | `Esc` |
| 権限モード切替（Plan/自動承認など） | `Shift+Tab` |
| シェルを直接実行 | 行頭に `!`（例: `!npm test`） |
| スラッシュコマンド一覧 | `/` と打つと候補が出る |

## うまく頼むための "型"

> **背景 → やってほしいこと → 制約 → 完了条件**
>
> 例:「予約キャンセルを作りたい（背景）。store.js に関数を足して(依頼)。
> booking.js のルールはいじらないで(制約)。npm test が通ったら完了(完了条件)」

- **曖昧なとき**は「まず質問して」と頼む
- **大きいとき**は「計画だけ先に」（Plan モード）
- **失敗したとき**はエラー全文をそのまま貼る

## AIDLC の3つのコツ（再掲）

1. 意図を言葉にする
2. 小さく回す
3. 人が承認する

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `claude` が見つからない | `npm install -g @anthropic-ai/claude-code` を再実行 |
| `node -v` が古い/出ない | Node.js 18+ をインストール |
| `npm start` でポート使用中エラー | 既存の `npm start` を止める / `PORT=3001 npm start` |
| ブラウザで一覧が出ない | サーバーが起動しているか、URL が :3000 か確認 |
| 予約したのに残席が変わらない | ページを再読み込み。サーバー再起動でデータは初期化される |
| Claude Code の返答が的外れ | `/clear` で仕切り直し、背景から伝え直す |
| 変更が多すぎて怖い | Plan モードで計画を先に見る / 小さく分けて頼む |

## もっと学ぶには

- コース中に作った `SPEC.md` / `DESIGN.md` は持ち帰って読み返す
- 自分の身近な「毎回やる作業」を1つ、コマンドかフックにしてみる
- `/help` から公式の機能を少しずつ探検する

### 本格的に AIDLC をやるなら（発展）

このコースは広い意味の AIDLC を「体験」する入門です。
チームで本格的に取り入れるなら、**AWS が提唱する方法論「AI-DLC」**と、
その**オープンソース実装フレームワーク `awslabs/aidlc-workflows`** が参考になります。

- AWS AI-DLC は Inception → Construction → Operations の3フェーズ構成
- `aidlc-workflows` は **Claude Code に対応**し、`/aidlc` コマンドで
  承認ゲート付きのワークフローを回せる

参考リンク:

- [AI-Driven Development Life Cycle（AWS DevOps Blog）](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)
- [Open-Sourcing Adaptive Workflows for AI-DLC（AWS DevOps Blog）](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/)
- [awslabs/aidlc-workflows（GitHub）](https://github.com/awslabs/aidlc-workflows)
- [AI-DLC: The AI-Driven Development Lifecycle（IBM）](https://www.ibm.com/think/topics/ai-dlc)
- [What is AIDLC?（Augment Code）](https://www.augmentcode.com/guides/what-is-aidlc-ai)

お疲れさまでした！🎉
