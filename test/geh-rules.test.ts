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
// geh-hojo-kanji — 補助的用法の語の漢字表記
// ---------------------------------------------------------------------------

describe("geh-hojo-kanji — detections", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-kanji")!;

  it("flags 許可しない事がある", () => {
    expect(rule().lint("許可しない事がある。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 訳にはいかない", () => {
    expect(rule().lint("賛成する訳にはいかない。", CONFIG).length).toBeGreaterThan(0);
  });
});

describe("geh-hojo-kanji — false positives", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-kanji")!;

  it("leaves こと alone (already kana)", () => {
    expect(rule().lint("許可しないことがある。", CONFIG)).toHaveLength(0);
  });

  it("leaves 事件 alone (compound word)", () => {
    expect(rule().lint("大きな事件が起きた。", CONFIG)).toHaveLength(0);
  });

  it("leaves 事実 alone (compound word)", () => {
    expect(rule().lint("その事実を確認した。", CONFIG)).toHaveLength(0);
  });

  // Issue #1: 訳 lookbehind — 二字熟語内の訳は検出しない
  it("leaves 翻訳が alone (kanji compound — 翻訳)", () => {
    expect(rule().lint("翻訳が必要だ。", CONFIG)).toHaveLength(0);
  });

  it("leaves 和訳する alone (kanji compound — 和訳)", () => {
    expect(rule().lint("原書を和訳する。", CONFIG)).toHaveLength(0);
  });

  it("leaves 英訳には alone (kanji compound — 英訳)", () => {
    expect(rule().lint("英訳には時間がかかる。", CONFIG)).toHaveLength(0);
  });

  it("leaves 意訳も alone (kanji compound — 意訳)", () => {
    expect(rule().lint("意訳も必要だ。", CONFIG)).toHaveLength(0);
  });
});

describe("geh-hojo-kanji — behavior", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "geh-hojo-kanji")!;

  it("does nothing when disabled", () => {
    expect(rule().lint("許可しない事がある。", { ...CONFIG, enabled: false })).toHaveLength(0);
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
