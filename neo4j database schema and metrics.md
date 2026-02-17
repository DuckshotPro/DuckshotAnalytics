// Nodes
(:Creator {id, username, follower_count, total_stories})
(:Story {id, title, posted_at, duration_seconds})
(:ViewMetric {view_count, completion_rate, interaction_count})
(:TimeWindow {hour, day_of_week, date})
(:ProfileView {count, timestamp})

This relational structure enables:

Query: "Which stories drive profile views?" → relationship traversal, not joins

Query: "What's the optimal posting time for this creator?" → graph path analysis across all stories

Query: "Which content + time combo yields best completion rate?" → multi-dimensional graph filtering

A traditional SQL database would need 5-6 joins. Neo4j does it in graph traversal.

Your Data Model (Recommended Schema)

text
// Nodes
(:Creator {id, username, follower_count, total_stories})
(:Story {id, title, posted_at, duration_seconds})
(:ViewMetric {view_count, completion_rate, interaction_count})
(:TimeWindow {hour, day_of_week, date})
(:ProfileView {count, timestamp})

// Relationships
(Creator)-[:HAS_STORY]->(Story)
(Story)-[:HAS_METRIC]->(ViewMetric)
(ViewMetric)-[:RECORDED_AT]->(TimeWindow)
(Story)-[:TRIGGERS_PROFILE_VIEWS]->(ProfileView)
(ProfileView)-[:RECORDED_AT]->(TimeWindow)
(Creator)-[:OPTIMAL_POST_TIME]->(TimeWindow)

MATCH (c:Creator {username: 'creator_name'})-[:HAS_STORY]->(s:Story)-[:HAS_METRIC]->(m:ViewMetric)-[:RECORDED_AT]->(t:TimeWindow)
RETURN t.hour, avg(m.completion_rate) as avg_completion, count(s) as story_count
ORDER BY avg_completion DESC
LIMIT 1

Creator Story Metrics and Audience Engagement Data Model
Creator
  ├─ [HAS_STORY] → Story
  │   ├─ [HAS_ENGAGEMENT] → ViewMetric
  │   │   ├─ view_count: 500
  │   │   ├─ completion_rate: 0.82
  │   │   ├─ interaction_count: 45
  │   │   └─ [OCCURRED_AT] → TimeWindow
  │   │       └─ hour: 20 (8 PM)
  │   └─ [DRIVES_PROFILE_VIEWS] → ProfileView
  │       └─ [VIEWED_AT] → TimeWindow
  │
  └─ [HAS_AUDIENCE] → Audience
      └─ [ENGAGES_DURING] → TimeWindow
          └─ peak_hours: [19

1. Creator authorizes via OAuth
   ↓
2. You call Public Profile API endpoints:
   - GET /stories → story metadata
   - GET /story/{id}/metrics → view_count, completion_rate, interactions
   - GET /profile/views → profile_view_count, timing
   ↓
3. Your service transforms to Neo4j nodes/relationships:
   
   POST /api/snapshot/ingest
   {
     "creator_id": "123",
     "stories": [
       {
         "id": "story_456",
         "posted_at": "2026-01-19T20:00:00Z",
         "metrics": {
           "view_count": 500,
           "completion_rate": 0.82,
           "interactions": 45
         },
         "engagement_timeline": {
           "hour_20": 150,  // 8 PM: 150 views
           "hour_21": 250   // 9 PM: 250 views
         }
       }
     ],
     "profile_views": {
       "total": 125,
       "timeline": { "hour_20": 45, "hour_21": 50 }
     }
   }
   ↓
4. Neo4j ingestion:
   CREATE (c:Creator {id: '123'})
   CREATE (s:Story {id: 'story_456', ...})
   CREATE (m:ViewMetric {view_count: 500, completion_rate: 0.82, ...})
   CREATE (tw:TimeWindow {hour: 20})
   CREATE (c)-[:HAS_STORY]->(s)-[:HAS_METRIC]->(m)-[:RECORDED_AT]->(tw)
   ↓
5. Your scheduling engine queries:
   MATCH (c:Creator {id: '123'})-[:HAS_STORY]->...
   → Finds optimal posting window (8-9 PM)
   → Recommends creator post new story at 8 PM
   ↓
6. Creator schedules story for 8 PM
   → Duckshot publishes via Snapchat API at optimal time1. Creator authorizes via OAuth
   ↓
2. You call Public Profile API endpoints:
   - GET /stories → story metadata
   - GET /story/{id}/metrics → view_count, completion_rate, interactions
   - GET /profile/views → profile_view_count, timing
   ↓
3. Your service transforms to Neo4j nodes/relationships:
   
   POST /api/snapshot/ingest
   {
     "creator_id": "123",
     "stories": [
       {
         "id": "story_456",
         "posted_at": "2026-01-19T20:00:00Z",
         "metrics": {
           "view_count": 500,
           "completion_rate": 0.82,
           "interactions": 45
         },
         "engagement_timeline": {
           "hour_20": 150,  // 8 PM: 150 views
           "hour_21": 250   // 9 PM: 250 views
         }
       }
     ],
     "profile_views": {
       "total": 125,
       "timeline": { "hour_20": 45, "hour_21": 50 }
     }
   }
   ↓
4. Neo4j ingestion:
   CREATE (c:Creator {id: '123'})
   CREATE (s:Story {id: 'story_456', ...})
   CREATE (m:ViewMetric {view_count: 500, completion_rate: 0.82, ...})
   CREATE (tw:TimeWindow {hour: 20})
   CREATE (c)-[:HAS_STORY]->(s)-[:HAS_METRIC]->(m)-[:RECORDED_AT]->(tw)
   ↓
5. Your scheduling engine queries:
   MATCH (c:Creator {id: '123'})-[:HAS_STORY]->...
   → Finds optimal posting window (8-9 PM)
   → Recommends creator post new story at 8 PM
   ↓
6. Creator schedules story for 8 PM
   → Duckshot publishes via Snapchat API at optimal time


          1. Creator authorizes via OAuth
   ↓
2. You call Public Profile API endpoints:
   - GET /stories → story metadata
   - GET /story/{id}/metrics → view_count, completion_rate, interactions
   - GET /profile/views → profile_view_count, timing
   ↓
3. Your service transforms to Neo4j nodes/relationships:
   
   POST /api/snapshot/ingest
   {
     "creator_id": "123",
     "stories": [
       {
         "id": "story_456",
         "posted_at": "2026-01-19T20:00:00Z",
         "metrics": {
           "view_count": 500,
           "completion_rate": 0.82,
           "interactions": 45
         },
         "engagement_timeline": {
           "hour_20": 150,  // 8 PM: 150 views
           "hour_21": 250   // 9 PM: 250 views
         }
       }
     ],
     "profile_views": {
       "total": 125,
       "timeline": { "hour_20": 45, "hour_21": 50 }
     }
   }
   ↓
4. Neo4j ingestion:
   CREATE (c:Creator {id: '123'})
   CREATE (s:Story {id: 'story_456', ...})
   CREATE (m:ViewMetric {view_count: 500, completion_rate: 0.82, ...})
   CREATE (tw:TimeWindow {hour: 20})
   CREATE (c)-[:HAS_STORY]->(s)-[:HAS_METRIC]->(m)-[:RECORDED_AT]->(tw)
   ↓
5. Your scheduling engine queries:
   MATCH (c:Creator {id: '123'})-[:HAS_STORY]->...
   → Finds optimal posting window (8-9 PM)
   → Recommends creator post new story at 8 PM
   ↓
6. Creator schedules story for 8 PM