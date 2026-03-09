Backend Testing Documentation

This document records the results of backend API testing, including request structure, expected results, actual responses, and observations.

Test Case 1 – Valid Login
<details> <summary><strong>Request & Response</strong></summary>
Request (Body – JSON)
{
  "email": "admin@example.com",
  "password": "password123"
}
Expected Result

HTTP 200 OK

JSON response with success: true

JWT token issued

User object returned (id, name, email, role, authProvider)

Actual Result
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
Observation

Cookie successfully set with httpOnly and sameSite

JWT generated with user id and role

Login works as expected

</details>

Status: Pass – Login works correctly and token is generated.

Test Case 2 – Invalid Password
<details> <summary><strong>Request & Response</strong></summary>
Request
{
  "email": "admin@example.com",
  "password": "wrongpassword"
}
Expected Result

HTTP 401 Unauthorized

JSON response with success: false

Message: "Invalid email or password"

Actual Result
{
  "success": false,
  "message": "Invalid email or password"
}
Observation

Password checked using bcrypt

Authentication correctly fails

</details>

Status: Pass – Proper error returned for incorrect password.

Test Case 3 – Invalid Email
<details> <summary><strong>Request & Response</strong></summary>
Request
{
  "email": "wrong@example.com",
  "password": "password123"
}
Expected Result

HTTP 401 Unauthorized

JSON response with success: false

Message: "Invalid email or password"

Actual Result
{
  "success": false,
  "message": "Invalid email or password"
}
Observation

Non-existent email cannot generate token

Authentication validation works correctly

</details>

Status: Pass – Proper error returned for non-existent email.

Test Case 4 – Missing Fields
<details> <summary><strong>Request & Response</strong></summary>
Request
{
  "email": "admin@example.com"
}
Expected Result

HTTP 400 Bad Request

JSON response with success: false

Message: "Email and password are required"

Actual Result
{
  "success": false,
  "message": "Email and password are required"
}
Observation

Backend validation catches missing fields

Request rejected before JWT generation

</details>

Status: Pass – Required field validation works correctly.

Test Case 5 – Fetch All Users (Admin Only)
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
GET /api/admin/users
Authorization: Bearer <token>
Expected Result

HTTP 200 OK

Returns list of users

Passwords excluded

Accessible only by admin

Actual Result
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
Observation

JWT decode fixed (decoded.userId || decoded.id)

Admin role verified successfully

Authorization works via header or cookie

</details>

Status: Pass – Admin authentication verified and users fetched successfully.

Test Case 6 – Update User Role
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
PUT /api/admin/users/69a6630c101bc748357c2907
Request Body
{
  "role": "admin"
}
Expected Result

HTTP 200 OK

Role updated from user → admin

Actual Result
{
  "id": "69a6630c101bc748357c2907",
  "name": "Test User",
  "email": "testuser@example.com",
  "role": "admin"
}
Observation

Admin cannot update their own role

Middleware prevents self-demotion

</details>

Status: Pass – Role updated successfully.

Test Case 7 – Delete User
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
DELETE /api/admin/users/69a6630c101bc748357c2907
Expected Result

HTTP 200 OK

Confirmation message returned

User removed from database

Actual Result
{
  "success": true,
  "message": "User deleted successfully"
}
Observation

Admin cannot delete themselves

Non-admin users can be deleted

</details>

Status: Pass – Admin successfully deleted non-admin user.

Test Case 8 – Logout
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
POST /api/auth/logout
Authorization: Bearer <token>
Expected Result

HTTP 200 OK

Cookie cleared

Token invalidated

Actual Result
{
  "success": true,
  "message": "Logout successful"
}
Observation

Cookie cleared successfully

Protected routes return 401 after logout

</details>

Status: Pass – Logout works correctly.

Test Case 9 – Upload Image
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
POST /api/upload/image
Authorization: Bearer <JWT Token>
Expected Result

HTTP 200 OK

"Image uploaded successfully"

Returns imageUrl and key

Actual Result
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://mern-test-bucket.s3.ap-southeast-2.amazonaws.com/menu-images/1772672758025-test.jpg",
  "key": "menu-images/1772672758025-test.jpg"
}
Observation

