# What Goes Around Comes Around

An interactive presentation about the history of databases, from early record-keeping to modern database systems. It explores how practical problems drive inventions and how SQL and the relational model have absorbed ideas from competing approaches.

## Run the presentation

With Node.js installed, run:

```bash
node presentation/tools/serve.mjs
```

Open <http://127.0.0.1:8765>. The presentation can also be opened directly at [presentation/index.html](presentation/index.html).

Use the arrow keys or click to advance; press `E` to switch between presentation and exploration modes. See the [presentation guide](presentation/README.md) for all controls and implementation details.

## Repository contents

- [presentation/](presentation/): the current presentation, assets, and local tools.
- [docs/](docs/): speaker notes, milestones, sources, and a glossary.

The talk draws on Stonebraker and Pavlo's [*What Goes Around Comes Around... And Around*](https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf). Image attribution is listed in the [image credits](presentation/assets/images/CREDITS.md).
