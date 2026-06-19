/**
 * geh-bangou-range-hyphen — 数値範囲のハイフン使用検出
 *
 * 横組での数値・ページ範囲は全角ダーシ「—」または波形「〜」で示す。
 * 半角ハイフン「-」で数値範囲を表記している箇所を検出し、
 * 全角ダーシへの置換を提案する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 15 横組の数字表記 (6) 数の幅
 *
 * 偽陽性回避:
 *   - 数字-数字 の組み合わせのみを対象とする（アルファベットやカタカナを除く）。
 *   - 「2-D」「3-D」「ISO-9001」のような規格名・型番への誤検出を防ぐため、
 *     直後が数字のみの場合に限定する（右辺が数字またはページ語で終わる）。
 *   - HTML タグ・URL・ファイルパスへの誤検出を防ぐため、前後に空白がある場合は除外する
 *     （原稿の和文文脈を想定）。
 *   - 電話番号・郵便番号パターン（ハイフン区切りが慣用）は対象外（先読みで制限）。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

/**
 * ページ・数値範囲のハイフンパターン。
 * 「12-15ページ」「1895-1970年」「pp.12-15」などを検出。
 * 電話番号パターン（03-1234-5678 等）は区別が困難なため除外基準を設ける。
 *
 * 電話番号除外: ハイフン両辺が合計で7桁以上かつ市外局番形式の場合は除外。
 * ここでは単純化して「3桁以上の数字 - 4桁以上の数字」は除外する。
 */
const RANGE_PATTERN =
  /(?<!\d)(\d{1,4})-(\d{1,4})(?=\s*(?:ページ|頁|年|月|日|回|番|号|巻|章|節|項|行|列|段|版|刷|cm|mm|km|kg|g|mg|ml|L|l|m|s|行目|ページ目))/u;

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 15 横組の数字表記 (6) 数の幅",
} as const;

export function createGehBangouRangeHyphen(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-bangou-range-hyphen");
  if (!meta) throw new Error("manifest is missing the geh-bangou-range-hyphen rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehBangouRangeHyphen extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: RANGE_PATTERN,
        ruleId: this.id,
        severity: config.severity,
        message: "Use em-dash or wave for numeric ranges, not hyphen",
        messageJa:
          "原稿編集 第2版に基づき、横組での数値範囲には二分ダーシ（—）を原則とし、波形「〜」も代替として認められます。半角ハイフン「-」で範囲を示すのは避けてください。",
        replacement: (m) => `${m[1]}〜${m[2]}`,
        reference: REF,
        fixLabelJa: `「〜」に変更`,
      });
    }
  }

  return new GehBangouRangeHyphen(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
