import { describe, it, expect } from "vitest";

import ruleset from "../src/index";
import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";

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
        expect(rule!.lint(meta.docs.positiveExample, CONFIG)).toHaveLength(0);
      });
      it("negative example is flagged", () => {
        expect(rule!.lint(meta.docs.negativeExample, CONFIG).length).toBeGreaterThan(0);
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
