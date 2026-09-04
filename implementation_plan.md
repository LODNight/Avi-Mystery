# 1. Executive Summary
Refactor the Learning Map (`/map`) data-fetching layer to resolve N+1 queries and excessive Firestore read operations without breaking existing Avi-Mystery architecture, service contracts, learner state, XP, or security rules. We will introduce a lightweight, materialized `Learning Map Read Model` specifically for the Map View, decoupling it from the heavy Mission payload.

## User Review Required
> [!IMPORTANT]
> Please review this architecture proposal. It ensures the Learning Map becomes highly performant via a derived Read Model while fully protecting existing Firebase rules, learner state, and the source of truth collections.

# 2. Current Architecture
The `/map` data-fetching path currently uses:
```text
LearningMapPage
    ↓
courseService
    ↓
chapterService
    ↓
investigationService
    ↓
missionService fallback
```
Even with `Promise.all`, the client stitches the tree together from multiple collections and over-fetches full Mission content. Fallback logic (`getInvestigations` -> `getMissions`) creates redundant queries.

# 3. Confirmed Problems
- **N+1 query behavior**: Fetching Chapters per Course, then Investigations/Missions per Chapter.
- **Excessive Firestore query operations**: ≈ 16 query operations for the projected 3 courses.
- **Excessive document reads**: ≈ 27 document reads.
- **Over-fetching**: Loading full Mission payloads (SQL queries, starter content, rules) just to render the map structure.
- **Client-side tree stitching**: The browser does heavy joining.
- **Investigation → Mission fallback**: Redundant fallback checks on the client.
- **No dedicated read model**: The UI consumes the source of truth directly.

# 4. Target Architecture
```text
                     FIRESTORE
                         │
             ┌───────────┴───────────┐
             │                       │
      SOURCE OF TRUTH           READ MODEL
             │                       │
   courses / chapters /       learning_map_views
        missions                     │
             │                       │
             └──────────┐   ┌────────┘
                        ↓   ↓
                learningMapService
                        ↓
                 LearningMapPage
                        ↓
                       UI
```
- Mission Detail remains independent (`/missions/:id`).
- Learner state (Progress/XP/Mastery) remains independent and untouched. The Learning Map will not become a combined Content + Progress + XP document.

# 5. Firestore Schema
- **Source of truth collections**: `courses`, `chapters`, `missions`, `investigations`. (PRESERVED)
- **New Read Model collection**: `learning_map_views`.

# 6. Learning Map Read Model
- **Collection**: `learning_map_views`
- **Document ID**: `courseId` (One document per published Course)

Schema Example:
```javascript
{
  courseId: "course-01",
  schemaVersion: 1,
  contentVersion: 17,

  title: "Truy Vấn SQL",
  status: "published",
  order: 1,

  chapters: [
    {
      chapterId: "ch-01",
      title: "Chương 1: Khởi đầu",
      order: 1,
      status: "published",

      nodes: [
        {
          nodeId: "mis-01",
          nodeType: "mission", // Abstraction over Mission/Investigation
          title: "Vụ án 1",
          objective: "Lấy dữ liệu",
          rewardXp: 50,
          tool: "sql",
          order: 1
        }
      ]
    }
  ],

  generatedAt: "2026-09-03T00:00:00Z",
  updatedAt: "2026-09-03T00:00:00Z"
}
```
**RESTRICTION**: The Read Model MUST NOT contain heavy Mission content such as `starterContent`, `story`, `dataset`, `validationRules`, `correctCondition`, `hints`, checker configuration, answer keys, or internal evaluation data.

# 7. Source of Truth
- **Source of Truth**: `courses`, `chapters`, `missions`, `investigations` and any existing canonical content entities.
- **Read Model**: Derived / Materialized View. Read-only for learners.
Duplicate fields have the Source of Truth as the authoritative owner. The Read Model will not become a second independent content database.

# 8. Synchronization Strategy
**Preferred approach**:
```text
Admin Content Service
        ↓
update Source of Truth
        ↓
build Read Model
        ↓
write learning_map_views/{courseId}
```
If the Source of Truth update succeeds but the Read Model write fails, eventual consistency is acceptable because:
- The stale state is detectable.
- Failure is observable.
- Retry/recovery is possible (Admin can trigger a rebuild).
- No silent permanent desynchronization occurs.
No Cloud Functions are introduced.

# 9. Versioning
- **`schemaVersion`**: Defines the structural layout of the `learning_map_views` document. Changes only if the JSON schema evolves.
- **`contentVersion`**: Integer incremented when the Source of Truth is updated and Published.
- **When it changes**: Admin Publish updates it.
- **Detection**: Stale Read Models can be detected by comparing the Read Model's `contentVersion` with the Source of Truth's version flag (or timestamp) if ever needed.

# 10. Admin Content Studio Compatibility
- **Draft Edits**: Admin edits Draft -> Source of Truth updated -> NO learner-visible Read Model update yet.
- **Publishing**: Admin clicks Publish -> Build published Learning Map metadata -> Write `learning_map_views/{courseId}`.
- **Create/Update/Reorder**: Applies to Source of Truth.
- **Delete/Unpublish**: Removes or marks the `learning_map_views` document as unpublished.

