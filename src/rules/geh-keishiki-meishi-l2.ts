/**
 * geh-keishiki-meishi-l2 — 形式名詞の仮名書き検出（形態素解析 L2）
 *
 * 原稿編集 第2版 E 節 6 項「仮名書きが望ましい語」では、
 * 形式名詞として用いる語を仮名書きにするよう示し、次の用例が列挙されている：
 *   こと（許可しないことがある。）
 *   とき（事故のときは連絡する。）
 *   ところ（現在のところ差し支えない。）
 *   もの（正しいものと認める。）
 *   わけ（賛成するわけにはいかない。）
 *
 * 本ルールは形態素解析トークンを利用して、
 * これらの語が漢字形（事・時・所・物・訳）で書かれているが
 * 形式名詞として用いられている場合に検出する。
 *
 * kuromoji は形式名詞（補助的名詞）に次のタグを与える：
 *   pos: "名詞"
 *   pos_detail_1: "非自立"
 *
 * 実質名詞（具体的な意味を持つ独立した名詞）では
 *   pos_detail_1: "一般" / "固有名詞" / "数" 等
 * が付与されるため、「非自立」タグを使って区別する。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 6 仮名書きが望ましい語
 *
 * 偽陽性回避:
 *   - pos_detail_1 === "非自立" のトークンのみを対象とする。
 *   - 「事件」「時間」「場所」「物語」のような複合語は
 *     kuromoji が別トークン（"一般" 等）として解析するため除外される。
 *   - 漢字形以外（既に仮名書き）はスキップする。
 *
 * L1 ルール geh-hojo-kanji との補完関係:
 *   - geh-hojo-kanji は正規表現で前後文脈をもとに検出するため、
 *     「その事」のような短い文脈や前後助詞のパターンに依存する。
 *   - 本ルールは形態素解析の "非自立" タグを根拠とするため、
 *     前後文脈に依存せず、より高精度に形式名詞用法を特定できる。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
  Token,
} from "illusions-lint-sdk";

/**
 * 形式名詞の漢字表記 → 仮名推奨形 の対応表。
 * 原稿編集 第2版 E b) 6 に列挙された語のみ収録。
 */
const KEISHIKI_MEISHI_MAP: ReadonlyMap<string, string> = new Map([
  ["事", "こと"],
  ["時", "とき"],
  ["所", "ところ"],
  ["物", "もの"],
  ["訳", "わけ"],
]);

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 6 仮名書きが望ましい語",
} as const;

/** 形式名詞タグかどうかを判定（kuromoji: 名詞-非自立） */
function isKeishikiMeishi(t: Token): boolean {
  return t.pos === "名詞" && t.pos_detail_1 === "非自立";
}

export function createGehKeishikiMeishiL2(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const metaEntry = manifest.rules.find((r) => r.ruleId === "geh-keishiki-meishi-l2");
  if (!metaEntry) throw new Error("manifest is missing the geh-keishiki-meishi-l2 rule");

  const { AbstractMorphologicalLintRule } = ctx.bases;
  const { toolkit } = ctx;

  // Capture concrete values so TypeScript sees them as non-nullable inside the class body.
  const ruleId: string = metaEntry.ruleId;
  const nameJa: string = metaEntry.nameJa;
  const descriptionJa: string = metaEntry.descriptionJa;
  const defaultConfig = metaEntry.defaultConfig;
  const ruleMeta = toolkit.toJsonRuleMeta(metaEntry, manifest);

  class GehKeishikiMeishiL2 extends AbstractMorphologicalLintRule {
    readonly id = ruleId;
    readonly name = nameJa;
    readonly nameJa = nameJa;
    readonly description = descriptionJa;
    readonly descriptionJa = descriptionJa;
    readonly level = "L2" as const;
    readonly defaultConfig = defaultConfig;
    readonly engine = "morphological" as const;
    readonly meta = ruleMeta;

    // AbstractLintRule.lint() is required by the interface; L2 rules are invoked via lintWithTokens.
    // Returning [] here is intentional: the runner calls lintWithTokens directly for L2.
    lint(_text: string, _config: LintRuleConfig): LintIssue[] {
      return [];
    }

    lintWithTokens(_text: string, tokens: ReadonlyArray<Token>, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      for (const token of tokens) {
        // 形式名詞タグ（名詞-非自立）のトークンのみを対象とする
        if (!isKeishikiMeishi(token)) continue;

        // 対応表に漢字表記が含まれるかチェック
        const kanaForm = KEISHIKI_MEISHI_MAP.get(token.surface);
        if (!kanaForm) continue;

        // surface が既に仮名（推奨形）ならスキップ（念のため）
        if (token.surface === kanaForm) continue;

        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Formal noun "${token.surface}" should be written in kana: "${kanaForm}"`,
          messageJa: `原稿編集 第2版に基づき、形式名詞「${token.surface}」は「${kanaForm}」と仮名書きにします（例：許可しないことがある、事故のときは連絡する）。`,
          from: token.start,
          to: token.end,
          originalText: token.surface,
          reference: REF,
          fix: {
            label: `Replace with "${kanaForm}"`,
            labelJa: `「${kanaForm}」に変更`,
            replacement: kanaForm,
          },
        });
      }

      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehKeishikiMeishiL2();
}
