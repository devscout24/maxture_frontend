# Replace Video Chunk Upload: Backend Investigation Note

## Summary

The replace-video flow is failing on the chunk upload API with this response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "video_chunk": [
      "The video chunk field must be a file of type: file."
    ]
  }
}
```

Based on the current frontend implementation and the API contract provided, this points primarily to a backend issue in how `video_chunk` is being parsed or validated on the chunk upload endpoint.

## APIs Involved

### 1. Initialize replace upload

`POST /property/:property_id/replace-video`

Request body:

```json
{
  "should_replace": "yes",
  "video_name": "original_video_name.mp4",
  "total_chunks": 1,
  "file_size": 100
}
```

### 2. Upload each chunk

`POST /property/:property_id/upload-video-chunk`

Request body:

```json
{
  "upload_id": "...",
  "chunk_number": 1,
  "video_chunk": "<multipart uploaded file>"
}
```

## Current Frontend Behavior

The frontend replace-video flow:

1. Calls `POST /property/:property_id/replace-video`
2. Receives `upload_id`
3. Splits the selected video into chunks
4. Sends each chunk to `POST /property/:property_id/upload-video-chunk`

The chunk upload request is sent as browser-generated `multipart/form-data`, not JSON.

For each chunk request, the frontend sends:

- `upload_id`
- `chunk_number`
- `video_chunk` as a real browser `File`

Relevant frontend implementation:

- [src/components/agentDashboard/VideoUpload.tsx](/abs/path/c:/Users/Mehedi%20Noor%20Khan/Desktop/maxtuero-frontend/src/components/agentDashboard/VideoUpload.tsx:522)

## Why This Looks Like a Backend Issue

The backend is not complaining that `video_chunk` is missing. It is complaining that `video_chunk` is not recognized as a file.

That usually means:

- Laravel received the field name
- but `Request::hasFile('video_chunk')` is false
- or validation is not being run against a parsed uploaded file

If the frontend were completely wrong about the field name, the more likely error would be that the field is required or missing.

## What the Backend Should Verify

### 1. Confirm the endpoint is correct

Check that `POST /property/:property_id/upload-video-chunk` is the actual endpoint used for replace-video chunk uploads, not only for another upload flow.

### 2. Confirm request content type

The request should arrive as:

```text
multipart/form-data; boundary=...
```

If the backend expects JSON here, file parsing will fail.

### 3. Confirm Laravel sees the uploaded file

In the controller handling `/property/:property_id/upload-video-chunk`, verify:

```php
$request->hasFile('video_chunk');
$request->file('video_chunk');
$request->allFiles();
```

Expected:

- `hasFile('video_chunk') === true`
- `allFiles()` contains `video_chunk`

### 4. Confirm validation rule

Validation should be consistent with uploaded multipart files, for example:

```php
'video_chunk' => ['required', 'file']
```

If a custom validator, DTO, transformer, or middleware is interfering before Laravel file parsing, this can fail even when the frontend sends the file correctly.

### 5. Confirm the backend reads the chunk as a file, not as plain input

Correct:

```php
$chunk = $request->file('video_chunk');
```

Incorrect:

```php
$chunk = $request->input('video_chunk');
```

### 6. Confirm no middleware is breaking multipart handling

Please check whether any middleware, request normalization layer, proxy handling, or custom body parser is consuming or altering the multipart request before validation.

## Suggested Debug Logging

Please add temporary logging to the chunk upload endpoint:

```php
logger()->info('upload-video-chunk debug', [
    'content_type' => $request->header('Content-Type'),
    'request_keys' => array_keys($request->all()),
    'file_keys' => array_keys($request->allFiles()),
    'has_video_chunk' => $request->hasFile('video_chunk'),
    'video_chunk_file' => $request->file('video_chunk'),
    'upload_id' => $request->input('upload_id'),
    'chunk_number' => $request->input('chunk_number'),
]);
```

Expected output characteristics:

- `content_type` contains `multipart/form-data`
- `file_keys` includes `video_chunk`
- `has_video_chunk` is `true`

If `has_video_chunk` is `false`, the issue is on the backend path handling multipart file parsing or on a mismatch between documentation and implementation.

## Likely Root Causes

Most likely:

1. The backend controller for `/upload-video-chunk` is not correctly parsing `video_chunk` as an uploaded file.
2. The validation is running on the wrong field or before file parsing.
3. The route implementation does not actually match the documented contract for replace-video chunk uploads.

Less likely:

1. The frontend is using the wrong field name.
2. The frontend is sending JSON instead of multipart.

The current frontend does not indicate either of those less likely cases.

## Conclusion

Given the documented API contract and the current frontend implementation, this should be treated as a backend investigation on:

- `POST /property/:property_id/upload-video-chunk`
- validation for `video_chunk`
- `Request::hasFile('video_chunk')`
- `Request::file('video_chunk')`
- multipart request parsing before validation

## Frontend Note

The replace-video frontend is intentionally chunked. The current requested behavior is multi-chunk upload, with each chunk sized at 10 MB for the replace-video flow.
