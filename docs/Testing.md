# Backend Testing Documentation

#### This document records the results of backend API testing, including request structure, expected results, actual responses, and observations.

## Test Case 1 – Valid Login

<details> <summary><strong>Request & Response</strong></summary>
  
*Request (Body – JSON)*
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
  
*Expected Result*

- HTTP 200 OK

- JSON response with success: true

- JWT token issued

- User object returned (id, name, email, role, authProvider)

*Actual Result*
```
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "69a033111b45575034d97fb7",
    "name": "Test Admin",
    "email": "admin@example.com",
    "role": "admin",
    "authProvider": "local"
  }
}
```

*Observation*

- Cookie successfully set with httpOnly and sameSite

- JWT generated with user id and role

- Login works as expected

</details>

Status: **Pass** – Login works correctly and token is generated.


## Test Case 2 – Invalid Password
<details> <summary><strong>Request & Response</strong></summary>
  
*Request*
```
{
  "email": "admin@example.com",
  "password": "wrongpassword"
}
```

*Expected Result*

- HTTP 401 Unauthorized

- JSON response with success: false
```
Message: "Invalid email or password"
```
*Actual Result*
```
{
  "success": false,
  "message": "Invalid email or password"
}
```
*Observation*

- Password checked using bcrypt

- Authentication correctly fails

</details>

Status: **Pass** – Proper error returned for incorrect password.

## Test Case 3 – Invalid Email
<details> <summary><strong>Request & Response</strong></summary>
  
*Request*
  
```
{
  "email": "wrong@example.com",
  "password": "password123"
}
```
  
*Expected Result*

- HTTP 401 Unauthorized
- JSON response with success: false
```
Message: "Invalid email or password"
```
*Actual Result*
```
{
  "success": false,
  "message": "Invalid email or password"
}
```

*Observation*

- Non-existent email cannot generate token

- Authentication validation works correctly

</details>

Status: **Pass** – Proper error returned for non-existent email.

## Test Case 4 – Missing Fields
<details> <summary><strong>Request & Response</strong></summary>
  
*Request*
```
{
  "email": "admin@example.com"
}
```

*Expected Result*

- HTTP 400 Bad Request

- JSON response with success: false

```
Message: "Email and password are required"
```

*Actual Result*
```
{
  "success": false,
  "message": "Email and password are required"
}
```
*Observation*

- Backend validation catches missing fields

- Request rejected before JWT generation

</details>

Status: **Pass**– Required field validation works correctly.

## Test Case 5 – Fetch All Users (Admin Only)

<details><summary><strong>Request & Response</strong></summary>
  
- Endpoint: GET /api/admin/users
- Authorization: Bearer token from login response

*Expected Result:*
- HTTP 200 OK
- JSON response listing all users (passwords excluded)
- Only accessible by admin


*Actual Result:*
```
[
 {
   "_id": "69a033111b45575034d97fb7",
   "name": "Test Admin",
   "email": "admin@example.com",
   "role": "admin",
   "authProvider": "local",
   "createdAt": "2026-02-26T11:48:33.075Z",
   "updatedAt": "2026-02-26T11:48:33.075Z",
   "__v": 0
 }
]
```

*Observation:*
- JWT decode fixed (decoded.userId || decoded.id)
- Middleware correctly verifies admin role
- Users fetched successfully
- Authorization header and cookies both supported


</details>  

Status: **Pass** – Admin authentication verified, users fetched successfully.

## Test Case 6 – Update User Role
<details> <summary><strong> Request & Response </strong></summary>
  
- Endpoint:PUT /api/admin/users/69a6630c101bc748357c2907 (Test User)

 *Request Body:*
 ```
{
 "role": "admin"
}
```
*Expected Result:*

- HTTP 200 OK
- Role updated from user → admin

*Actual Result:*
```
{
 "id": "69a6630c101bc748357c2907",
 "name": "Test User",
 "email": "testuser@example.com",
 "role": "admin"
}
```
*Observation:*

- Admin cannot update their own role (400 Bad Request) but can update other users’ roles
- Middleware protects against self-demotion

</details> 

