import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import { DiceRolled } from "../generated/DiceRollV2/DiceRollV2";
import { DiceRoll, UserStats, DailyStats, GlobalStats } from "../generated/schema";

const ZERO = BigInt.fromI32(0);
const ONE = BigInt.fromI32(1);

function getDayId(timestamp: BigInt): string {
  let daySeconds = BigInt.fromI32(86400);
  let dayIndex = timestamp.div(daySeconds);
  return dayIndex.toString();
}

export function handleDiceRolled(event: DiceRolled): void {
  // Create DiceRoll entity
  let roll = new DiceRoll(event.transaction.hash.concatI32(event.logIndex.toI32()));
  roll.player = event.params.player;
  roll.guess = event.params.guess;
  roll.result = event.params.result;
  roll.win = event.params.win;
  roll.blockNumber = event.block.number;
  roll.timestamp = event.block.timestamp;
  roll.transactionHash = event.transaction.hash;
  roll.save();

  // Update UserStats
  let userId = event.params.player;
  let userStats = UserStats.load(userId);
  if (userStats == null) {
    userStats = new UserStats(userId);
    userStats.rolls = ZERO;
    userStats.wins = ZERO;
    userStats.lastRoll = ZERO;
    userStats.lastResult = ZERO;
    userStats.winRate = BigDecimal.fromString("0");
  }
  userStats.rolls = userStats.rolls.plus(ONE);
  if (event.params.win) {
    userStats.wins = userStats.wins.plus(ONE);
  }
  userStats.lastRoll = event.params.guess;
  userStats.lastResult = event.params.result;
  userStats.winRate = userStats.wins
    .toBigDecimal()
    .div(userStats.rolls.toBigDecimal());
  userStats.save();

  // Update DailyStats
  let dayId = getDayId(event.block.timestamp);
  let dailyStats = DailyStats.load(dayId);
  if (dailyStats == null) {
    dailyStats = new DailyStats(dayId);
    dailyStats.date = dayId;
    dailyStats.rolls = ZERO;
    dailyStats.wins = ZERO;
    dailyStats.uniquePlayers = ZERO;
  }
  dailyStats.rolls = dailyStats.rolls.plus(ONE);
  if (event.params.win) {
    dailyStats.wins = dailyStats.wins.plus(ONE);
  }
  dailyStats.save();

  // Update GlobalStats
  let globalStats = GlobalStats.load("global");
  if (globalStats == null) {
    globalStats = new GlobalStats("global");
    globalStats.totalRolls = ZERO;
    globalStats.totalWins = ZERO;
    globalStats.totalPlayers = ZERO;
  }
  globalStats.totalRolls = globalStats.totalRolls.plus(ONE);
  if (event.params.win) {
    globalStats.totalWins = globalStats.totalWins.plus(ONE);
  }
  globalStats.save();
}
