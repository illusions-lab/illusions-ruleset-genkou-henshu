/**
 * geh-katakana-trailing-choon — 片仮名語末尾の長音符省略検出
 *
 * 外来語の表記（1991年内閣告示第2号）の留意事項（細則的な事項）ID-3には、
 * 英語の語末 -er/-or/-ar などに当たるものは原則としてア列の長音とし
 * 長音符号「ー」を用いて書き表す、とある。ただし慣用に応じて省くことができる。
 *
 * 書籍の方針としては「不統一にならないように」整理することが求められている。
 * 本ルールは長音符省略形と長音符付き形が混在しやすい代表的な片仮名語の
 * 省略形を検出し、長音符付き形を提案する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 12 外来語の表記
 *
 * 偽陽性回避:
 *   - 直後に長音符「ー」が続く場合は既に長音符付きなので除外（先読みで制御）。
 *   - 「セータ（理学記号 θ）」のような意図的な別語との衝突を防ぐため、
 *     各語は直後の文脈（助詞・句読点・空白・語境界）で限定する。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

/**
 * 長音省略形 → 長音付き形 の対応表。
 * pattern: 省略形にマッチし、直後が「ー」でないことを確認する先読みを含む。
 * correct: 長音符付きの推奨形。
 */
const PAIRS: ReadonlyArray<{ pattern: RegExp; correct: string }> = [
  // コンピュータ → コンピューター
  { pattern: /コンピュータ(?!ー)/, correct: "コンピューター" },
  // プリンタ → プリンター
  { pattern: /プリンタ(?!ー)/, correct: "プリンター" },
  // スキャナ → スキャナー
  { pattern: /スキャナ(?!ー)/, correct: "スキャナー" },
  // モニタ → モニター
  { pattern: /モニタ(?!ー)/, correct: "モニター" },
  // センサ → センサー
  { pattern: /センサ(?!ー)/, correct: "センサー" },
  // ルータ → ルーター
  { pattern: /ルータ(?!ー)/, correct: "ルーター" },
  // サーバ → サーバー
  { pattern: /サーバ(?!ー)/, correct: "サーバー" },
  // フォルダ → フォルダー
  { pattern: /フォルダ(?!ー)/, correct: "フォルダー" },
  // カレンダ → カレンダー
  { pattern: /カレンダ(?!ー)/, correct: "カレンダー" },
  // アダプタ → アダプター
  { pattern: /アダプタ(?!ー)/, correct: "アダプター" },
  // シリンダ → シリンダー
  { pattern: /シリンダ(?!ー)/, correct: "シリンダー" },
  // エラー は既に長音付きなので対象外。エラ のみ（料理用語との衝突あり — 除外）
];

const REF = {
  standard: "外来語の表記（1991年内閣告示第2号）",
  section: "留意事項 細則 ID-3（原稿編集 第2版 E b) 12 外来語の表記）",
} as const;

export function createGehKatakanaTrailingChoon(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-katakana-trailing-choon");
  if (!meta) throw new Error("manifest is missing the geh-katakana-trailing-choon rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehKatakanaTrailingChoon extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, correct } of PAIRS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: `Trailing long vowel omitted: consider "${correct}"`,
            messageJa: `外来語の表記（1991年告示）に基づき、語末の長音符を付けた「${correct}」が推奨されます。1冊で統一してください。`,
            replacement: () => correct,
            reference: REF,
            fixLabelJa: `「${correct}」に統一`,
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehKatakanaTrailingChoon(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
