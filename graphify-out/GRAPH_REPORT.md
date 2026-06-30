# Graph Report - C:\Users\DELL\Desktop\myP  (2026-06-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 4 nodes · 4 edges · 2 communities (0 shown, 2 thin omitted)
- Extraction: 50% EXTRACTED · 50% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]

## God Nodes (most connected - your core abstractions)
1. `Django Framework` - 2 edges
2. `React Library` - 2 edges
3. `REST API` - 2 edges
4. `Django-React Integration` - 2 edges

## Surprising Connections (you probably didn't know these)
- `React Library` --references--> `REST API`  [INFERRED]
  AMAN_211pages_Edited_DjangoReact.pdf → AMAN_211pages_Edited_DjangoReact.pdf  _Bridges community 1 → community 0_

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Full Stack Web Architecture** — aman_211pages_edited_djangoreact_django, aman_211pages_edited_djangoreact_react, aman_211pages_edited_djangoreact_rest_api [EXTRACTED 0.95]

## Communities (2 total, 2 thin omitted)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Django Framework` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `React Library` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `REST API` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `REST API` (e.g. with `Django Framework` and `React Library`) actually correct?**
  _`REST API` has 2 INFERRED edges - model-reasoned connections that need verification._