Status: **Pass** – Role updated successfully for another user.

## Test Case 7 – Delete User
<details> <summary><strong>Request & Response</strong></summary>
  
- Endpoint: DELETE /api/admin/users/69a6630c101bc748357c2907 (Test User)

*Expected Result:*
- HTTP 200 OK
- JSON message confirming deletion
- User removed from DB


*Actual Result:*
```
{
 "success": true,
 "message": "User deleted successfully"
}
```
*Observation:*
- Admin cannot delete themselves or other admins
- Non-admin users can be deleted successfully

</details>  

Status: **Pass** – Admin successfully deleted a non-admin user.

## Test Case 8 – Logout
<details> <summary><strong>Request & Response </strong></summary>

  *Endpoint:*
  **POST /api/auth/logout**
  
Authorization: Bearer token from login (or cookie)

*Expected Result:*
- HTTP 200 OK
- Cookie cleared (httpOnly, sameSite)
- User token no longer valid for protected routes
- JSON response confirming logout


*Actual Result:*
```
{
 "success": true,
 "message": "Logout successful"
}
```
*Observation:*
- Cookie cleared successfully
- Subsequent requests to protected routes return 401 Unauthorized
  
</details> 

Status: **Pass** – Logout successfully clears session and token.

## Test Case 9 – Upload Image
<details> <summary><strong>Request & Response</strong></summary>

- Endpoint:POST /api/upload/image
- Headers: Authorization: Bearer <JWT Token>
- Body (form-data): image (File)

*Expected Result:*
- HTTP 200 OK
- JSON response with message: "Image uploaded successfully"
- Returns imageUrl and key


*Actual Result:*
```
{
"message": "Image uploaded successfully",
"imageUrl": "https://mern-test-bucket.s3.ap-southeast-2.amazonaws.com/menu-images/1772672758025-test.jpg",
"key": "menu-images/1772672758025-test.jpg"
}
```
Observation:
- File uploaded to S3 successfully
- Image URL accessible

</details> 

Status: **Pass**– Image uploaded correctly.

## Test Case 10 – Get All Images
<details> <summary><strong>Request & Response</strong></summary>
  
- Endpoint:GET /api/upload/images**
- Headers: Authorization: Bearer <JWT Token>

*Expected Result:*
- HTTP 200 OK
- JSON response contains list of images with signed URL valid for 1 hour

*Actual Result:*
```
{
"images": [
  {
    "key": "menu-images/1772672758025-test.jpg",
    "url": "https://mern-test-bucket.s3.ap-southeast-2.amazonaws.com/menu-images/1772672758025-test.jpg?...",
    "lastModified": "2026-03-05T01:06:00.000Z",
    "size": 15910
  }
]
}
```
*Observation:*
- Successfully retrieves all images from S3
- Signed URLs generated correctly


</details> 

Status: **Pass** – Images fetched successfully.

## Test Case 11 – Delete Image
<details> <summary><strong>Request & Response</strong></summary>
  
- Endpoint: DELETE /api/upload/image

- Headers: Authorization: Bearer <JWT Token>

- Body (raw JSON):
```
{
"key": "menu-images/1772672758025-test.jpg"
}
```

*Expected Result:*
- HTTP 200 OK
- JSON message: "Image deleted successfully"
  
*Actual Result:*
```
{
"message": "Image deleted successfully"
}
```
*Observation:*
- S3 object deleted successfully
- /images no longer returns deleted image
- Only admin users authorized


</details>

Status: **Pass** – Image deleted successfully.

## Test Case 12 – Upload Invalid File Type
<details> <summary><strong>Request & Response </strong></summary>
Expected Result:
- HTTP 400 Bad Request
- JSON response: "Only image files are allowed!"


*Actual Result:*
```
{
"error": "Only image files are allowed!"
}
```

*Observation:*
- Multer fileFilter rejects non-image files
- File not uploaded to S3

</details>

Status: **Pass** – Non-image files rejected successfully.**

## Test Case 13 – Upload Oversized File
<details> <summary><strong>Request & Response</strong></summary>
*Expected Result:*
- HTTP 400 Bad Request or 413 Payload Too Large
- JSON response: "File size exceeds limit"


