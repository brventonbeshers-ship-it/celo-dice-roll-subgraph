# celo-dice-roll-subgraph

The Graph subgraph for indexing DiceRollV2 contract events on Celo.

## Setup

```bash
npm install
npm run codegen
npm run build
```

## Deploy

```bash
npm run deploy
```

## Queries

```graphql
{
  diceRolls(first: 10, orderBy: timestamp, orderDirection: desc) {
    player
    guess
    result
    win
    timestamp
  }
  userStats(id: "0x...") {
    rolls
    wins
  }
}
```

## License

MIT
