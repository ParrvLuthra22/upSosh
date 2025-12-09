# Business Rules: Host an Event Feature

## 1. Event Approval Workflow

All events submitted by hosts must go through an approval process before being published to the platform.

### Status Transitions
- **Draft**: Event is being created by the host. It is saved locally or in the database but is not visible to anyone else.
- **Pending**: Host has submitted the event for review. It is visible to the host and platform admins.
- **Approved**: Admin has reviewed and approved the event. It is now visible to the public (if the event date is in the future).
- **Rejected**: Admin has rejected the event. It is visible only to the host, along with a rejection reason.

### Rules
- Hosts can edit events in **Draft** status freely.
- Editing an event in **Pending** status resets the submission time but keeps it in Pending.
- Editing an **Approved** event reverts it to **Pending** status for re-approval (unless the change is minor, e.g., typo fix - *future implementation*).
- **Rejected** events can be edited and resubmitted, which moves them to **Pending**.

## 2. Pricing Rules

### Ticket Pricing
- **Minimum Ticket Price**: $5.00 (for paid events).
- **Free Events**: Allowed. No platform fees apply.
- **Currency**: USD (for MVP).

### Platform Fees
- **Fee Structure**: 10% of ticket price + $0.50 per ticket sold.
- **Payer**: Fees are deducted from the host's payout (i.e., passed on to the host, or the host can increase price to cover it).
- **Example**:
    - Ticket Price: $20.00
    - Platform Fee: ($20 * 0.10) + $0.50 = $2.50
    - Host Payout: $17.50

## 3. Host Eligibility

To publish events, a user must meet the following criteria:

- **Email Verification**: User must have a verified email address.
- **Profile Completion**: Host profile must include:
    - Display Name
    - Bio
    - Avatar
- **Payout Details**: For paid events, valid bank details (mocked for now) must be provided.
- **Terms of Service**: Must agree to the Host Terms of Service.

## 4. Event Modification Policies

### Before Approval
- Full editing capabilities are allowed.

### After Approval (Live Events)
- **Critical Fields** (Date, Time, Venue, Pricing): Changing these will trigger a re-approval process and notify existing ticket holders (*future implementation*).
- **Non-Critical Fields** (Description, Media, FAQs): Can be updated without re-approval.
- **Cancellation**: Hosts can cancel an event.
    - If tickets have been sold, automatic refunds are initiated (*future implementation*).
    - Cancellation reason must be provided.

## 5. Data Validation Limits

- **Title**: Min 5 chars, Max 100 chars.
- **Description**: Min 20 chars, Max 2000 chars.
- **Tags**: Max 5 tags per event.
- **Images**: Max 5MB per image. Supported formats: JPG, PNG, WEBP.
