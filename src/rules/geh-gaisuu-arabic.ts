/**
 * geh-gaisuu-arabic — 概数のアラビア数字表記検出
 *
 * 横組の一般書では概数（ばくぜんとした数）をアラビア数字で書いてはならない。
 * 「数10名」「100余人」のようにアラビア数字に概数語を組み合わせた表記を検出し、
 * 漢数字化（「数十名」「百余人」）を提案する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 15 横組の数字表記 (7) 不確定数の表記
 *       「数10円、100余人とはしない」と明記されている。
 *
 * 偽陽性回避:
 *   - 「500円余り」は許容（「余り」が後置の場合）なので除外。
 *   - 概数語（数・何・余・数十・十数・百数十）と組み合わせたアラビア数字のみ対象。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

/**
 * アラビア数字＋概数語の禁止パターン。
 * 例: 数10, 数100, 何10, 10余, 100余 (後ろに「り」がない場合)
 */
const GAISUU_PATTERNS: ReadonlyArray<{ pattern: RegExp; messageJa: string }> = [
  {
    // 「数」+アラビア数字: 数10名、数100個
    pattern: /数[0-9]+/u,
    messageJa:
      "原稿編集 第2版に基づき、概数は「数十名」のように漢数字で書きます（「数10名」のようなアラビア数字との組み合わせは避けます）。",
  },
  {
    // 「何」+アラビア数字: 何10回、何100年
    pattern: /何[0-9]+/u,
    messageJa:
      "原稿編集 第2版に基づき、概数は「何十回」のように漢数字で書きます（「何10回」は不可）。",
  },
  {
    // アラビア数字+「余」+（「り」でない）: 100余人、10余年（「100余り」は除外）
    pattern: /[0-9]+余(?!り)/u,
    messageJa:
      "原稿編集 第2版に基づき、概数「100余人」は「百余人」のように漢数字で書きます。",
  },
];

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 15 横組の数字表記 (7) 不確定数の表記",
} as const;

export function createGehGaisuuArabic(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-gaisuu-arabic");
  if (!meta) throw new Error("manifest is missing the geh-gaisuu-arabic rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehGaisuuArabic extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, messageJa } of GAISUU_PATTERNS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: "Approximate numbers should use kanji numerals",
            messageJa,
            replacement: (m) => m[0], // 修正候補は文脈依存のため原文を返す（警告のみ）
            reference: REF,
            fixLabelJa: "漢数字表記に修正（手動）",
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehGaisuuArabic(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
