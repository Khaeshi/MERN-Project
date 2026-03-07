BACKEND TESTING DOCUMENTATION

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

Token generated correctly in JWT with user id and role

Login works as expected

</details>

Result: Pass – Login works correctly and token is generated.

Test Case 2 – Invalid Password
<details> <summary><strong>Request & Response</strong></summary>

Request (Body – JSON)

{
 "email": "admin@example.com",
 "password": "wrongpassword"
}

Expected Result

HTTP 401 Unauthorized

JSON response with success: false

Message: Invalid email or password

Actual Result

{
 "success": false,
 "message": "Invalid email or password"
}

Observation

Password verified using bcrypt

Authentication correctly rejected

</details>

Result: Pass – Proper error returned for incorrect password.

Test Case 3 – Invalid Email
<details> <summary><strong>Request & Response</strong></summary>

Request (Body – JSON)

{
 "email": "wrong@example.com",
 "password": "password123"
}

Expected Result

HTTP 401 Unauthorized

JSON response with success: false

Message: Invalid email or password

Actual Result

{
 "success": false,
 "message": "Invalid email or password"
}

Observation

Non-existent email cannot authenticate

Access correctly denied

</details>

Result: Pass – Proper error returned for non-existent email.

Test Case 4 – Missing Fields
<details> <summary><strong>Request & Response</strong></summary>

Request

{
 "email": "admin@example.com"
}

Expected Result

HTTP 400 Bad Request

JSON response with success: false

Message: Email and password are required

Actual Result

{
 "success": false,
 "message": "Email and password are required"
}

Observation

Backend validation catches missing fields

Token generation prevented

</details>

Result: Pass – Required field validation works correctly.

Test Case 5 – Fetch All Users (Admin Only)
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

GET /api/admin/users

Authorization

Bearer Token from login

Expected Result

HTTP 200 OK

JSON response listing users

Passwords excluded

Admin access only

Actual Result

[
 {
   "_id": "69a033111b45575034d97fb7",
   "name": "Test Admin",
   "email": "admin@example.com",
   "role": "admin",
   "authProvider": "local"
 }
]

Observation

JWT decoded correctly

Admin role verified

Users retrieved successfully

</details>

Result: Pass – Admin authentication verified and users retrieved.

Test Case 6 – Update User Role
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

PUT /api/admin/users/{userId}

Request Body

{
 "role": "admin"
}

Expected Result

HTTP 200 OK

Role updated successfully

Actual Result

{
 "id": "69a6630c101bc748357c2907",
 "name": "Test User",
 "email": "testuser@example.com",
 "role": "admin"
}

Observation

Admin cannot modify their own role

Other users can be updated correctly

</details>

Result: Pass – Role updated successfully.

Test Case 7 – Delete User
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

DELETE /api/admin/users/{userId}

Expected Result

HTTP 200 OK

User removed from database

Actual Result

{
 "success": true,
 "message": "User deleted successfully"
}

Observation

Admin self-deletion prevented

Non-admin users can be removed

</details>

Result: Pass – User deletion works correctly.

Test Case 8 – Logout
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

POST /api/auth/logout

Expected Result

HTTP 200 OK

Cookie cleared

Protected routes inaccessible after logout

Actual Result

{
 "success": true,
 "message": "Logout successful"
}

Observation

Cookie cleared successfully

Token invalidated

</details>

Result: Pass – Logout works correctly.

Test Case 9 – Upload Image
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

POST /api/upload/image

Expected Result

HTTP 200 OK

Image uploaded successfully

Actual Result

{
 "message": "Image uploaded successfully",
 "imageUrl": "https://mern-test-bucket.s3.ap-southeast-2.amazonaws.com/menu-images/1772672758025-test.jpg",
 "key": "menu-images/1772672758025-test.jpg"
}

Observation

File uploaded to storage successfully

URL accessible

</details>

Result: Pass – Image upload successful.

Test Case 10 – Get All Images
<details> <summary><strong>Request & Response</strong></summary>

Endpoint

GET /api/upload/images

Expected Result

HTTP 200 OK

List of uploaded images returned

Observation

Signed URLs generated correctly

Images retrieved successfully

</details>

Result: Pass – Images fetched successfully.
