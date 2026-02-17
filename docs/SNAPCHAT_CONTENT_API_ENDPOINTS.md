# Snapchat Content Upload API - Endpoints Reference

## 🎯 Overview
This document outlines the Snapchat API endpoints for scheduling and uploading creator content (Stories, Snaps, Spotlight).

**Base URL**: `https://adsapi.snapchat.com/v1`

---

## 🔐 Authentication

### OAuth 2.0 Flow
```http
GET https://accounts.snapchat.com/login/oauth2/authorize
  ?response_type=code
  &client_id={YOUR_CLIENT_ID}
  &redirect_uri={YOUR_REDIRECT_URI}
  &scope=snapchat.content.create snapchat.content.read
  &state={RANDOM_STATE}
```

### Access Token Exchange
```http
POST https://accounts.snapchat.com/login/oauth2/access_token

Headers:
  Content-Type: application/x-www-form-urlencoded

Body:
  grant_type=authorization_code
  &client_id={YOUR_CLIENT_ID}
  &client_secret={YOUR_CLIENT_SECRET}
  &code={AUTHORIZATION_CODE}
  &redirect_uri={YOUR_REDIRECT_URI}

Response:
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "snapchat.content.create snapchat.content.read"
}
```

### Refresh Token
```http
POST https://accounts.snapchat.com/login/oauth2/access_token

Body:
  grant_type=refresh_token
  &client_id={YOUR_CLIENT_ID}
  &client_secret={YOUR_CLIENT_SECRET}
  &refresh_token={REFRESH_TOKEN}
```

---

## 📤 Media Upload Flow

### Step 1: Create Media Upload Session
```http
POST https://adsapi.snapchat.com/v1/me/media

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "media": [
    {
      "name": "My Video Title",
      "type": "VIDEO", // or "IMAGE"
      "ad_account_id": "{ad_account_id}" // optional for creator content
    }
  ]
}

Response:
{
  "media": [
    {
      "id": "media_id_123",
      "name": "My Video Title",
      "type": "VIDEO",
      "status": "PENDING_UPLOAD",
      "upload_url": "https://storage.snapchat.com/upload/...",
      "created_at": "2026-01-19T09:00:00.000Z"
    }
  ]
}
```

### Step 2: Upload Media File
```http
PUT {upload_url_from_step_1}

Headers:
  Content-Type: video/mp4  // or image/jpeg for images
  Content-Length: {file_size}

Body: {binary_file_data}

Response: 200 OK (no body)
```

### Step 3: Verify Upload Status
```http
GET https://adsapi.snapchat.com/v1/me/media/{media_id}

Headers:
  Authorization: Bearer {access_token}

Response:
{
  "media": {
    "id": "media_id_123",
    "name": "My Video Title",
    "type": "VIDEO",
    "status": "READY", // or "PROCESSING", "FAILED"
    "duration_ms": 15000,
    "width": 1080,
    "height": 1920,
    "file_size_kb": 5120,
    "download_link": "https://...",
    "created_at": "2026-01-19T09:00:00.000Z",
    "updated_at": "2026-01-19T09:00:30.000Z"
  }
}
```

---

## 📅 Story/Snap Publishing

### Create Story Post
```http
POST https://adsapi.snapchat.com/v1/me/stories

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "media_id": "media_id_123",
  "caption": "Check out this amazing content! 🚀",
  "publish_time": "2026-01-19T15:00:00.000Z", // scheduled time (optional)
  "metadata": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "hashtags": ["#creator", "#snapchat"]
  }
}

Response:
{
  "story": {
    "id": "story_123",
    "media_id": "media_id_123",
    "status": "SCHEDULED", // or "PUBLISHED"
    "caption": "Check out this amazing content! 🚀",
    "publish_time": "2026-01-19T15:00:00.000Z",
    "url": "https://www.snapchat.com/...",
    "created_at": "2026-01-19T09:05:00.000Z"
  }
}
```

