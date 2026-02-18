
# Course Management Features

New features have been implemented to support course creation and enrollment management for Owners and Instructors.

## 1. Course Management (Owner)
- **Create Course**: Owners can create new courses with Name, Subject, Description, and optionally assign an Instructor.
- **View Courses**: Owners can see a list of all courses in their academy with enrollment counts.
- **Assign Students**: Owners can manually enroll students into any course.
- **Assign Instructors**: Owners can change/assign instructors to courses.

## 2. Instructor Dashboard
- **My Courses**: Instructors have a dedicated "My Courses" page (`/instructor/courses`) showing only courses they are assigned to.
- **Enroll Students**: Instructors can enroll students purely into their own courses.

## 3. API Endpoints
- `GET /api/academy/courses`: Lists all courses (Owner) or filtered courses (Instructor context via separate logic/endpoint).
- `POST /api/academy/courses`: Create a course (Owner only).
- `POST /api/academy/courses/[id]/enroll`: Enroll a student (Owner or Course Instructor).
- `GET /api/instructor/courses`: specific endpoint for instructor's courses.
- `GET /api/academy/members`: Updated to allow Instructors to fetch student lists for enrollment.

## How to Test
1. **Owner**:
   - Go to `/owner/courses`.
   - Create a course "Python Basics" assigned to "Instructor A".
   - Enroll "Student B" into it.
2. **Instructor**:
   - Login as "Instructor A".
   - Go to `/instructor/courses`.
   - See "Python Basics".
   - Enroll "Student C" into it.
   - Verify success.
3. **Student**:
   - Login as "Student B" or "C".
   - Check Dashboard (if implemented to show enrolled courses).

Note: Student dashboard update for showing enrolled classes is pending or handled by existing `UserDashboard` logic if it fetches enrollments.
