
# Academy Multi-Tenancy & Approval System

New features have been implemented to support academy multi-tenancy and owner approval workflows.

## 1. Academy Codes
- **Academy Creation**: When a new Owner signs up, an Academy is automatically created with a unique 8-character `Academy Code` (e.g., `AB12CD34`).
- **Joining an Academy**: Instructors, Students, and Parents must enter this `Academy Code` during signup to join the academy.

## 2. User Status & Approval Workflow
- **Pending Status**: Users joining with an Academy Code are set to `PENDING` status by default.
- **Waiting Page**: Pending users who try to log in are redirected to a `/pending` waiting page until approved.
- **Owner Approval**:
    - Academy Owners have a new **"Members"** menu in their dashboard (`/owner/members`).
    - Owners can view a list of Pending members and **Approve** or **Reject** them.
    - Approved users gain full access (`ACTIVE`).
    - Rejected users remain in `REJECTED` status and cannot access the system.

## 3. Dashboard Updates
- **Owner Dashboard**: Displays the **Academy Code** at the top for easy sharing with invites.
- **Member Management**: New page to handle approvals.

## 4. API & Database
- **Schema**: Updated `Academy` model with `code` and `ownerId`. Updated `User` model with `status`.
- **API**: Updated `setup-profile` API to handle Academy Code logic. Created `academy/members` endpoints.

## How to Test
1. **Owner**: Sign up as Owner. Note the Academy Code in the dashboard.
2. **Member**: Sign up as Student/Instructor using the Academy Code. You will see the "Waiting Approval" page.
3. **Approval**: Log back in as Owner, go to "Members", and approve the new user.
4. **Access**: Log in as the Member again; you should now see the dashboard.
