# Product Requirements: GenAI Cracow Email Tool

## User Types & Roles

### Event Organizers
Primary users of the system who manage email marketing for the GenAI Cracow community:
- Manage subscriber lists and segments
- Create and send email campaigns
- Monitor campaign performance and analytics
- Configure system settings and preferences
- Import/export subscriber data

### Email Recipients (Community Members)
End users who receive emails but don't use the admin interface:
- Subscribe/unsubscribe from email lists
- Receive campaign emails
- Interact with email content (open, click links)

## Business Entities

### Subscriber
- id: Unique identifier
- email: Email address (required, unique)
- firstName: First name (optional)
- lastName: Last name (optional)
- status: Active, Unsubscribed, Bounced
- tags: Categories for segmentation
- dateAdded: Subscription timestamp
- lastEmailSent: Most recent campaign received

### Campaign
- id: Unique identifier
- name: Campaign title for internal use
- subject: Email subject line
- content: Email body content (HTML/text)
- status: Draft, Scheduled, Sending, Sent, Failed
- fromName: Sender display name
- fromEmail: Sender email address
- replyToEmail: Reply-to address
- recipientCount: Number of targeted subscribers
- sentDate: When campaign was sent
- createdDate: When campaign was created

### Campaign Send Record
- id: Unique identifier
- campaignId: Reference to campaign
- subscriberEmail: Recipient email
- status: Sent, Delivered, Opened, Clicked, Bounced, Unsubscribed
- sentAt: Timestamp when email was sent
- deliveredAt: When email was delivered
- openedAt: When email was opened (first time)
- clickCount: Number of clicks on links

### Email Event
- id: Unique identifier
- campaignId: Reference to campaign
- subscriberEmail: Recipient email
- eventType: Open, Click, Bounce, Unsubscribe, Complaint
- timestamp: When event occurred
- metadata: Additional event data (link clicked, bounce reason, etc.)

## Core User Flows

### 1. Subscriber Management

**View Subscribers Page** (`/admin/subscribers`)
- Display table with columns: Email, Name, Status (Active/Unsubscribed), Date Added, Tags, Last Email Sent
- Search bar at top to filter by email/name
- Bulk actions: Export CSV, Delete Selected, Add Tags
- "Add Subscriber" button and "Import CSV" button
- Show total count: "1,247 subscribers (1,198 active, 49 unsubscribed)"
- Pagination controls at bottom

**Add Single Subscriber Modal**
- Form fields: Email (required), First Name, Last Name, Tags (dropdown with existing tags + add new)
- System checks if email already exists, shows warning if duplicate
- System validates email format
- On success: "Subscriber added successfully" message, modal closes, table refreshes

**Import CSV Flow**
- Upload CSV file (drag & drop or file picker)
- System validates CSV format, shows preview of first 10 rows
- Map CSV columns to system fields (Email, First Name, Last Name, Tags)
- Show import summary: "Ready to import 245 new subscribers, 12 duplicates found (will be skipped)"
- System processes import in background, adds subscribers, skips duplicates
- Show final report: "Successfully imported 245 subscribers, skipped 12 duplicates"

**Backend Methods:**
- Check if email exists in database
- Validate email format and CSV structure
- Add single subscriber with duplicate prevention
- Bulk import subscribers with duplicate detection
- Search/filter subscribers by criteria
- Export subscriber list to CSV format

### 2. Campaign Creation

**Campaigns List Page** (`/admin/campaigns`)
- Table showing: Campaign Name, Status (Draft/Scheduled/Sent), Recipients Count, Send Date, Open Rate, Click Rate
- "Create New Campaign" button
- Filter by status dropdown
- Search by campaign name

**Create Campaign Page** (`/admin/campaigns/new`)
- Step 1: Campaign Details
  - Campaign Name (required)
  - Subject Line (required, character counter)
  - From Name (defaults to "GenAI Cracow")
  - From Email (defaults to configured email)
  - Reply-to Email

- Step 2: Recipients Selection
  - Radio buttons: "All Active Subscribers" / "Select by Tags" / "Upload Custom List"
  - If tags selected: Multi-select dropdown of available tags
  - Show recipient count preview: "This will send to 892 subscribers"

