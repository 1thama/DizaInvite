# Security Specification for Wedding Invitation App

## Data Invariants
1. **Invitations**: Must have a valid `userId` (Consumer). Only the owner can update or delete their invitation.
2. **Guests**: Must be linked to an `invitationId`.
3. **Messages**: Must be linked to an `invitationId`.
4. **Consumers**: Private documents. Only the consumer can read their own profile (for login validation if needed) or an admin.
5. **Media**: Tracks uploaded files. Must belong to a `userId`.

## The "Dirty Dozen" Payloads (Attack Scenarios)

1. **Identity Spoofing**: Attempting to create an invitation with someone else's `userId`.
2. **Slug Poisoning**: Injecting a extremely long or malicious character string into the `slug`.
3. **Ghost Field Update**: Authenticated member tries to add `isAdmin: true` to their invitation metadata.
4. **Orphaned Message**: Creating a guestbook message for a non-existent invitation.
5. **PII Leak**: Unauthorized user reading the `consumers` collection to get emails and passwords.
6. **State Skip**: Guest updating their RSVP status from 'Hadir' to 'Admin' (invalid enum).
7. **Resource Poisoning**: Uploading a photo metadata entry with a 1MB string as the `url`.
8. **Unauthorized Deletion**: User A tries to delete User B's invitation.
9. **No-Size String**: Posting a message with a string of 1 million characters.
10. **Immortality Bypass**: Trying to change the `createdAt` timestamp of an invitation.
11. **Relational Break**: Creating a Guest entry without an `invitationId` or with a malformed one.
12. **Blind List Scraping**: Authenticated user trying to list ALL invitations without being the owner.

## Test Scenarios (Simplified)
- `create /invitations`: Denied if `request.auth.uid != request.resource.data.userId`.
- `update /invitations`: Denied if `request.resource.data.diff(resource.data).affectedKeys().hasAny(['userId', 'slug', 'createdAt'])`.
- `read /consumers`: Denied for non-admins and non-owners.
- `list /invitations`: Denied unless `resource.data.userId == request.auth.uid`.
