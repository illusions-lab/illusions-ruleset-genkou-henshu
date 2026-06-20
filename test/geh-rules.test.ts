import { describe, it, expect } from "vitest";

import ruleset from "../src/index";
import manifest from "../manifest.json";
import { createTestContext, CONFIG, lintText } from "./test-kit";

// ---------------------------------------------------------------------------
// Golden tests: manifest.docs positive/negative examples
// ---------------------------------------------------------------------------

describe("ruleset golden examples", () => {
  const rules = ruleset.createRules(createTestContext());
  for (const meta of manifest.rules) {
    describe(meta.ruleId, () => {
      const rule = rules.find((r) => r.id === meta.ruleId);
      it("is built by createRules", () => {
        expect(rule, `rule ${meta.ruleId} not returned by createRules`).toBeDefined();
      });
      it("positive example yields no issue", () => {
        // L2 rules use lintWithTokens; lintText dispatches appropriately.
        expect(lintText(rule!, meta.docs.positiveExample, CONFIG)).toHaveLength(0);
      });
      it("negative example is flagged", () => {
        expect(lintText(rule!, meta.docs.negativeExample, CONFIG).length).toBeGreaterThan(0);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// geh-douin-taishoutaisho — 「対照」と「対象」の混用
// ---------------------------------------------------------------------------

describe("geh-douin-taishoutaisho — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-taishoutaisho")!;

  it("flags 研究対照者", () => {
    const issues = rule().lint("今回の研究対照者は成人100名だ。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags 対照者 when used as 対象者", () => {
    const issues = rule().lint("調査の対照者を募集する。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-douin-taishoutaisho — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-taishoutaisho")!;

  it("leaves 対照実験 alone", () => {
    expect(rule().lint("対照実験を行った。", CONFIG)).toHaveLength(0);
  });

  it("leaves 比較対照 alone", () => {
    expect(rule().lint("比較対照として旧データを用いる。", CONFIG)).toHaveLength(0);
  });

  it("leaves 対照表 alone", () => {
    expect(rule().lint("新旧の対照表を作成した。", CONFIG)).toHaveLength(0);
  });

  it("leaves 対照的 alone", () => {
    expect(rule().lint("二者は対照的な性格だ。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-douin-taishoutaisho — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-taishoutaisho")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("対照者を集める。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-douin-kaitoukaito — 「回答」と「解答」の混用
// ---------------------------------------------------------------------------

describe("geh-douin-kaitoukaito — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kaitoukaito")!;

  it("flags アンケートにご解答", () => {
    const issues = rule().lint("アンケートにご解答ください。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags 質問票に解答", () => {
    const issues = rule().lint("質問票に解答をお願いします。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-douin-kaitoukaito — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kaitoukaito")!;

  it("leaves 試験の解答 alone", () => {
    expect(rule().lint("試験の解答欄を埋めた。", CONFIG)).toHaveLength(0);
  });

  it("leaves アンケートにご回答 alone (already correct)", () => {
    expect(rule().lint("アンケートにご回答ください。", CONFIG)).toHaveLength(0);
  });

  it("leaves 模範解答 alone", () => {
    expect(rule().lint("模範解答を配布した。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-douin-kaitoukaito — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kaitoukaito")!;

  it("does nothing when disabled", () => {
    expect(
      rule().lint("アンケートにご解答ください。", { ...CONFIG, enabled: false }),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-douin-kateikateii — 「過程」と「課程」の混用
// ---------------------------------------------------------------------------

describe("geh-douin-kateikateii — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kateikateii")!;

  it("flags 開発の課程で", () => {
    const issues = rule().lint("開発の課程で問題が生じた。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags 制作の課程", () => {
    const issues = rule().lint("制作の課程が複雑だった。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-douin-kateikateii — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kateikateii")!;

  it("leaves 博士課程 alone", () => {
    expect(rule().lint("博士課程に在学中だ。", CONFIG)).toHaveLength(0);
  });

  it("leaves 教育課程 alone", () => {
    expect(rule().lint("教育課程の改訂が行われた。", CONFIG)).toHaveLength(0);
  });

  it("leaves 開発の過程 alone (already correct)", () => {
    expect(rule().lint("開発の過程で多くの問題が生じた。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-douin-kateikateii — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kateikateii")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("開発の課程で問題が生じた。", { ...CONFIG, enabled: false })).toHaveLength(
      0,
    );
  });
});

// ---------------------------------------------------------------------------
// geh-katakana-trailing-choon — 片仮名末尾長音省略
// ---------------------------------------------------------------------------

describe("geh-katakana-trailing-choon — detections", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-katakana-trailing-choon")!;

  const cases: Array<[string, string]> = [
    ["コンピュータで作業する。", "コンピューター"],
    ["プリンタを接続した。", "プリンター"],
    ["スキャナが必要だ。", "スキャナー"],
    ["モニタの画面が暗い。", "モニター"],
    ["センサを設置した。", "センサー"],
    ["ルータの設定を変更する。", "ルーター"],
    ["サーバに接続できない。", "サーバー"],
    ["フォルダを開く。", "フォルダー"],
  ];

  for (const [text, correct] of cases) {
    it(`flags "${text}" → ${correct}`, () => {
      const issues = rule().lint(text, CONFIG);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].fix?.replacement).toBe(correct);
    });
  }
});

describe("geh-katakana-trailing-choon — false positives", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-katakana-trailing-choon")!;

  it("leaves コンピューター alone (already long vowel)", () => {
    expect(rule().lint("コンピューターで作業する。", CONFIG)).toHaveLength(0);
  });

  it("leaves プリンターの設定 alone", () => {
    expect(rule().lint("プリンターの設定を変更した。", CONFIG)).toHaveLength(0);
  });

  it("leaves サーバーに接続 alone", () => {
    expect(rule().lint("サーバーに接続できない。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-katakana-trailing-choon — behavior", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-katakana-trailing-choon")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("コンピュータを使う。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });

  it("reports each occurrence independently", () => {
    const issues = rule().lint("コンピュータとプリンタを用意する。", CONFIG);
    expect(issues).toHaveLength(2);
    expect(issues[0].from).toBeLessThan(issues[1].from);
  });
});

// ---------------------------------------------------------------------------
// geh-bangou-range-hyphen — 数値範囲のハイフン
// ---------------------------------------------------------------------------

describe("geh-bangou-range-hyphen — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bangou-range-hyphen")!;

  it("flags 12-15ページ", () => {
    const issues = rule().lint("12-15ページを参照のこと。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("12〜15");
  });

  it("flags 1895-1970年", () => {
    const issues = rule().lint("1895-1970年の出来事を調べた。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags 3-5章", () => {
    const issues = rule().lint("3-5章の内容を確認する。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-bangou-range-hyphen — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bangou-range-hyphen")!;

  it("leaves 12〜15ページ alone (already correct)", () => {
    expect(rule().lint("12〜15ページを参照のこと。", CONFIG)).toHaveLength(0);
  });

  it("leaves 12—15ページ alone (em-dash, correct)", () => {
    expect(rule().lint("12—15ページを参照のこと。", CONFIG)).toHaveLength(0);
  });

  it("leaves standalone digits without range unit alone", () => {
    // 「2024年5月」のようなケースは range ではない
    expect(rule().lint("2024年5月に実施した。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-bangou-range-hyphen — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bangou-range-hyphen")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("12-15ページを参照。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-gaisuu-arabic — 概数のアラビア数字
// ---------------------------------------------------------------------------

describe("geh-gaisuu-arabic — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-gaisuu-arabic")!;

  it("flags 数10名", () => {
    expect(rule().lint("数10名の参加者が集まった。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 数100個", () => {
    expect(rule().lint("数100個の部品が必要だ。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 何10回", () => {
    expect(rule().lint("何10回も試みた。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 100余人", () => {
    expect(rule().lint("100余人が参加した。", CONFIG).length).toBeGreaterThan(0);
  });
});

describe("geh-gaisuu-arabic — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-gaisuu-arabic")!;

  it("leaves 数十名 alone (correct kanji)", () => {
    expect(rule().lint("数十名の参加者が集まった。", CONFIG)).toHaveLength(0);
  });

  it("leaves 百余人 alone (correct kanji)", () => {
    expect(rule().lint("百余人が参加した。", CONFIG)).toHaveLength(0);
  });

  it("leaves 500余り alone (suffix 余り is OK)", () => {
    expect(rule().lint("500余りの点数だった。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-gaisuu-arabic — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-gaisuu-arabic")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("数10名が来た。", { ...CONFIG, enabled: false })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-bracket-mismatch — かぎ括弧の対応
// ---------------------------------------------------------------------------

describe("geh-bracket-mismatch — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bracket-mismatch")!;

  it("flags unclosed 「", () => {
    const issues = rule().lint("彼は「今日はいい天気だと言った。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags orphaned 」", () => {
    const issues = rule().lint("彼は今日はいい天気だ」と言った。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-bracket-mismatch — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bracket-mismatch")!;

  it("leaves matched brackets alone", () => {
    expect(rule().lint("彼は「今日はいい天気だ」と言った。", CONFIG)).toHaveLength(0);
  });

  it("leaves nested brackets alone when balanced", () => {
    expect(
      rule().lint("「私は『吾輩は猫である』を読んだ」と彼は言った。", CONFIG),
    ).toHaveLength(0);
  });

  it("leaves text without any brackets alone", () => {
    expect(rule().lint("今日は晴れている。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-bracket-mismatch — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bracket-mismatch")!;

  it("does nothing when disabled", () => {
    expect(
      rule().lint("彼は「今日はいい天気だと言った。", { ...CONFIG, enabled: false }),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-nijuu-bracket-mismatch — 二重かぎ括弧の対応
// ---------------------------------------------------------------------------

describe("geh-nijuu-bracket-mismatch — detections", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-nijuu-bracket-mismatch")!;

  it("flags unclosed 『", () => {
    const issues = rule().lint("『吾輩は猫であるを読んだ。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("flags orphaned 』", () => {
    const issues = rule().lint("吾輩は猫である』を読んだ。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("geh-nijuu-bracket-mismatch — false positives", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-nijuu-bracket-mismatch")!;

  it("leaves matched 『』 alone", () => {
    expect(rule().lint("『吾輩は猫である』を読んだ。", CONFIG)).toHaveLength(0);
  });

  it("leaves text without 『』 alone", () => {
    expect(rule().lint("今日は晴れている。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-nijuu-bracket-mismatch — behavior", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-nijuu-bracket-mismatch")!;

  it("does nothing when disabled", () => {
    expect(
      rule().lint("『吾輩は猫であるを読んだ。", { ...CONFIG, enabled: false }),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-douin-kateikateii — 助詞介在による lookahead すり抜け修正
// ---------------------------------------------------------------------------

describe("geh-douin-kateikateii — false positives (extended)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-kateikateii")!;

  it("leaves 研究の課程を修了 alone (助詞「を」介在)", () => {
    // 「研究の課程を修了した」は正用：研究課程を修了したという意味
    expect(rule().lint("研究の課程を修了した。", CONFIG)).toHaveLength(0);
  });

  it("leaves 開発の課程に在学 alone (在学は正用)", () => {
    expect(rule().lint("博士開発の課程に在学中だ。", CONFIG)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-douin-taishoutaisho — 統計用語の 対照者 は誤検出しない
// ---------------------------------------------------------------------------

describe("geh-douin-taishoutaisho — false positives (extended)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-taishoutaisho")!;

  it("leaves 比較対照者 alone (統計の正用語)", () => {
    expect(rule().lint("比較対照者を20名設けた。", CONFIG)).toHaveLength(0);
  });

  it("leaves 無処置対照者 alone (臨床試験の正用語)", () => {
    expect(rule().lint("無処置対照者との比較を行った。", CONFIG)).toHaveLength(0);
  });

  it("leaves 健常対照者 alone (医学の正用語)", () => {
    expect(rule().lint("健常対照者のデータを収集した。", CONFIG)).toHaveLength(0);
  });

  // 通常の「対照者」は依然として誤検出として検出される
  it("still flags 対照者 without qualifier (likely misuse)", () => {
    expect(rule().lint("対照者を集める。", CONFIG).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// geh-katakana-trailing-choon — 複合語への誤検出修正
// ---------------------------------------------------------------------------

describe("geh-katakana-trailing-choon — false positives (extended)", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-katakana-trailing-choon")!;

  it("leaves モニタリング alone (compound starting with モニタ)", () => {
    expect(rule().lint("モニタリングシステムを導入した。", CONFIG)).toHaveLength(0);
  });

  it("leaves センサリー alone (compound starting with センサ)", () => {
    expect(rule().lint("センサリー評価を実施した。", CONFIG)).toHaveLength(0);
  });

  it("leaves プリンタブル alone (compound starting with プリンタ)", () => {
    expect(rule().lint("プリンタブルな形式で出力した。", CONFIG)).toHaveLength(0);
  });

  it("leaves アダプタブル alone (compound starting with アダプタ)", () => {
    expect(rule().lint("アダプタブルな設計が求められる。", CONFIG)).toHaveLength(0);
  });

  // 単独の モニタ 等は引き続き検出する
  it("still flags モニタ alone (no following katakana)", () => {
    expect(rule().lint("モニタの画面が暗い。", CONFIG).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// geh-gaisuu-arabic — 余波・余地等の誤検出修正
// ---------------------------------------------------------------------------

describe("geh-gaisuu-arabic — false positives (extended)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-gaisuu-arabic")!;

  it("leaves 10余波 alone (余波 is a compound noun)", () => {
    expect(rule().lint("その事件の10余波が今も続いている。", CONFIG)).toHaveLength(0);
  });

  it("leaves 10余地 alone (余地 is a compound noun)", () => {
    expect(rule().lint("まだ10余地がある。", CONFIG)).toHaveLength(0);
  });

  it("leaves 10余裕 alone (余裕 is a compound noun)", () => {
    expect(rule().lint("10余裕をもって臨んだ。", CONFIG)).toHaveLength(0);
  });

  // 通常の 概数+余 は引き続き検出する
  it("still flags 100余人 (legitimate approximate number)", () => {
    expect(rule().lint("100余人が参加した。", CONFIG).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// geh-hojo-verb-l2 — 補助動詞の仮名書き（L2）
// ---------------------------------------------------------------------------

import type { Token } from "illusions-lint-sdk";

/**
 * Hand-crafted mock token sequences for L2 rule tests.
 * Using Token interface fields: surface, pos, pos_detail_1, basic_form, start, end.
 */
function makeTeVerbTokens(
  mainVerb: { surface: string; basicForm: string },
  auxVerb: { surface: string; basicForm: string },
): ReadonlyArray<Token> {
  const mainEnd = mainVerb.surface.length;
  return [
    { surface: mainVerb.surface, pos: "動詞", basic_form: mainVerb.basicForm, start: 0, end: mainEnd },
    { surface: "て", pos: "助詞", pos_detail_1: "接続助詞", start: mainEnd, end: mainEnd + 1 },
    { surface: auxVerb.surface, pos: "動詞", basic_form: auxVerb.basicForm, start: mainEnd + 1, end: mainEnd + 1 + auxVerb.surface.length },
    { surface: "。", pos: "記号", start: mainEnd + 1 + auxVerb.surface.length, end: mainEnd + 2 + auxVerb.surface.length },
  ];
}

describe("geh-hojo-verb-l2 — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-verb-l2")!;

  it("flags て行く (auxiliary 行く after て)", () => {
    const tokens = makeTeVerbTokens(
      { surface: "増え", basicForm: "増える" },
      { surface: "行く", basicForm: "行く" },
    );
    const text = "増えて行く。";
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("いく");
  });

  it("flags て来る (auxiliary 来る after て)", () => {
    const tokens = makeTeVerbTokens(
      { surface: "なっ", basicForm: "なる" },
      { surface: "来る", basicForm: "来る" },
    );
    const text = "なって来る。";
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("くる");
  });

  it("flags て仕舞う (auxiliary 仕舞う after て)", () => {
    const tokens = makeTeVerbTokens(
      { surface: "書い", basicForm: "書く" },
      { surface: "仕舞う", basicForm: "仕舞う" },
    );
    const text = "書いて仕舞う。";
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("しまう");
  });

  it("flags て置く (auxiliary 置く after て)", () => {
    const tokens = makeTeVerbTokens(
      { surface: "通知し", basicForm: "通知する" },
      { surface: "置く", basicForm: "置く" },
    );
    const text = "通知して置く。";
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("おく");
  });
});

describe("geh-hojo-verb-l2 — false positives (standalone main verbs)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-verb-l2")!;

  it("leaves 行く alone when standalone (main verb, no preceding て)", () => {
    // 「図書館に行く」 — 行く is a main verb, not preceded by て
    const tokens: ReadonlyArray<Token> = [
      { surface: "図書館", pos: "名詞", start: 0, end: 3 },
      { surface: "に", pos: "助詞", pos_detail_1: "格助詞", start: 3, end: 4 },
      { surface: "行く", pos: "動詞", basic_form: "行く", start: 4, end: 6 },
      { surface: "。", pos: "記号", start: 6, end: 7 },
    ];
    const text = "図書館に行く。";
    expect((rule() as any).lintWithTokens(text, tokens, CONFIG)).toHaveLength(0);
  });

  it("leaves 来る alone when standalone (main verb, no preceding て)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "春", pos: "名詞", start: 0, end: 1 },
      { surface: "が", pos: "助詞", pos_detail_1: "格助詞", start: 1, end: 2 },
      { surface: "来る", pos: "動詞", basic_form: "来る", start: 2, end: 4 },
      { surface: "。", pos: "記号", start: 4, end: 5 },
    ];
    const text = "春が来る。";
    expect((rule() as any).lintWithTokens(text, tokens, CONFIG)).toHaveLength(0);
  });

  it("leaves いく alone when already kana (no issue)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "増え", pos: "動詞", basic_form: "増える", start: 0, end: 2 },
      { surface: "て", pos: "助詞", pos_detail_1: "接続助詞", start: 2, end: 3 },
      { surface: "いく", pos: "動詞", basic_form: "いく", start: 3, end: 5 },
      { surface: "。", pos: "記号", start: 5, end: 6 },
    ];
    const text = "増えていく。";
    expect((rule() as any).lintWithTokens(text, tokens, CONFIG)).toHaveLength(0);
  });
});

describe("geh-hojo-verb-l2 — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-verb-l2")!;

  it("does nothing when disabled", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "増え", pos: "動詞", basic_form: "増える", start: 0, end: 2 },
      { surface: "て", pos: "助詞", pos_detail_1: "接続助詞", start: 2, end: 3 },
      { surface: "行く", pos: "動詞", basic_form: "行く", start: 3, end: 5 },
      { surface: "。", pos: "記号", start: 5, end: 6 },
    ];
    const text = "増えて行く。";
    expect((rule() as any).lintWithTokens(text, tokens, { ...CONFIG, enabled: false })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// EDGE-CASE ADDITIONS
// ---------------------------------------------------------------------------

// geh-douin-taishoutaisho — 対照群 should not trigger (正用)
describe("geh-douin-taishoutaisho — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-douin-taishoutaisho")!;

  it("leaves 対照群 alone (clinical trial terminology)", () => {
    // 「対照群」は実験の比較グループとして正当な専門語
    expect(rule().lint("プラセボ投与の対照群と比較した。", CONFIG)).toHaveLength(0);
  });

  it("leaves 内部対照者 alone (nested lookbehind qualifier)", () => {
    expect(rule().lint("内部対照者との差異を検定した。", CONFIG)).toHaveLength(0);
  });

  it("flags 支援の対照者 (誤用パターン — 支援対象者 が正しい)", () => {
    expect(rule().lint("この施策の支援の対照者は高齢者に限定する。", CONFIG).length).toBeGreaterThan(0);
  });
});

// geh-katakana-trailing-choon — カレンダ・アダプタ・シリンダ の単体検出
describe("geh-katakana-trailing-choon — edge cases (additional words)", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-katakana-trailing-choon")!;

  it("flags カレンダ alone (no following katakana)", () => {
    const issues = rule().lint("壁のカレンダを確認した。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("カレンダー");
  });

  it("flags アダプタ alone (no following katakana)", () => {
    const issues = rule().lint("電源アダプタが必要だ。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("アダプター");
  });

  it("flags シリンダ alone (no following katakana)", () => {
    const issues = rule().lint("エンジンのシリンダを交換した。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("シリンダー");
  });

  it("leaves カレンダー alone (already long vowel)", () => {
    expect(rule().lint("壁のカレンダーを確認した。", CONFIG)).toHaveLength(0);
  });
});

// geh-bangou-range-hyphen — 頁 unit and year-abbreviation patterns
describe("geh-bangou-range-hyphen — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-bangou-range-hyphen")!;

  it("flags 3-10頁 (頁 is a recognized unit)", () => {
    const issues = rule().lint("3-10頁の内容を読んだ。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("leaves 2-D or 3-D alone (no numeric right side followed by unit)", () => {
    // 「2-D」は規格名・略称で数値範囲ではない — 右辺 D は非数字なのでパターン不一致
    expect(rule().lint("2-Dグラフィックスを使用した。", CONFIG)).toHaveLength(0);
  });

  it("leaves plain arithmetic expression alone (no unit word)", () => {
    // 「12-5」のみでは単位語が後続しないので検出しない
    expect(rule().lint("計算式 12-5 の結果は7だ。", CONFIG)).toHaveLength(0);
  });

  it("flags 100-200cm (cm is a recognized unit)", () => {
    const issues = rule().lint("製品は100-200cmのサイズに対応する。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });
});

// geh-gaisuu-arabic — 500余円 should be flagged (book: 「500余円とはしない」)
describe("geh-gaisuu-arabic — edge cases (boundary conditions)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-gaisuu-arabic")!;

  it("flags 500余円 (the book prohibits this pattern)", () => {
    // 「500余円」は禁止 — 「余り」は許容だが「余」後に別語が続く場合は不可
    expect(rule().lint("500余円を費やした。", CONFIG).length).toBeGreaterThan(0);
  });

  it("leaves 数 alone with no following Arabic digit (false-positive guard)", () => {
    // 「数の問題」— 「数」だけで後ろにアラビア数字なし
    expect(rule().lint("数の問題を解いた。", CONFIG)).toHaveLength(0);
  });

  it("flags 何100年 (「何」+ アラビア数字)", () => {
    expect(rule().lint("何100年も続く伝統だ。", CONFIG).length).toBeGreaterThan(0);
  });
});

// geh-hojo-verb-l2 — で (接続助詞) + auxiliary verb detection
describe("geh-hojo-verb-l2 — edge cases (で接続助詞)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-verb-l2")!;

  it("flags で貰う (auxiliary 貰う after で)", () => {
    // 「で」接続助詞 + 補助動詞「貰う」も検出対象
    const text = "依頼して貰う。";
    const tokens: ReadonlyArray<Token> = [
      { surface: "依頼し", pos: "動詞", basic_form: "依頼する", start: 0, end: 3 },
      { surface: "て", pos: "助詞", pos_detail_1: "接続助詞", start: 3, end: 4 },
      { surface: "貰う", pos: "動詞", basic_form: "貰う", start: 4, end: 6 },
      { surface: "。", pos: "記号", start: 6, end: 7 },
    ];
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("もらう");
  });

  it("flags で上げる (auxiliary 上げる after で)", () => {
    const text = "運んで上げる。";
    const tokens: ReadonlyArray<Token> = [
      { surface: "運ん", pos: "動詞", basic_form: "運ぶ", start: 0, end: 2 },
      { surface: "で", pos: "助詞", pos_detail_1: "接続助詞", start: 2, end: 3 },
      { surface: "上げる", pos: "動詞", basic_form: "上げる", start: 3, end: 6 },
      { surface: "。", pos: "記号", start: 6, end: 7 },
    ];
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("あげる");
  });

  it("leaves 上げる alone when preceded by 格助詞 not 接続助詞", () => {
    // 「に上げる」 — 「に」は格助詞、接続助詞でない
    const text = "段位に上げる。";
    const tokens: ReadonlyArray<Token> = [
      { surface: "段位", pos: "名詞", start: 0, end: 2 },
      { surface: "に", pos: "助詞", pos_detail_1: "格助詞", start: 2, end: 3 },
      { surface: "上げる", pos: "動詞", basic_form: "上げる", start: 3, end: 6 },
      { surface: "。", pos: "記号", start: 6, end: 7 },
    ];
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-keishiki-meishi-l2 — 形式名詞の仮名書き（L2）
// ---------------------------------------------------------------------------

/**
 * Hand-crafted mock token sequences for geh-keishiki-meishi-l2 tests.
 * All tokens use the Token interface fields: surface, pos, pos_detail_1, start, end.
 * "非自立" = formal noun (keishiki meishi); "一般" = concrete noun.
 */

/** Build a token sequence representing a formal-noun usage (名詞-非自立). */
function makeKeishikiMeishiTokens(
  prefix: string,
  nounSurface: string,
  suffix: string,
): ReadonlyArray<Token> {
  const prefixEnd = prefix.length;
  const nounEnd = prefixEnd + nounSurface.length;
  const suffixEnd = nounEnd + suffix.length;
  const tokens: Token[] = [];
  if (prefix.length > 0) {
    tokens.push({ surface: prefix, pos: "動詞", start: 0, end: prefixEnd });
  }
  tokens.push({ surface: nounSurface, pos: "名詞", pos_detail_1: "非自立", start: prefixEnd, end: nounEnd });
  if (suffix.length > 0) {
    tokens.push({ surface: suffix, pos: "助詞", pos_detail_1: "格助詞", start: nounEnd, end: suffixEnd });
  }
  return tokens;
}

/** Build a token sequence representing a concrete noun (名詞-一般). */
function makeIpanMeishiTokens(
  nounSurface: string,
): ReadonlyArray<Token> {
  return [
    { surface: nounSurface, pos: "名詞", pos_detail_1: "一般", start: 0, end: nounSurface.length },
    { surface: "。", pos: "記号", start: nounSurface.length, end: nounSurface.length + 1 },
  ];
}

describe("geh-keishiki-meishi-l2 — detections (positive triggers)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  it("flags 事 as formal noun (名詞-非自立)", () => {
    const tokens = makeKeishikiMeishiTokens("しない", "事", "がある");
    const issues = (rule() as any).lintWithTokens("しない事がある。", tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("こと");
    expect(issues[0].from).toBe("しない".length);
  });

  it("flags 時 as formal noun (名詞-非自立)", () => {
    const tokens = makeKeishikiMeishiTokens("事故の", "時", "は");
    const issues = (rule() as any).lintWithTokens("事故の時は。", tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("とき");
  });

  it("flags 所 as formal noun (名詞-非自立)", () => {
    const tokens = makeKeishikiMeishiTokens("現在の", "所", "差し支えない");
    const issues = (rule() as any).lintWithTokens("現在の所差し支えない。", tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("ところ");
  });

  it("flags 物 as formal noun (名詞-非自立)", () => {
    const tokens = makeKeishikiMeishiTokens("正しい", "物", "と");
    const issues = (rule() as any).lintWithTokens("正しい物と認める。", tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("もの");
  });

  it("flags 訳 as formal noun (名詞-非自立)", () => {
    const tokens = makeKeishikiMeishiTokens("賛成する", "訳", "には");
    const issues = (rule() as any).lintWithTokens("賛成する訳には。", tokens, CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].fix?.replacement).toBe("わけ");
  });
});

describe("geh-keishiki-meishi-l2 — false positives (非自立 vs 一般 discrimination)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  it("leaves 事 alone when tagged as 名詞-一般 (concrete noun)", () => {
    // 「事」単独だが pos_detail_1 が "一般" の場合は実質名詞として除外
    const tokens = makeIpanMeishiTokens("事");
    const issues = (rule() as any).lintWithTokens("事。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });

  it("leaves 事件 alone (compound word — kuromoji tags as 一般)", () => {
    // 「事件」は複合語として 名詞-一般 でタグ付けされる
    const tokens: ReadonlyArray<Token> = [
      { surface: "事件", pos: "名詞", pos_detail_1: "一般", start: 0, end: 2 },
      { surface: "が", pos: "助詞", pos_detail_1: "格助詞", start: 2, end: 3 },
      { surface: "起きた", pos: "動詞", start: 3, end: 6 },
      { surface: "。", pos: "記号", start: 6, end: 7 },
    ];
    const issues = (rule() as any).lintWithTokens("事件が起きた。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });

  it("leaves 時間 alone (compound word — 名詞-一般)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "時間", pos: "名詞", pos_detail_1: "一般", start: 0, end: 2 },
      { surface: "が", pos: "助詞", pos_detail_1: "格助詞", start: 2, end: 3 },
      { surface: "ない", pos: "助動詞", start: 3, end: 5 },
      { surface: "。", pos: "記号", start: 5, end: 6 },
    ];
    const issues = (rule() as any).lintWithTokens("時間がない。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });

  it("leaves 場所 alone (compound word — 名詞-一般)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "場所", pos: "名詞", pos_detail_1: "一般", start: 0, end: 2 },
      { surface: "を", pos: "助詞", pos_detail_1: "格助詞", start: 2, end: 3 },
      { surface: "確認する", pos: "動詞", start: 3, end: 7 },
      { surface: "。", pos: "記号", start: 7, end: 8 },
    ];
    const issues = (rule() as any).lintWithTokens("場所を確認する。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });

  it("leaves 物語 alone (compound word — 名詞-一般)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "物語", pos: "名詞", pos_detail_1: "一般", start: 0, end: 2 },
      { surface: "を", pos: "助詞", pos_detail_1: "格助詞", start: 2, end: 3 },
      { surface: "読む", pos: "動詞", start: 3, end: 5 },
      { surface: "。", pos: "記号", start: 5, end: 6 },
    ];
    const issues = (rule() as any).lintWithTokens("物語を読む。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });

  it("leaves already-kana こと alone (no kanji to flag)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "し", pos: "動詞", start: 0, end: 1 },
      { surface: "ない", pos: "助動詞", start: 1, end: 3 },
      { surface: "こと", pos: "名詞", pos_detail_1: "非自立", start: 3, end: 5 },
      { surface: "が", pos: "助詞", pos_detail_1: "格助詞", start: 5, end: 6 },
      { surface: "ある", pos: "動詞", start: 6, end: 8 },
      { surface: "。", pos: "記号", start: 8, end: 9 },
    ];
    const issues = (rule() as any).lintWithTokens("しないことがある。", tokens, CONFIG);
    expect(issues).toHaveLength(0);
  });
});

describe("geh-keishiki-meishi-l2 — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  it("does nothing when disabled", () => {
    const tokens = makeKeishikiMeishiTokens("しない", "事", "がある");
    const issues = (rule() as any).lintWithTokens("しない事がある。", tokens, { ...CONFIG, enabled: false });
    expect(issues).toHaveLength(0);
  });

  it("reports multiple formal-noun violations in one sentence", () => {
    // 「この事は、その時に解決するわけだ」 — 事・時・訳 が全て 非自立
    const tokens: ReadonlyArray<Token> = [
      { surface: "この", pos: "連体詞", start: 0, end: 2 },
      { surface: "事", pos: "名詞", pos_detail_1: "非自立", start: 2, end: 3 },
      { surface: "は", pos: "助詞", pos_detail_1: "係助詞", start: 3, end: 4 },
      { surface: "、", pos: "記号", start: 4, end: 5 },
      { surface: "その", pos: "連体詞", start: 5, end: 7 },
      { surface: "時", pos: "名詞", pos_detail_1: "非自立", start: 7, end: 8 },
      { surface: "に", pos: "助詞", pos_detail_1: "格助詞", start: 8, end: 9 },
      { surface: "解決する", pos: "動詞", start: 9, end: 13 },
      { surface: "訳", pos: "名詞", pos_detail_1: "非自立", start: 13, end: 14 },
      { surface: "だ", pos: "助動詞", start: 14, end: 15 },
      { surface: "。", pos: "記号", start: 15, end: 16 },
    ];
    const text = "この事は、その時に解決する訳だ。";
    const issues = (rule() as any).lintWithTokens(text, tokens, CONFIG);
    expect(issues).toHaveLength(3);
    expect(issues[0].fix?.replacement).toBe("こと");
    expect(issues[1].fix?.replacement).toBe("とき");
    expect(issues[2].fix?.replacement).toBe("わけ");
    // Check ascending order
    expect(issues[0].from).toBeLessThan(issues[1].from);
    expect(issues[1].from).toBeLessThan(issues[2].from);
  });
});

// geh-nijuu-bracket-mismatch — edge cases
describe("geh-nijuu-bracket-mismatch — edge cases", () => {
  const rule = () =>
    ruleset
      .createRules(createTestContext())
      .find((r) => r.id === "geh-nijuu-bracket-mismatch")!;

  it("flags multiple unclosed 『 — reports only the first", () => {
    // 「『a』と『b」のように2番目が未閉で最初の不対応のみ報告する
    const issues = rule().lint("『甲』と『乙を比較した。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].from).toBe("『甲』と".length); // 2番目の 『 位置
  });

  it("leaves 『』 inside 「」 alone when both balanced", () => {
    expect(
      rule().lint("「『源氏物語』は平安文学の傑作だ」と述べた。", CONFIG),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// geh-keishiki-meishi-l2 — 形式名詞の仮名書き（L2、非自立タグで判別）
// （geh-hojo-kanji 廃止に伴い、形式名詞検出はこのL2に一本化。専用テストを復元）
// ---------------------------------------------------------------------------

describe("geh-keishiki-meishi-l2 — detections (非自立)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  const FORMAL: ReadonlyArray<[string, string]> = [
    ["事", "こと"],
    ["時", "とき"],
    ["所", "ところ"],
    ["物", "もの"],
    ["訳", "わけ"],
  ];

  for (const [kanji, kana] of FORMAL) {
    it(`flags 非自立 「${kanji}」 → 「${kana}」`, () => {
      const tokens: ReadonlyArray<Token> = [
        { surface: "する", pos: "動詞", basic_form: "する", start: 0, end: 2 },
        { surface: kanji, pos: "名詞", pos_detail_1: "非自立", start: 2, end: 2 + kanji.length },
        {
          surface: "が",
          pos: "助詞",
          pos_detail_1: "格助詞",
          start: 2 + kanji.length,
          end: 3 + kanji.length,
        },
      ];
      const issues = (rule() as any).lintWithTokens(`する${kanji}が`, tokens, CONFIG);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].fix?.replacement).toBe(kana);
    });
  }
});

describe("geh-keishiki-meishi-l2 — false positives (一般/複合語)", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  it("does NOT flag 具体名詞用法の「事」(一般)", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "事", pos: "名詞", pos_detail_1: "一般", start: 0, end: 1 },
      { surface: "を", pos: "助詞", pos_detail_1: "格助詞", start: 1, end: 2 },
      { surface: "起こす", pos: "動詞", basic_form: "起こす", start: 2, end: 5 },
    ];
    expect((rule() as any).lintWithTokens("事を起こす", tokens, CONFIG)).toHaveLength(0);
  });

  it("does NOT flag 複合語 事件/時間/場所/物語 (一般)", () => {
    for (const w of ["事件", "時間", "場所", "物語"]) {
      const tokens: ReadonlyArray<Token> = [
        { surface: w, pos: "名詞", pos_detail_1: "一般", start: 0, end: w.length },
      ];
      expect((rule() as any).lintWithTokens(w, tokens, CONFIG)).toHaveLength(0);
    }
  });

  it("does NOT flag already-kana こと", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "こと", pos: "名詞", pos_detail_1: "非自立", start: 0, end: 2 },
    ];
    expect((rule() as any).lintWithTokens("こと", tokens, CONFIG)).toHaveLength(0);
  });
});

describe("geh-keishiki-meishi-l2 — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-keishiki-meishi-l2")!;

  it("lint() returns [] (L2 は lintWithTokens 経由)", () => {
    expect((rule() as any).lint("する事がある", CONFIG)).toHaveLength(0);
  });

  it("disabled config yields no issues", () => {
    const tokens: ReadonlyArray<Token> = [
      { surface: "事", pos: "名詞", pos_detail_1: "非自立", start: 0, end: 1 },
    ];
    expect(
      (rule() as any).lintWithTokens("事", tokens, { ...CONFIG, enabled: false }),
    ).toHaveLength(0);
  });
});