- Step 3: Email Content
  - Simple WYSIWYG editor (bold, italic, links, lists)
  - Or markdown editor toggle option
  - Pre-built React Email templates dropdown: "Event Announcement", "Post-Event Summary", "Monthly Newsletter"
  - Template customization with GenAI Cracow branding
  - Preview button shows email in popup with desktop/mobile view toggle
  - Responsive email design for all devices

- Step 4: Review & Send
  - Summary box: Campaign name, subject, recipient count, from details
  - Send options: "Send Now" / "Schedule for Later" (date/time picker)
  - "Send Test Email" button (sends to configured test email)
  - "Save as Draft" button

**Backend Methods:**
- Save campaign as draft with all details
- Count recipients based on selection criteria
- Generate email preview HTML
- Send test email to specified address
- Schedule campaign for future sending or queue for immediate send
- Validate campaign completeness before sending

### 3. Sending & Queue Management

**Campaign Sending Process**
- System checks daily sending quota remaining
- System checks if recipient received email in last 24 hours (prevents duplicate sends)
- System breaks large recipient lists into batches (e.g., 100 emails per batch)
- System sends emails via AWS SES with rate limiting
- System logs each send attempt (success/failure) with timestamp
- System updates campaign status and statistics in real-time

**Backend Methods:**
- Check daily quota against provider limits
- Check recent send history per recipient
- Queue emails in batches with delays
- Send individual emails via AWS SES
- Log delivery attempts and responses
- Update campaign statistics and recipient status

### 4. Campaign Analytics

**Campaign Details Page** (`/admin/campaigns/[id]`)
- Header: Campaign name, send date, status
- Key metrics cards: Total Sent, Delivered, Opened, Clicked, Unsubscribed, Bounced
- Percentage rates: Delivery Rate, Open Rate, Click Rate, Unsubscribe Rate
- Timeline chart showing opens/clicks over time (last 7 days)
- Link performance table: Each link in email, click count, unique clicks
- Recipient actions table: Email, Status (Sent/Delivered/Opened/Clicked/Bounced), Timestamp
- Export buttons: "Export Engagement Data", "Export Bounced Emails"

**Backend Methods:**
- Track email opens via pixel tracking
- Track link clicks via redirect URLs
- Process bounce notifications from AWS SES
- Handle unsubscribe requests automatically
- Calculate engagement statistics and rates
- Generate time-series data for charts

### 5. Dashboard Overview

**Main Dashboard** (`/admin`)
- Quick stats cards: Total Subscribers, Campaigns This Month, Average Open Rate, Recent Growth
- Recent activity feed: "Campaign 'March Meetup' sent to 892 subscribers", "45 new subscribers this week"
- Quick actions: "Create Campaign", "Add Subscribers", "View Latest Campaign Results"
- Upcoming scheduled campaigns list
- System status: AWS SES connection, daily quota usage (e.g., "147/1000 emails sent today")

**Backend Methods:**
- Calculate summary statistics across all data
- Fetch recent activity logs
- Check AWS SES connectivity and quota status
- Retrieve scheduled campaigns list

### 6. Settings & Configuration

**Settings Page** (`/admin/settings`)
- AWS SES Configuration: Region, Access Key, Secret Key, Test Connection button
- Daily Limits: Set maximum emails per day, current usage display
- Default From Details: Name, Email, Reply-to
- Unsubscribe Settings: Automatic unsubscribe page URL, footer text
- Export Data: "Download All Subscribers", "Download All Campaign Data"

**Backend Methods:**
- Test AWS SES connection with provided credentials
- Save configuration securely
- Generate data exports
- Manage unsubscribe preferences

### 7. Public Pages

**Unsubscribe Page** (`/unsubscribe/[token]`)
- Simple form: "Unsubscribe [email] from GenAI Cracow emails?"
- Confirmation button and "Keep me subscribed" option
- Success message: "You've been unsubscribed successfully"
- System validates token, updates subscriber status, logs action

**Email Tracking Endpoints**
- Open tracking: `/track/open/[campaignId]/[subscriberId]` (1x1 pixel)
- Click tracking: `/track/click/[linkId]/[subscriberId]` (redirects to actual URL)
- System logs tracking data and redirects seamlessly

**Backend Methods:**
- Validate unsubscribe tokens
- Process unsubscribe requests
- Log email opens and clicks
- Redirect click tracking to destination URLs