---

## 📊 Content Management

### List Scheduled Content
```http
GET https://adsapi.snapchat.com/v1/me/stories
  ?status=SCHEDULED
  &limit=50
  &cursor={pagination_cursor}

Headers:
  Authorization: Bearer {access_token}

Response:
{
  "stories": [
    {
      "id": "story_123",
      "media_id": "media_id_123",
      "status": "SCHEDULED",
      "caption": "...",
      "publish_time": "2026-01-19T15:00:00.000Z",
      "created_at": "2026-01-19T09:05:00.000Z"
    },
    ...
  ],
  "paging": {
    "next_cursor": "..."
  }
}
```

### Update Scheduled Content
```http
PUT https://adsapi.snapchat.com/v1/me/stories/{story_id}

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "caption": "Updated caption text",
  "publish_time": "2026-01-19T16:00:00.000Z"
}

Response: {updated_story_object}
```

### Cancel Scheduled Content
```http
DELETE https://adsapi.snapchat.com/v1/me/stories/{story_id}

Headers:
  Authorization: Bearer {access_token}

Response: 204 No Content
```

---

## 📈 Analytics

### Get Story Performance
```http
GET https://adsapi.snapchat.com/v1/me/stories/{story_id}/analytics

Headers:
  Authorization: Bearer {access_token}

Response:
{
  "analytics": {
    "story_id": "story_123",
    "views": 15420,
    "screenshots": 342,
    "shares": 89,
    "completion_rate": 0.78,
    "drop_off_points": [
      {"timestamp_ms": 5000, "percentage": 0.15}
    ],
    "demographics": {
      "age_groups": {"13-17": 0.25, "18-24": 0.65, "25+": 0.10},
      "gender": {"male": 0.45, "female": 0.55}
    }
  }
}
```

---

## 🚨 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid Request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid or expired access token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limit Exceeded | Too many requests |
| 500 | Internal Server Error | Snapchat server error |

### Rate Limits
- **Media Upload**: 50 uploads per hour
- **Story Creation**: 100 posts per day
- **API Calls**: 1000 requests per hour

---

## 🎬 Complete Upload + Publish Flow

```typescript
async function scheduleSnapchatPost(
  accessToken: string,
  videoFile: File,
  caption: string,
  scheduledTime: Date
) {
  // 1. Create upload session
  const createResponse = await fetch('https://adsapi.snapchat.com/v1/me/media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      media: [{
        name: videoFile.name,
        type: 'VIDEO'
      }]
    })
  });
  
  const { media } = await createResponse.json();
  const uploadUrl = media[0].upload_url;
  const mediaId = media[0].id;
  
  // 2. Upload file
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': videoFile.size.toString()
    },
    body: videoFile
  });
  
  // 3. Wait for processing
  let status = 'PROCESSING';
  while (status === 'PROCESSING') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const statusResponse = await fetch(
      `https://adsapi.snapchat.com/v1/me/media/${mediaId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const statusData = await statusResponse.json();
    status = statusData.media.status;
  }
  
  // 4. Schedule story
  const publishResponse = await fetch('https://adsapi.snapchat.com/v1/me/stories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      media_id: mediaId,
      caption: caption,
      publish_time: scheduledTime.toISOString()
    })
  });
  
  return await publishResponse.json();
}
```

---

## 📝 Media Specifications

### Video Requirements
- **Format**: MP4 (H.264 video, AAC audio)
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Duration**: 3-60 seconds
- **File Size**: Max 100MB
- **Frame Rate**: 30 FPS recommended

### Image Requirements
- **Format**: JPEG, PNG
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **File Size**: Max 5MB
- **Color Space**: sRGB

---

## 🔗 Reference Links
- Official Docs: https://marketingapi.snapchat.com/docs/
- Developer Portal: https://developers.snap.com/
- Support: https://businesshelp.snapchat.com/

---

**Last Updated**: 2026-01-19
**API Version**: v1
