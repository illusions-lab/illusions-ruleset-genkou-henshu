/**
 * geh-bracket-mismatch — 括弧の対応ズレ検出（かぎ括弧・二重かぎ括弧）
 *
 * 括弧類は起こし（開き）と受け（閉じ）が必ず対応していなければならない。
 * テキスト全体で「」の開閉数が異なる場合、または「』の開閉数が異なる場合を検出する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 19 約物の使い方 ② 括弧類の使用法
 *       「括弧類は、起こしの括弧と受けの括弧が対応しているかどうかを、必ず確認する」
 *
 * 実装メモ:
 *   - L1（正規表現）として実装するため、テキスト全体のカウントを照合する。
 *   - 開き括弧のみ、または閉じ括弧のみが余分にある場合に最初の不対応箇所を報告する。
 *   - 入れ子の正当性（かぎの中のかぎなど）は形態素不要で確認できる範囲に限る。
 *
 * 偽陽性回避:
 *   - 検出は「全文でカウントが不一致」という条件のみ。
 *   - 会話文で意図的に開いたまま終わる（後続段落に続く）ケースは、
 *     本ルールでは段落単位ではなく入力テキスト全体を対象とするため、
 *     段落をまたぐ会話表現では偽陽性が生じる可能性がある（中リスク）。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 19 約物の使い方 ② 括弧類の使用法",
} as const;

// ---------------------------------------------------------------------------
// Factory: geh-bracket-mismatch
// ---------------------------------------------------------------------------

export function createGehBracketMismatch(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-bracket-mismatch");
  if (!meta) throw new Error("manifest is missing the geh-bracket-mismatch rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehBracketMismatch extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];

      const openCount = (text.match(/「/gu) ?? []).length;
      const closeCount = (text.match(/」/gu) ?? []).length;

      if (openCount === closeCount) return [];

      // 不対応がある場合、最初の孤立した括弧の位置を報告する
      const issues: LintIssue[] = [];

      if (openCount > closeCount) {
        // 開き括弧が多い: 最後の開き括弧の位置に警告（閉じ忘れの可能性）
        let depth = 0;
        let lastUnclosedIndex = -1;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "「") {
            depth++;
            lastUnclosedIndex = i;
          } else if (text[i] === "」") {
            depth--;
          }
        }
        if (depth > 0 && lastUnclosedIndex >= 0) {
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: "Opening 「 bracket without matching 」",
            messageJa:
              "原稿編集 第2版に基づき、括弧類は起こしと受けが対応していることを確認してください。「 の閉じ忘れが疑われます。",
            from: lastUnclosedIndex,
            to: lastUnclosedIndex + 1,
            originalText: "「",
            reference: REF,
          });
        }
      } else {
        // 閉じ括弧が多い: 最初の孤立した閉じ括弧を報告
        let depth = 0;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "「") {
            depth++;
          } else if (text[i] === "」") {
            if (depth === 0) {
              issues.push({
                ruleId: this.id,
                severity: config.severity,
                message: "Closing 」 bracket without matching 「",
                messageJa:
                  "原稿編集 第2版に基づき、括弧類は起こしと受けが対応していることを確認してください。対応する「 のない 」 が見つかりました。",
                from: i,
                to: i + 1,
                originalText: "」",
                reference: REF,
              });
              break;
            }
            depth--;
          }
        }
      }

      return toolkit.dedupe(issues);
    }
  }

  return new GehBracketMismatch(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}

// ---------------------------------------------------------------------------
// Factory: geh-nijuu-bracket-mismatch
// ---------------------------------------------------------------------------

export function createGehNijuuBracketMismatch(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-nijuu-bracket-mismatch");
  if (!meta) throw new Error("manifest is missing the geh-nijuu-bracket-mismatch rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehNijuuBracketMismatch extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];

      const openCount = (text.match(/『/gu) ?? []).length;
      const closeCount = (text.match(/』/gu) ?? []).length;

      if (openCount === closeCount) return [];

      const issues: LintIssue[] = [];

      if (openCount > closeCount) {
        let depth = 0;
        let lastUnclosedIndex = -1;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "『") {
            depth++;
            lastUnclosedIndex = i;
          } else if (text[i] === "』") {
            depth--;
          }
        }
        if (depth > 0 && lastUnclosedIndex >= 0) {
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: "Opening 『 bracket without matching 』",
            messageJa:
              "原稿編集 第2版に基づき、二重かぎ括弧の起こし（『）と受け（』）が対応していることを確認してください。『 の閉じ忘れが疑われます。",
            from: lastUnclosedIndex,
            to: lastUnclosedIndex + 1,
            originalText: "『",
            reference: REF,
          });
        }
      } else {
        let depth = 0;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === "『") {
            depth++;
          } else if (text[i] === "』") {
            if (depth === 0) {
              issues.push({
                ruleId: this.id,
                severity: config.severity,
                message: "Closing 』 bracket without matching 『",
                messageJa:
                  "原稿編集 第2版に基づき、対応する『 のない 』 が見つかりました。",
                from: i,
                to: i + 1,
                originalText: "』",
                reference: REF,
              });
              break;
            }
            depth--;
          }
        }
      }

      return toolkit.dedupe(issues);
    }
  }

  return new GehNijuuBracketMismatch(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
