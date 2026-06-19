/**
 * geh-douin — 同音異義語の誤用検出（対照/対象・回答/解答・過程/課程）
 *
 * 仮名漢字変換で生じやすい同音異義語の取り違えを、固定的な組み合わせ表現を
 * 手がかりに検出する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 8 同音・同訓異義語
 *
 * 偽陽性回避の方針:
 *   - 「対照」誤用: 「研究/調査/実験 + の + 対照」という固定的な連語パターンのみ検出。
 *     「比較対照」「対照表」「対照的」のような正用は対象外。
 *   - 「解答」誤用: 「アンケート/質問票 + に + ご解答/解答」のパターンのみ検出。
 *     「試験の解答」のような正用は対象外。
 *   - 「課程」誤用: 「開発/制作/進行/作業 + の + 課程」のパターンのみ検出。
 *     「博士課程」「教育課程」のような正用は対象外。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

// ---------------------------------------------------------------------------
// geh-douin-taishoutaisho — 「対照」と「対象」の混用
// ---------------------------------------------------------------------------

/**
 * 「対照」が誤って使われやすいパターン:
 *   "研究対照" / "調査対照" / "実験対照" / "～の対照者" / "対照グループ" など
 *   正用の「対照実験」「比較対照」「対照表」は除外する。
 */
const TAISHOU_WRONG_PATTERNS: ReadonlyArray<{ pattern: RegExp; correct: string; hint: string }> = [
  {
    // 「研究/調査/支援 + の + 対照」→「対象」
    pattern: /([研究調査支援対象候補][者者層品]\s*の|[研究調査支援]\s*の)対照(?!実験|比較|表|的|群)/u,
    correct: "対象",
    hint: "「研究/調査の対照」ではなく「対象」",
  },
  {
    // 「対照者」を「対象者」の誤用と見なす（対照者という語は統計文脈で稀に使うが大半は誤用）
    // 「比較対照者」「内部対照者」「無処置対照者」「健常対照者」のような
    // 正当な統計・臨床文脈の用語は negative lookbehind で除外する。
    pattern: /(?<!比較|内部|無処置|健常)対照者/u,
    correct: "対象者",
    hint: "「対照者」は「対象者」の誤用である可能性があります",
  },
];

/**
 * 「解答」誤用: アンケート/質問/問い合わせへの返答には「回答」を使う。
 * 「解答」は問題・試験の答え合わせに使う語。
 * 「ご解答」「ご回答」の混用を先読みで限定して検出。
 */
const KAITOU_WRONG_PATTERNS: ReadonlyArray<{ pattern: RegExp; correct: string; hint: string }> = [
  {
    // 「アンケート/調査票/質問票 + に + ご解答」→「ご回答」
    pattern: /(アンケ[ーート]+|調査票|質問票|質問紙|フォ[ーート]+ム|お問い?合わ?せ)\s*に[、,]?\s*(ご解答|解答)/u,
    correct: "回答",
    hint: "アンケート等への返答は「回答」を使います",
  },
];

/**
 * 「課程」誤用: プロセス・経緯の意味では「過程」を使う。
 * 「課程」は教育課程・カリキュラムの区分を指す語。
 * 「開発/製作/制作/進行/作業/検討 + の + 課程」のパターンを検出。
 */
const KATEI_WRONG_PATTERNS: ReadonlyArray<{ pattern: RegExp; correct: string; hint: string }> = [
  {
    // 「開発/製作/研究 + の + 課程」を検出し「過程」への修正を提案する。
    // 「博士課程を修了」「研究の課程を修了」のように助詞を介して修了・卒業等が
    // 続く場合（正用）は最大8文字以内にそれらが現れれば除外する。
    // また「交渉」の重複を削除。
    pattern: /(開発|制作|製作|研究|進行|作業|検討|議論|交渉|実施|調査|導入)\s*の\s*課程(?![^。\n]{0,8}(修了|終了|入学|在学|卒業))/u,
    correct: "過程",
    hint: "物事の経緯・プロセスは「過程」です（「課程」は教育の区分）",
  },
];

// ---------------------------------------------------------------------------
// Factory: geh-douin-taishoutaisho
// ---------------------------------------------------------------------------

export function createGehDouinTaishoutaisho(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-douin-taishoutaisho");
  if (!meta) throw new Error("manifest is missing the geh-douin-taishoutaisho rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  const REF = {
    standard: "原稿編集 第2版（日本エディタースクール）",
    section: "E b) 8 同音・同訓異義語",
  } as const;

  class GehDouinTaishoutaisho extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, correct, hint } of TAISHOU_WRONG_PATTERNS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: hint,
            messageJa: `原稿編集 第2版に基づき、${hint}。`,
            replacement: (m) => m[0].replace(/対照(?!実験|比較|表|的|群)/, correct),
            reference: REF,
            fixLabelJa: `「${correct}」に修正`,
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehDouinTaishoutaisho(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}

// ---------------------------------------------------------------------------
// Factory: geh-douin-kaitoukaito
// ---------------------------------------------------------------------------

export function createGehDouinKaitoukaito(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-douin-kaitoukaito");
  if (!meta) throw new Error("manifest is missing the geh-douin-kaitoukaito rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  const REF = {
    standard: "原稿編集 第2版（日本エディタースクール）",
    section: "E b) 8 同音・同訓異義語",
  } as const;

  class GehDouinKaitoukaito extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, hint } of KAITOU_WRONG_PATTERNS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: hint,
            messageJa: `原稿編集 第2版に基づき、${hint}。`,
            replacement: (m) => m[0].replace(/解答/, "回答"),
            reference: REF,
            fixLabelJa: `「回答」に修正`,
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehDouinKaitoukaito(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}

// ---------------------------------------------------------------------------
// Factory: geh-douin-kateikateii
// ---------------------------------------------------------------------------

export function createGehDouinKateikateii(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-douin-kateikateii");
  if (!meta) throw new Error("manifest is missing the geh-douin-kateikateii rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  const REF = {
    standard: "原稿編集 第2版（日本エディタースクール）",
    section: "E b) 8 同音・同訓異義語",
  } as const;

  class GehDouinKateikateii extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, hint } of KATEI_WRONG_PATTERNS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: hint,
            messageJa: `原稿編集 第2版に基づき、${hint}。`,
            replacement: (m) => m[0].replace(/課程/, "過程"),
            reference: REF,
            fixLabelJa: `「過程」に修正`,
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehDouinKateikateii(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
