# GatePass Quality Gate

Every production handoff must pass:

```bash
npm run check
npm run lint
npm run prod:build:vite
```

The repository workflow runs those commands on every push and pull request.

The code review must also confirm that public surfaces preserve the controlling sequence:

```text
exterior signal
→ association permission
→ trusted contractor access
→ verified execution
→ permanent association record
```

A passing build does not override the doctrine. A doctrinally incorrect feature is still incorrect even when the code compiles.