# 11. Lazy Loading
- `/map` -> Fetches the Lightweight Learning Map Read Model.
- `/missions/:id` -> Fetches `missionService.getMission(id)` for Full Mission Content.
Existing mission navigation semantics and mission IDs are preserved.

# 12. Cache Strategy
**A. In-flight request deduplication**: 
Prevents duplicate simultaneous fetches (e.g., in React StrictMode). Both requests share the same Promise.
**B. Simple in-memory result cache**:
Avoids refetching during `Map -> Profile -> Map` navigation when cached data is still valid.
*Note: No Zustand, Redux, or SWR will be added initially unless benchmark evidence demonstrates a concrete need.*

# 13. Security
- The Read Model is readable by authenticated users ONLY, as it contains only learner-safe published metadata.
- It exposes NO unpublished content, NO answer keys, NO validation rules, NO internal checker data.
- Existing Mission authorization rules are preserved.
- The existing learner ownership/security model remains intact.

# 14. Service Contracts
Introduce `learningMapService.js`.
Public contract:
```javascript
/**
 * @returns {Promise<{
 *   data: Array<CourseView>,
 *   error: any
 * }>}
 */
async function getLearningMapTree();
```
`LearningMapPage` knows nothing about Firestore collections, queries, Read Model internals, or fallback logic.

# 15. Firestore Read Budget
- **Initial Map reads**: ≈ number of published course documents (e.g., 3 published courses -> approx. 3 document reads). Cost scales primarily with published Courses.
- **Warm navigation**: 0 Firestore reads if a valid cache exists.
- **Mission open**: approx. 1 Mission document read, subject to existing authorization rules.

# 16. Document Size & Scalability
- **Estimated size**: ≈ 100KB for a large course.
- **Warning threshold**: 500 KB (configurable).
- **Hard application threshold**: 900 KB (below Firestore 1 MiB limit).
Initial strategy is One Course → One Map View. If scale requires it later, a split strategy can be documented.

# 17. Migration Plan
1. **Phase 1 — Architecture + Schema**: Finalize schema, contract, versioning, sync, security, and read budget.
2. **Phase 2 — Read Model Builder**: Implement a deterministic `buildLearningMapView()` function.
3. **Phase 3 — Mock Adapter**: Create `mockLearningMapService`.
4. **Phase 4 — Firebase Adapter**: Create `firebase/apiLearningMapService`.
5. **Phase 5 — LearningMapPage Migration**: Replace old fetch with `getLearningMapTree()`.
6. **Phase 6 — Remove Old Map Fetch Path**: Remove Investigation -> Mission fallback from the Map-specific path.
7. **Phase 7 — In-flight Dedup + Cache**: Implement minimum cache layer.
8. **Phase 8 — Benchmark**: Measure performance metrics.
9. **Phase 9 — Regression Testing**: Complete test suite execution.

# 18. Risks
- Read Model write failure -> Mitigated by observable failure and manual Admin rebuild ability.
- Incomplete Firebase/Mock parity -> Mitigated by rigorous contract enforcement for both adapters.

# 19. Alternatives Rejected
- **Merging Collections**: Avoided migrating/merging `investigations` and `missions` to protect existing architecture. Used `nodeType` abstraction instead.
- **Cloud Functions**: Rejected to avoid over-engineering distributed systems.
- **Zustand / SWR**: Rejected to avoid unnecessary technology sprawl.

# 20. ADR
**Decision**: Implement a Materialized Learning Map Read Model (`learning_map_views`) separated by Course. Use `nodeType` to abstract Mission/Investigation without merging source collections. Implement simple in-memory cache and in-flight deduplication. Preserve all existing learner state, XP, and authorization systems.

# 21. Acceptance Criteria
- [ ] `LearningMapPage` uses only `learningMapService.getLearningMapTree()`.
- [ ] No heavy Mission fields leak into the Read Model.
- [ ] `nodeType` abstracts Investigation vs Mission without database migration.
- [ ] Cache deduplicates StrictMode fetches and warm navigations.
- [ ] XP, Progress, Mastery, and existing tests remain fully functional.

# 22. Files Expected To Change
- `src/services/learningMapService.js` (Interface)
- `src/services/mock/mockLearningMapService.js` (New)
- `src/services/api/apiLearningMapService.js` (New)
- `src/services/index.js` (Gateway Export)
- `src/pages/learner/LearningMapPage.jsx`
- `src/domain/learningMap/learningMapAdapter.js`

# 23. Rollback Strategy
If issues arise, revert `LearningMapPage.jsx` to the legacy multi-layer fetch path. The Source of Truth remains authoritative and untouched, ensuring zero risk of data loss.

# 24. Benchmark Plan
Measure and record:
- Cold load time vs Warm load time.
- Firestore query operations and document reads.
- Network request count and payload size.
- Time to usable Map.
- Duplicate requests in StrictMode.
- Cache hit behavior.
