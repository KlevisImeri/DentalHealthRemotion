# Instagram Graph API Documentation

## Overview

The Instagram Graph API allows businesses and creators to programmatically publish content to Instagram. This document covers the **Instagram API with Instagram Login** approach, which does NOT require a Facebook Page.

## Host URLs

| Login Type | Host URL |
|------------|----------|
| Instagram Login | `https://graph.instagram.com` |
| Facebook Login | `https://graph.facebook.com` |
| Video Uploads | `https://rupload.facebook.com` |

## API Version

Latest: `v25.0`

---

## 1. Authentication

### 1.1 OAuth Authorization URL

Redirect users to this URL to initiate login:

```
https://api.instagram.com/oauth/authorize?
  client_id={APP_ID}&
  redirect_uri={REDIRECT_URI}&
  scope=instagram_business_content_publish,instagram_business_basic&
  response_type=code
```

### 1.2 Exchange Code for Token

```
POST https://api.instagram.com/oauth/access_token
Content-Type: application/x-www-form-urlencoded

client_id={APP_ID}
&client_secret={APP_SECRET}
&grant_type=authorization_code
&redirect_uri={REDIRECT_URI}
&code={CODE}
```

**Response:**
```json
{
  "access_token": "{SHORT_LIVED_TOKEN}",
  "token_type": "bearer",
  "expires_in": {SECONDS}
}
```

### 1.3 Get Long-Lived Token

```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={APP_SECRET}
  &access_token={SHORT_LIVED_TOKEN}
```

**Response:**
```json
{
  "access_token": "{LONG_LIVED_TOKEN}",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

### 1.4 Get Instagram User ID

```
GET https://graph.instagram.com/me
  ?fields=id,username,account_type,media_count
  &access_token={ACCESS_TOKEN}
```

**Response:**
```json
{
  "id": "17841405793087218",
  "username": "business_username",
  "account_type": "BUSINESS",
  "media_count": 42
}
```

### 1.5 Refresh Long-Lived Token

```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_refresh_token
  &access_token={LONG_LIVED_TOKEN}
```

---

## 2. Content Publishing

All content publishing uses a **two-step process**:
1. Create a media container
2. Publish the container

### 2.1 Upload Image

**Step 1: Create Container**

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &image_url={PUBLIC_IMAGE_URL}
  &caption={CAPTION}
  &alt_text={ALT_TEXT}
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `image_url` | Yes | Public URL to JPEG image (max 8MB) |
| `caption` | No | Post caption (max 2200 chars) |
| `alt_text` | No | Accessibility text |

**Response:**
```json
{
  "id": "17983948293847152"
}
```

**Step 2: Publish**

```
POST https://graph.instagram.com/{IG_USER_ID}/media_publish
  ?access_token={ACCESS_TOKEN}
  &creation_id={CONTAINER_ID}
```

**Response:**
```json
{
  "id": "17983948293847153"
}
```

### 2.2 Upload Video (from URL)

**Step 1: Create Container**

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=VIDEO
  &video_url={PUBLIC_VIDEO_URL}
  &caption={CAPTION}
  &thumbnail_url={THUMBNAIL_URL}
  &title={TITLE}
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `media_type` | Yes | Must be `VIDEO` |
| `video_url` | Yes | Public URL to video (max 100MB) |
| `caption` | No | Post caption (max 2200 chars) |
| `thumbnail_url` | No | Preview image URL |
| `title` | No | Video title |

**Step 2: Check Upload Status**

Videos take time to process. Poll until ready:

```
GET https://graph.instagram.com/{CONTAINER_ID}
  ?fields=status_code
  &access_token={ACCESS_TOKEN}
```

**Status Codes:**
- `IN_PROGRESS` - Still processing
- `READY` - Ready to publish
- `ERROR` - Failed

**Step 3: Publish**

```
POST https://graph.instagram.com/{IG_USER_ID}/media_publish
  ?access_token={ACCESS_TOKEN}
  &creation_id={CONTAINER_ID}
```

### 2.3 Upload Video (Resumable)

For large videos or unstable connections, use resumable upload.

**Step 1: Initialize Upload**

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=VIDEO
  &upload_type=resumable
```

**Response:**
```json
{
  "id": "17983948293847152",
  "uri": "https://rupload.facebook.com/ig-api-upload/v25.0/17983948293847152"
}
```

**Step 2: Upload Video Data**

```
POST https://rupload.facebook.com/ig-api-upload/v25.0/{CONTAINER_ID}
  Authorization: OAuth {ACCESS_TOKEN}
  offset: 0
  file_size: {FILE_SIZE_BYTES}
  --data-binary @{LOCAL_FILE_PATH}
```

