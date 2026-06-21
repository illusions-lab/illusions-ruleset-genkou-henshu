# Changelog

すべての重要な変更をこのファイルに記録します。
形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、
[Semantic Versioning](https://semver.org/lang/ja/) を採用します。

## [Unreleased]

## [0.4.0] - 2026-06-20

### Changed

- `geh-katakana-trailing-choon`: `applicableModes` を全5モードから `["official", "blog", "academic"]` に変更。カタカナ長音統一は横組スタイルプロファイルに限定（novel/sns 除外）。
- `geh-bangou-range-hyphen`: `applicableModes` を全5モードから `["official", "blog", "academic"]` に変更。出典（原稿編集 第2版 15 横組の数字表記）が横組限定のため novel/sns 除外。
- `geh-gaisuu-arabic`: `applicableModes` を全5モードから `["official", "blog", "academic"]` に変更。横組数字表記統一ルールに合わせ novel/sns 除外。
- `geh-hojo-verb-l2`: `applicableModes` に `"blog"` を追加（`["official", "academic"]` → `["official", "blog", "academic"]`）。他ルールセットとの blog 含有統一に合わせる。
- `geh-keishiki-meishi-l2`: `applicableModes` に `"blog"` を追加（`["official", "academic"]` → `["official", "blog", "academic"]`）。他ルールセットとの blog 含有統一に合わせる。

## [0.1.0] - 2026-06-19

### Added

- 初版。同音語・カタカナ末尾長音・番号範囲ハイフン・概数アラビア数字・補助動詞/形式名詞・括弧整合など全 10 ルール（原稿編集 第2版 準拠）を実装。
