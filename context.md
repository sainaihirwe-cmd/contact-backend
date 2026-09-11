Tasks

Create POST /api/contact endpoint
Validate all fields before saving (name, email, message required; phone optional)
Return validation errors for invalid fields
Save submission to database (Mongodb)
Return success response with confirmation
Create GET /api/contact endpoint to list submissions (for verification)
Acceptance Criteria

✓ Valid submission is saved successfully
✓ Invalid fields return validation errors
✓ Missing required fields return validation errors
✓ Endpoint returns correct success response
✓ No server errors