*Actual Result:*
```
{
"error": "File too large"
}
```
*Observation:*
- Multer size limit enforcement works
- S3 storage not used for oversized files


</details> 

Status: **Pass** – Oversized files rejected successfully.


## Test Case 14 – Access Protected Route Without Token
<details> <summary><strong>Request & Response</strong></summary>
*Expected Result:*
- HTTP 401 Unauthorized
- JSON response: "Not authorized, token missing"


*Actual Result:*
```
{
"success": false,
"message": "Not authorized, token missing"
}
```

*Observation:*
- Protect middleware blocks unauthorized requests
- No data exposure


</details> 

Status: **Pass** – Token required for protected routes.

## Test Case 15 – Access Protected Route With Invalid Token
<details> <summary> <strong>Request & Response </strong></summary>
*Expected Result:*
- HTTP 401 Unauthorized
- JSON response: "Not authorized, token invalid"


*Actual Result:*
```
{
"success": false,
"message": "Not authorized, token invalid"
}
```
*Observation:*
- Invalid tokens cannot access protected routes


</details> 

Status: **Pass** – Invalid JWT correctly blocked.

## Test Case 16 – Update Role With Invalid Input
<details> <summary><strong>Request & Response</strong></summary>
  
Request Body:
```
{
"role": "superadmin"
}
```

*Expected Result:*
- HTTP 400 Bad Request
- JSON response: "Invalid role"


*Actual Result:*
```
{
"error": "Invalid role"
}
```

*Observation:*
- Backend validation prevents invalid role assignment


</details> 

Status : **Pass** – Invalid role input rejected.

## Test Case 17 – Delete User (Admin Self-Deletion)
<details> <summary><strong>Request & Response</strong></summary>
*Expected Result:*
- HTTP 400 Bad Request
- JSON response: "Admin cannot delete themselves"


*Actual Result:*
```
{
"success": false,
"message": "Admin cannot delete themselves"
}
```

*Observation:*

- Admin self-deletion is blocked correctly


</details> 

Status: **Pass – Admin self-deletion prevented.**

## Test Case 18 – Delete User (Delete Another Admin)
<details> <summary><strong>Request & Response</strong></summary>
*Expected Result:*
- HTTP 400 Bad Request
- JSON response: "Cannot delete other admins"


*Actual Result:*
```
{
"success": false,
"message": "Cannot delete other admins"
}
```
*Observation:*
- RBAC enforced correctly; non-admin deletion rules applied


</details> 

Status: **Pass**– Cannot delete other admins

## Test Case 19 – Security Headers Verification (Helmet.js)
<details> <summary><strong>Request & Response</strong></summary>
*Procedure:*
- Send a request to any route (e.g., GET /api/upload/images)
- Open Response → Headers tab in Postman
- Verify the following headers:


*Expected Headers:*
- X-DNS-Prefetch-Control
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options
- X-XSS-Protection

*Actual Result (sample from Postman):*
- X-DNS-Prefetch-Control: off
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 0
- Content-Security-Policy: ...
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin
- Referrer-Policy: same-origin
- X-Download-Options: noopen
  
*Observation:*
- Security headers automatically applied via Helmet
- Protects against clickjacking, MIME sniffing, XSS attacks


</details> 

Status:  **Pass** – Security headers successfully verified.

## Test Case 20 – Input Sanitization
<details> <summary><strong>Request & Response</strong></summary>
*Endpoint:*
  
  **POST /api/auth/login (or any endpoint accepting user input)**
  
*Malicious Input Example:*
```
{
 "email": { "$ne": null },
 "password": { "$ne": null }
}
```
*Expected Result:*
- Backend rejects input
- Return HTTP 400 / 422 or proper validation error
- No unauthorized access or DB modification


*Actual Result:*
```
{
  "success": false,
  "message": "Invalid input type"
}
```


*Observation:*
- Backend validates input types and structure
- Malicious inputs rejected
- DB injection not possible


</details> 

Status: **Pass** – Input sanitization confirmed.
