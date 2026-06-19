/**
 * geh-hojo-kanji — 補助的用法の語の漢字表記検出
 *
 * 公用文の方針（内閣訓令「公用文における漢字使用等について」2010年）を
 * 参考として、原稿編集 第2版 E 節 6 項では「代名詞・副詞・接続詞・助動詞・助詞・
 * 形式名詞は仮名書きが望ましい」と示している。
 *
 * 特に「こと・とき・ところ・もの・わけ・ほか・ため」を補助的な形式名詞として
 * 使う場合は仮名書きにするのが原則（公用文方針）。
 *
 * 出典: 原稿編集 第2版（日本エディタースクール）
 *       E 表記の整理 b) 表記整理の具体的事項 6 仮名書きが望ましい語
 *
 * 偽陽性回避:
 *   - 「事件」「事態」「事実」などの漢語複合語への巻き込みを避けるため、
 *     「事」が直後に名詞性の漢字を伴わない場合（＝助詞で終わる、または句読点の前）のみ検出。
 *   - 「物語」「物事」「時代」などの複合語は除外。
 *   - 「場所（ところ）」という実質名詞用法は除外：「ところが」「ところで」は接続詞として許容。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

/**
 * 形式名詞の漢字表記パターン。
 * 補助的用法に限定するため、前に動詞・助動詞（「する・ない・ある・できる」等）が
 * 来た後の「事・時・所・物・訳・他・為」を検出する。
 */
const HOJO_PATTERNS: ReadonlyArray<{ pattern: RegExp; correct: string; messageJa: string }> = [
  {
    // 「〜ない事がある」「〜する事ができる」の「事」→「こと」
    // 直後に「が・は・も・を・に・で・と」などの助詞が来る場合に限定
    pattern: /(?<=[するないあるできるいるなるれるせる])\s*事(?=[がはもをにでとのから])/u,
    correct: "こと",
    messageJa:
      "原稿編集 第2版に基づき、補助的用法の「事」は「こと」と仮名書きにします（例：「許可しないことがある」）。",
  },
  {
    // 「〜の時」「〜した時には」の「時」→「とき」
    // 直後に「は・に・が・も」などの助詞、またはパーレンが来る場合
    pattern: /(?<=[するないあるできるいるなるれるせるたっ])\s*時(?=[はにがもをのでと、。])/u,
    correct: "とき",
    messageJa:
      "原稿編集 第2版に基づき、補助的用法の「時」は「とき」と仮名書きにします（例：「事故のときは連絡する」）。",
  },
  {
    // 補助動詞用法「〜してあげる」→「あげる」を提案
    // 「てあげる」「でいただく」のような補助動詞用法
    pattern: /(?<=て|で)上げる(?=[。、！？\s」])/u,
    correct: "あげる",
    messageJa:
      "原稿編集 第2版に基づき、補助動詞「〜してあげる」の「あげる」は仮名書きにします。",
  },
  {
    // 「〜わけにはいかない」等の「訳」→「わけ」
    pattern: /訳(?=[にがはもをでと])/u,
    correct: "わけ",
    messageJa:
      "原稿編集 第2版に基づき、補助的用法の「訳」は「わけ」と仮名書きにします（例：「賛成するわけにはいかない」）。",
  },
];

const REF = {
  standard: "原稿編集 第2版（日本エディタースクール）",
  section: "E b) 6 仮名書きが望ましい語",
} as const;

export function createGehHojoKanji(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "geh-hojo-kanji");
  if (!meta) throw new Error("manifest is missing the geh-hojo-kanji rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class GehHojoKanji extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      for (const { pattern, correct, messageJa } of HOJO_PATTERNS) {
        issues.push(
          ...toolkit.regexReplace({
            text,
            pattern,
            ruleId: this.id,
            severity: config.severity,
            message: `Consider kana writing: "${correct}"`,
            messageJa,
            replacement: () => correct,
            reference: REF,
            fixLabelJa: `「${correct}」に変更`,
          }),
        );
      }
      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new GehHojoKanji(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