File uploaded to AWS S3

Image URL accessible

</details>

Status: Pass – Image uploaded successfully.

Test Case 10 – Get All Images
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
GET /api/upload/images
Authorization: Bearer <JWT Token>
Expected Result

HTTP 200 OK

Returns image list with signed URLs valid for 1 hour

Actual Result
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
Observation

Images successfully retrieved from S3

Signed URLs generated correctly

</details>

Status: Pass – Images fetched successfully.

Test Case 11 – Delete Image
<details> <summary><strong>Request & Response</strong></summary>
Endpoint
DELETE /api/upload/image
Request Body
{
  "key": "menu-images/1772672758025-test.jpg"
}
Expected Result

HTTP 200 OK

"Image deleted successfully"

Actual Result
{
  "message": "Image deleted successfully"
}
Observation

Object removed from S3

Deleted image no longer appears in /images

</details>

Status: Pass – Image deleted successfully.

Test Case 12 – Upload Invalid File Type
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 400 Bad Request

"Only image files are allowed"

Actual Result
{
  "error": "Only image files are allowed!"
}
Observation

Multer fileFilter blocks non-image files

File never reaches S3

</details>

Status: Pass – Non-image files rejected.

Test Case 13 – Upload Oversized File
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 400 or 413

"File size exceeds limit"

Actual Result
{
  "error": "File too large"
}
Observation

Multer size limits enforced

Oversized file not uploaded to S3

</details>

Status: Pass – Oversized files rejected.

Test Case 14 – Access Protected Route Without Token
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 401 Unauthorized

"Not authorized, token missing"

Actual Result
{
  "success": false,
  "message": "Not authorized, token missing"
}
Observation

Protect middleware blocks request

No data exposure

</details>

Status: Pass – Protected route requires token.

Test Case 15 – Access Protected Route With Invalid Token
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 401 Unauthorized

"Not authorized, token invalid"

Actual Result
{
  "success": false,
  "message": "Not authorized, token invalid"
}
Observation

Invalid JWT rejected

</details>

Status: Pass – Invalid tokens blocked.

Test Case 16 – Update Role With Invalid Input
<details> <summary><strong>Request & Response</strong></summary>
Request Body
{
  "role": "superadmin"
}
Expected Result

HTTP 400 Bad Request

"Invalid role"

Actual Result
{
  "error": "Invalid role"
}
Observation

Backend validation prevents invalid role assignment

</details>

Status: Pass – Invalid role input rejected.

Test Case 17 – Delete User (Admin Self-Deletion)
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 400 Bad Request

"Admin cannot delete themselves"

Actual Result
{
  "success": false,
  "message": "Admin cannot delete themselves"
}
Observation

Self-deletion blocked correctly

</details>

Status: Pass – Admin self-deletion prevented.

Test Case 18 – Delete User (Delete Another Admin)
<details> <summary><strong>Request & Response</strong></summary>
Expected Result

HTTP 400 Bad Request

"Cannot delete other admins"

Actual Result
{
  "success": false,
  "message": "Cannot delete other admins"
}
Observation

RBAC rules enforced correctly

</details>

Status: Pass – Cannot delete other admins.

Test Case 19 – Security Headers Verification (Helmet.js)
<details> <summary><strong>Request & Response</strong></summary>
Procedure

Send request to any endpoint

Check Response Headers in Postman

Expected Headers

X-DNS-Prefetch-Control

X-Frame-Options

Strict-Transport-Security

X-Content-Type-Options

X-XSS-Protection

Actual Result (Sample)
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Observation

Security headers automatically applied via Helmet

Protection against XSS, clickjacking, and MIME sniffing

</details>

Status: Pass – Security headers verified.

Test Case 20 – Input Sanitization
<details> <summary><strong>Request & Response</strong></summary>
Malicious Input
{
  "email": { "$ne": null },
  "password": { "$ne": null }
}
Expected Result

Backend rejects input

HTTP 400 / 422

No database manipulation

Actual Result
{
  "success": false,
  "message": "Invalid input type"
}
Observation

Input structure validated

Injection attempts blocked

</details>

Status: Pass – Input sanitization confirmed.
