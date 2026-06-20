/**
 * Ruleset entry point. Builds the single default-exported RulesetModule.
 *
 * - `manifest` is plain data loaded from manifest.json (read without running code).
 * - `createRules(ctx)` builds the concrete rules using SDK tools from `ctx`.
 *
 * Only `import type` from "illusions-lint-sdk"; runtime tools come via `ctx`.
 */
import type { RulesetContext, RulesetModule } from "illusions-lint-sdk";

import manifestJson from "../manifest.json";
import {
  createGehDouinTaishoutaisho,
  createGehDouinKaitoukaito,
  createGehDouinKateikateii,
} from "./rules/geh-douin";
import { createGehKatakanaTrailingChoon } from "./rules/geh-katakana-choon";
import { createGehBangouRangeHyphen } from "./rules/geh-bangou-range-hyphen";
import { createGehGaisuuArabic } from "./rules/geh-gaisuu-arabic";
import { createGehBracketMismatch, createGehNijuuBracketMismatch } from "./rules/geh-bracket-mismatch";
import { createGehHojoVerbL2 } from "./rules/geh-hojo-verb-l2";
import { createGehKeishikiMeishiL2 } from "./rules/geh-keishiki-meishi-l2";

const manifest = manifestJson as RulesetModule["manifest"];

const ruleset: RulesetModule = {
  manifest,
  createRules(ctx: RulesetContext) {
    return [
      createGehDouinTaishoutaisho(ctx, manifest),
      createGehDouinKaitoukaito(ctx, manifest),
      createGehDouinKateikateii(ctx, manifest),
      createGehKatakanaTrailingChoon(ctx, manifest),
      createGehBangouRangeHyphen(ctx, manifest),
      createGehGaisuuArabic(ctx, manifest),
      createGehHojoVerbL2(ctx, manifest),
      createGehKeishikiMeishiL2(ctx, manifest),
      createGehBracketMismatch(ctx, manifest),
      createGehNijuuBracketMismatch(ctx, manifest),
    ];
  },
};

export default ruleset;
