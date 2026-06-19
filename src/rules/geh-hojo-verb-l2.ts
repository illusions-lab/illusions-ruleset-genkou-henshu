/**
 * geh-hojo-verb-l2 — 補助動詞の仮名書き検出（形態素解析 L2）
 *
 * 原稿編集 第2版 E 節 6 項では「補助動詞などの類を仮名書きにする」と示し、
 * 次の補助動詞用法を仮名書きとする例が列挙されている：
 *   ……ていく（負担が増えていく）
 *   ……てくる（寒くなってくる）
 *   ……ておく（通知しておく）
 *   ……てみる（見てみる）
 *   ……てしまう（書いてしまう）
 *   ……てあげる（図書を貸してあげる）
 *   ……ていただく（報告していただく）
 *   ……てください（問題点を話してください）
 *
 * 本ルールは形態素解析トークンを利用して「て（接続助詞）」の直後に来る
 * 特定の動詞漢字表記（行く→いく、来る→くる 等）を検出する。
 * L1 の正規表現では「行く」単独の本動詞用法と補助動詞用法を区別できないため、
 * 形態素解析（L2）が必要。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 6 仮名書きが望ましい語
 *
 * 偽陽性回避:
 *   - 直前トークンが「て」「で」（接続助詞 pos_detail_1: '接続助詞'）の場合のみ検出。
 *   - 動詞単独での使用（「図書館へ行く」「春が来る」）は検出しない。
 *   - くださる→ください は固定表現として表面形でマッチする。
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
 * 補助動詞の漢字基本形 → 仮名推奨形 の対応表。
 * basic_form でマッチするためコンジュゲーションに依存しない。
 */
const AUX_VERB_MAP: ReadonlyMap<string, string> = new Map([
  ["行く", "いく"],
  ["来る", "くる"],
  ["置く", "おく"],
  ["見る", "みる"],
  ["仕舞う", "しまう"],
  ["上げる", "あげる"],
  ["貰う", "もらう"],
  ["頂く", "いただく"],
  ["下さる", "ください"], // 表面形「ください」が既に仮名の場合は除外済み
  ["下さい", "ください"],
]);

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 6 仮名書きが望ましい語",
} as const;

/** て/で（接続助詞）かどうかを判定 */
function isTeConjunction(t: Token): boolean {
  return (
    (t.surface === "て" || t.surface === "で") &&
    t.pos === "助詞" &&
    t.pos_detail_1 === "接続助詞"
  );
}

export function createGehHojoVerbL2(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const metaEntry = manifest.rules.find((r) => r.ruleId === "geh-hojo-verb-l2");
  if (!metaEntry) throw new Error("manifest is missing the geh-hojo-verb-l2 rule");

  const { AbstractMorphologicalLintRule } = ctx.bases;
  const { toolkit } = ctx;

  // Capture concrete values so TypeScript sees them as non-nullable inside the class body.
  const ruleId: string = metaEntry.ruleId;
  const nameJa: string = metaEntry.nameJa;
  const descriptionJa: string = metaEntry.descriptionJa;
  const defaultConfig = metaEntry.defaultConfig;
  const ruleMeta = toolkit.toJsonRuleMeta(metaEntry, manifest);

  class GehHojoVerbL2 extends AbstractMorphologicalLintRule {
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

      for (let i = 1; i < tokens.length; i++) {
        const prev = tokens[i - 1];
        const cur = tokens[i];

        // 直前が接続助詞「て/で」でなければスキップ
        if (!isTeConjunction(prev)) continue;

        // 現トークンが動詞かどうか確認
        if (cur.pos !== "動詞") continue;

        // 基本形（basic_form）で補助動詞辞書を引く
        const basicForm = cur.basic_form ?? cur.surface;
        const kanaForm = AUX_VERB_MAP.get(basicForm);
        if (!kanaForm) continue;

        // surface が既に仮名（推奨形）ならスキップ
        if (cur.surface === kanaForm) continue;

        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Auxiliary verb "${cur.surface}" should be written in kana: "${kanaForm}"`,
          messageJa: `原稿編集 第2版に基づき、補助動詞「…て${cur.surface}」の「${cur.surface}」は「${kanaForm}」と仮名書きにします（例：増えていく、書いてしまう）。`,
          from: cur.start,
          to: cur.end,
          originalText: cur.surface,
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

  return new GehHojoVerbL2();
}