Or upload from hosted URL:

```
POST https://rupload.facebook.com/ig-api-upload/v25.0/{CONTAINER_ID}
  Authorization: OAuth {ACCESS_TOKEN}
  file_url: {VIDEO_URL}
```

**Step 3: Check Status & Publish**

Same as Section 2.2, Steps 2-3.

### 2.4 Upload Carousel (Multiple Images/Videos)

**Step 1: Create Child Containers**

For each item in the carousel:

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &image_url={PUBLIC_IMAGE_URL}
  &is_carousel_item=true
```

Or for video carousels:

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=VIDEO
  &video_url={PUBLIC_VIDEO_URL}
  &is_carousel_item=true
```

**Step 2: Create Carousel Container**

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=CAROUSEL
  &caption={CAPTION}
  &children={CONTAINER_ID_1},{CONTAINER_ID_2},{CONTAINER_ID_3}
```

**Step 3: Publish**

```
POST https://graph.instagram.com/{IG_USER_ID}/media_publish
  ?access_token={ACCESS_TOKEN}
  &creation_id={CAROUSEL_CONTAINER_ID}
```

### 2.5 Upload Story

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=STORIES
  &image_url={PUBLIC_IMAGE_URL}
```

Or for video stories:

```
POST https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &media_type=STORIES
  &video_url={PUBLIC_VIDEO_URL}
```

---

## 3. Other Endpoints

### 3.1 Check Rate Limit Usage

```
GET https://graph.instagram.com/{IG_USER_ID}/content_publishing_limit
  ?access_token={ACCESS_TOKEN}
```

**Response:**
```json
{
  "data": [
    {
      "quota_usage": 5
    }
  ]
}
```

### 3.2 Get User's Media

```
GET https://graph.instagram.com/{IG_USER_ID}/media
  ?access_token={ACCESS_TOKEN}
  &fields=id,caption,media_type,media_url,permalink
  &limit=25
```

### 3.3 Get Media Details

```
GET https://graph.instagram.com/{MEDIA_ID}
  ?access_token={ACCESS_TOKEN}
  &fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp
```

---

## 4. Permissions

### Required Permissions

| Permission | Description |
|------------|-------------|
| `instagram_business_basic` | Read profile info, media |
| `instagram_business_content_publish` | Create/publish content |
| `instagram_business_manage_comments` | Manage comments |
| `instagram_business_manage_messages` | Messaging |

### Note on Old Scope Values

Old scope values deprecated on January 27, 2025:
- `business_basic` → `instagram_business_basic`
- `business_content_publish` → `instagram_business_content_publish`
- `business_manage_comments` → `instagram_business_manage_comments`
- `business_manage_messages` → `instagram_business_manage_messages`

---

## 5. Limits & Requirements

### Media Requirements

| Type | Format | Size | Duration |
|------|--------|------|----------|
| Image | JPEG | max 8MB | - |
| Video | MP4/MOV | max 100MB | 3-60 sec |
| Story Image | JPEG | max 8MB | - |
| Story Video | MP4/MOV | max 100MB | max 60 sec |

### Rate Limits

- **25 API posts per 24-hour rolling period**
- Per-account limit enforced on `/media_publish` endpoint

### General Requirements

- Instagram **Professional Account** (Business or Creator)
- Media must be on **publicly accessible server** (Meta cURLs it)
- No Facebook Page required for Instagram Login

---

## 6. Publishing Flow Summary

```
1. User logs in via OAuth → Get access token
2. Get IG User ID: GET /me?fields=id
3. Create container: POST /{ig_user_id}/media
   - image_url for images
   - video_url + media_type=VIDEO for videos
4. If video: Poll GET /{container_id}?fields=status_code until READY
5. Publish: POST /{ig_user_id}/media_publish?creation_id={container_id}
6. Response contains final media ID
```

---

## 7. Error Codes

| Error | Description |
|-------|-------------|
| `IN_PROGRESS` | Media still processing |
| `READY` | Ready to publish |
| `ERROR` | Processing failed |
| `VALIDATION_ERROR` | Invalid input |
| `PERMISSION_ERROR` | Missing permissions |

---

## 8. Facebook Login (Alternative)

If using **Facebook Login for Business** instead of Instagram Login:

- **Host**: `https://graph.facebook.com`
- **Permissions**: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`
- **Requires**: Facebook Page linked to Instagram account
- **Video Upload**: Only via resumable upload (`upload_type=resumable`)

---

## References

- [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform)
- [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login)
- [Content Publishing Guide](https://developers.facebook.com/docs/instagram-platform/content-publishing)
- [Resumable Uploads](https://developers.facebook.com/docs/instagram-platform/content-publishing/resumable-uploads)
