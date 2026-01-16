# REI360 Frontend - Complete Pages & Components Vision

**Status**: Vision documented (development pending)
**Frontend**: React/Vite with TypeScript
**Styling**: Tailwind CSS + shadcn/ui components
**State**: Zustand or Redux

---

## 📋 Complete Page Structure

### 1. **Authentication Pages**

#### 1.1 Login Page (`/login`)
```
├── Email/Password input
├── OAuth buttons (Google, LinkedIn)
├── "Remember me" checkbox
├── Forgot password link
├── Sign up link
└── Error/success messages
```

**Features**:
- Form validation
- OAuth integration
- Session management
- Redirect to dashboard on success

#### 1.2 Sign Up Page (`/signup`)
```
├── Full name input
├── Email input
├── Password input (with strength indicator)
├── Company name input
├── Role selector (Agent, Broker, Manager)
├── Terms & conditions checkbox
├── Captcha
└── Sign up button
```

**Features**:
- Email verification flow
- Password requirements display
- Company domain validation
- Role-based registration

#### 1.3 Forgot Password Page (`/forgot-password`)
```
├── Email input
├── Send reset link button
├── Success message
├── Back to login link
└── Contact support link
```

#### 1.4 Reset Password Page (`/reset-password/:token`)
```
├── New password input
├── Confirm password input
├── Password strength indicator
├── Reset button
└── Success confirmation
```

#### 1.5 Verify Email Page (`/verify-email/:token`)
```
├── Email verification status
├── Resend verification link
└── Back to login button
```

---

### 2. **Main Dashboard** (`/dashboard`)

#### 2.1 Dashboard Overview
```
┌─────────────────────────────────────────┐
│ Welcome, [User Name] | Settings | Logout│
├─────────────────────────────────────────┤
│ 📊 Quick Stats Cards (Row 1)            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Leads    │ │Properties│ │ Revenue  │ │
│ │ Today: 5 │ │ Listed: 12 │ │ MTD: $X │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ 📈 Charts Section (Row 2)              │
│ ┌─────────────────┐ ┌─────────────────┐│
│ │ Leads Trend     │ │ Conversion Rate ││
│ │ (Line Chart)    │ │ (Pie Chart)     ││
│ └─────────────────┘ └─────────────────┘│
│                                         │
│ 📋 Recent Activities (Row 3)           │
│ ┌─────────────────────────────────────┐│
│ │ Recent Leads  │ Recent Properties  ││
│ │ - Lead 1      │ - Property 1       ││
│ │ - Lead 2      │ - Property 2       ││
│ │ - Lead 3      │ - Property 3       ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Components**:
- Top navigation with user menu
- KPI cards (Leads, Properties, Revenue, Conversion)
- Charts: Leads trend, conversion rates, revenue breakdown
- Recent activities list
- Quick action buttons
- User profile preview

**Data**:
- Real-time stats from backend
- Charts updated every 5 minutes
- User preferences from database

---

### 3. **Lead Management**

#### 3.1 Leads List Page (`/leads`)
```
┌─────────────────────────────┐
│ 🔍 Search  │ 🔽 Filter      │ ➕ New Lead
├─────────────────────────────┤
│ Lead Name │ Email │ Status  │ Score │ Action
├─────────────────────────────┤
│ John Doe  │ j@... │ Hot    │ 85%   │ [...]
│ Jane      │ jane@.│ Warm   │ 65%   │ [...]
│ Bob Smith │ bob@..│ Cold   │ 45%   │ [...]
└─────────────────────────────┘
```

**Features**:
- Full-text search
- Filter by: status, score, created date, assigned agent
- Sorting: name, score, date, status
- Bulk actions (email, assign, delete)
- Export to CSV
- Pagination (50 per page)

#### 3.2 Lead Detail Page (`/leads/:leadId`)
```
┌────────────────────────────────────┐
│ Lead: John Doe                     │
├────────────────────────────────────┤
│ 👤 Contact Info      │ 📞 Phone    │
│ Email: john@...      │ 555-1234    │
│ Location: LA, CA     │ Whatsapp    │
├────────────────────────────────────┤
│ 📊 Score: 85%        │ Status: Hot │
├────────────────────────────────────┤
│ 🏠 Interested Properties:          │
│ [Property 1] [Property 2]          │
├────────────────────────────────────┤
│ 💬 Notes & Timeline                │
│ [Timeline of interactions]         │
├────────────────────────────────────┤
│ 🤖 AI Analysis:                    │
│ [Voice notes & transcription]      │
│ [Predicted interest level]         │
└────────────────────────────────────┘
```

**Features**:
- Contact information & communication history
- Lead score with breakdown
- AI voice call transcript
- Associated properties
- Activity timeline
- Notes & annotations
- CRM sync status
- Calendar integration (schedule calls)
- Email templates

#### 3.3 Lead Voice Agent Page (`/leads/:leadId/voice`)
```
┌────────────────────────────────┐
│ 🎤 Voice Agent - John Doe      │
├────────────────────────────────┤
│ 🔴 Recording... (2:34)         │
│                                │
│ [Live transcription]           │
│ Agent: "Hi John, how are..."   │
│ Lead: "Great, I'm interested"  │
│                                │
│ 📊 Real-time Analysis:         │
│ Sentiment: Positive 92%        │
│ Interest Level: High           │
│ Topics: [pricing, location]    │
├────────────────────────────────┤
│ [End Call] [Pause] [Save]      │
└────────────────────────────────┘
```

**Features**:
- Live voice call interface
- Real-time transcription
- Sentiment analysis
- Topic extraction
- Lead score updates live
- Call recording & playback
- Transcript download

---

### 4. **Property Management**

#### 4.1 Properties List Page (`/properties`)
```
┌──────────────────────────────────┐
│ 🔍 Search │ 🔽 Filter │ ➕ New  │
├──────────────────────────────────┤
│ [Grid/List toggle view]          │
│                                  │
│ [Property Card 1]  [Card 2]      │
│ [Property Card 3]  [Card 4]      │
│ [Property Card 5]  [Card 6]      │
└──────────────────────────────────┘
```

**Property Card**:
```
┌────────────────┐
│ [Image]        │
│ 123 Main St    │
│ LA, CA         │
│ $850K          │
│ 3bd 2ba 2000sf │
│ ⭐⭐⭐⭐⭐       │
│ Score: 92%     │
└────────────────┘
```

**Features**:
- Grid or list view toggle
- Search by address, MLS#, zipcode
- Filters: price range, beds/baths, sqft, type, status
- Sorting: price, date, score, proximity
- Map view integration
- Bulk actions
- Import from MLS

#### 4.2 Property Detail Page (`/properties/:propertyId`)
```
┌─────────────────────────────────────┐
│ 123 Main St, Los Angeles, CA 90001  │
├─────────────────────────────────────┤
│ [Main image carousel]               │
│                                     │
│ 💰 Price: $850,000 │ Est: $865K    │
│ 📐 3 bed 2 bath 2000 sqft          │
│ 📅 Listed: 30 days │ DOM: 15       │
├─────────────────────────────────────┤
│ 📊 Property Analytics:              │
│ [Investment Score] [Market Trends]  │
│ [Comparable Sales] [ROI Analysis]   │
├─────────────────────────────────────┤
│ 🖼️ Photo Gallery                   │
│ [Thumbnails of all photos]         │
├─────────────────────────────────────┤
│ 📝 Description & Details           │
│ [Full property description]        │
├─────────────────────────────────────┤
│ 👥 Related Leads                   │
│ [Lead 1] [Lead 2] [Lead 3]        │
├─────────────────────────────────────┤
│ 💬 Notes & AI Insights             │
└─────────────────────────────────────┘
```

**Features**:
- Photo carousel with zoom
- Property details & specs
- AI valuation estimate
- Market analysis & comparables
- Investment ROI calculation
- Lead matching (who's interested)
- Integration with Zillow/Redfin data
- Document upload (deed, appraisal, etc.)

#### 4.3 Property Analyzer Page (`/properties/:propertyId/analyze`)
```
┌──────────────────────────────────┐
│ 🔍 Property Analysis Tool         │
├──────────────────────────────────┤
│ Address: 123 Main St              │
│                                  │
│ 📊 AI Analysis Panels:           │
│ ┌────────────────────────────┐   │
│ │ Valuation AI              │   │
│ │ Est. Value: $862K         │   │
│ │ Confidence: 94%           │   │
│ │ Range: $850K - $875K      │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ Imagery Intelligence      │   │
│ │ Condition: Good           │   │
│ │ Exterior: Well-maintained │   │
│ │ Features: [detected...]   │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ Market Trends             │   │
│ │ Price/sqft: $425          │   │
│ │ Market: Neutral           │   │
│ │ Inventory: 2.5 months     │   │
│ └────────────────────────────┘   │
│ ┌────────────────────────────┐   │
│ │ Investment Opportunity    │   │
│ │ Cash on Cash: 8.5%        │   │
│ │ Cap Rate: 6.2%            │   │
│ │ Risk Level: Medium        │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

**Features**:
- AI-powered valuation
- Imagery assessment (computer vision)
- Market comparative analysis
- Investment ROI calculations
- Risk assessment
- Rent estimation
- Neighborhood analysis
- Schools & amenities nearby

---

### 5. **Search & Discovery**

#### 5.1 Semantic Search Page (`/search`)
```
┌──────────────────────────────────┐
│ 🔍 Advanced Property Search       │
├──────────────────────────────────┤
│ Natural Language Query:          │
│ [Large search box]              │
│ "3 bed family home under $800K" │
│                                 │
│ OR Classic Filters:             │
│ Price: [$min] - [$max]          │
│ Location: [map selector]        │
│ Beds/Baths: [sliders]           │
│ Property Type: [checkboxes]     │
│ Features: [multi-select]        │
│                                 │
│ [Search Button]                 │
├──────────────────────────────────┤
│ Results:                         │
│ [Property 1] [Property 2]       │
│ [Property 3] [Property 4]       │
│ [Property 5] [Property 6]       │
└──────────────────────────────────┘
```

**Features**:
- Natural language search (AI-powered)
- Advanced filters
- Map-based search
- Saved searches
- Search history
- Smart recommendations
- Sorting & refinement

---

### 6. **CRM Integration**

#### 6.1 CRM Sync Status Page (`/integrations/crm`)
```
┌────────────────────────────────┐
│ 🔗 CRM Integrations            │
├────────────────────────────────┤
│ Connected Platforms:           │
│                                │
│ ✅ Salesforce                 │
│ Last sync: 2 min ago          │
│ Leads synced: 342             │
│ [Disconnect] [Settings]        │
│                                │
│ ✅ HubSpot                    │
│ Last sync: 5 min ago          │
│ Leads synced: 215             │
│ [Disconnect] [Settings]        │
│                                │
│ ❌ Pipedrive                  │
│ [Connect]                      │
│                                │
│ ➕ [Add Integration]           │
└────────────────────────────────┘
```

**Features**:
- View connected CRM platforms
- Sync status & history
- Field mapping
- Conflict resolution
- Manual sync trigger
- Sync logs

#### 6.2 CRM Settings Page (`/settings/integrations/crm`)
```
Detailed CRM configuration
- Field mapping
- Sync frequency
- Update rules
- Conflict handling
```

---

### 7. **Calendar & Meetings**

#### 7.1 Calendar Page (`/calendar`)
```
┌────────────────────────────────┐
│ 📅 Calendar & Meetings          │
├────────────────────────────────┤
│ [Month View / Week / Day]       │
│                                │
│ [Google Calendar Widget]        │
│                                │
│ Upcoming Meetings:             │
│ • 10:00 - Call with John Doe  │
│ • 14:00 - Property Walkthrough│
│ • 16:30 - Team Meeting        │
│                                │
│ [Schedule New Meeting]         │
└────────────────────────────────┘
```

**Features**:
- Google Calendar integration
- Meeting scheduling
- Timezone support
- Meeting notes
- Call reminders

---

### 8. **Voice Agent & AI**

#### 8.1 Voice Agent Logs Page (`/ai/voice-logs`)
```
┌────────────────────────────────┐
│ 🎙️ Voice Agent Activity Log    │
├────────────────────────────────┤
│ 🔍 Search │ 🔽 Filter         │
│                                │
│ Date │ Lead │ Duration │ Score │
├────────────────────────────────┤
│ 1/15 │ John │ 12:34   │ 92%  │
│ 1/15 │ Jane │ 05:22   │ 78%  │
│ 1/14 │ Bob  │ 08:45   │ 65%  │
│                                │
│ [View Details] [Transcript]    │
└────────────────────────────────┘
```

**Features**:
- Call history with transcripts
- Sentiment analysis results
- AI insights & recommendations
- Filter by date, lead, outcome
- Download recordings
- Quality scores

#### 8.2 AI Insights Dashboard (`/ai/insights`)
```
┌────────────────────────────────┐
│ 🤖 AI Insights                 │
├────────────────────────────────┤
│ Recommended Next Steps:        │
│ • Follow up with Jane (hot)   │
│ • Check on Bob's property    │
│ • Send pricing to Alice      │
│                                │
│ Top Performing Properties:    │
│ • 456 Oak Ave - 95% match    │
│ • 789 Pine St - 92% match    │
│ • 321 Elm Ave - 88% match    │
│                                │
│ Lead Quality Predictions:     │
│ [Chart showing closings]     │
└────────────────────────────────┘
```

---

### 9. **Billing & Subscription**

#### 9.1 Billing Page (`/settings/billing`)
```
┌────────────────────────────────┐
│ 💳 Billing & Subscription       │
├────────────────────────────────┤
│ Current Plan: Professional     │
│ Price: $299/month             │
│ Renewal Date: Feb 15, 2024    │
│                                │
│ Plan Features:                │
│ ✅ Unlimited leads            │
│ ✅ Unlimited properties       │
│ ✅ Voice agent calls          │
│ ✅ AI analysis                │
│                                │
│ [Upgrade] [Cancel]            │
│                                │
│ Billing History:              │
│ [Recent invoices...]          │
│                                │
│ Payment Method:               │
│ Visa ending in 4242          │
│ [Update Payment Method]       │
└────────────────────────────────┘
```

**Features**:
- Plan management
- Upgrade/downgrade
- Payment methods
- Invoice history
- Usage analytics
- Billing alerts

---

### 10. **Settings & Profile**

#### 10.1 Profile Page (`/settings/profile`)
```
┌────────────────────────────────┐
│ 👤 My Profile                  │
├────────────────────────────────┤
│ [Profile Picture]              │
│ Name: John Agent               │
│ Email: john@...                │
│ Phone: 555-1234               │
│ Company: Real Estate Co        │
│ Role: Sales Agent             │
│                                │
│ [Edit Profile] [Change Password]│
│ [Download Data] [Delete Account]│
└────────────────────────────────┘
```

#### 10.2 Settings Page (`/settings`)
```
Preferences & Configuration:
- Notification settings
- Email preferences
- Language & timezone
- Privacy settings
- Two-factor auth
- API keys
- Webhooks
```

#### 10.3 Team Management Page (`/settings/team`)
```
User Management:
- Team members list
- Roles & permissions
- Add/remove users
- Activity logs
- Bulk user actions
```

---

### 11. **Analytics & Reporting**

#### 11.1 Analytics Dashboard (`/analytics`)
```
┌────────────────────────────────┐
│ 📊 Analytics & Reporting        │
├────────────────────────────────┤
│ Time Period: [Jan - Dec 2024]  │
│                                │
│ Key Metrics:                   │
│ Leads Generated: 1,234         │
│ Properties Listed: 567         │
│ Closings: 89                   │
│ Revenue: $2.5M                 │
│                                │
│ Charts:                        │
│ [Leads Trend] [Revenue Trend]  │
│ [Conversion Funnel] [ROI]      │
│ [Agent Performance]            │
│                                │
│ [Export Report]                │
└────────────────────────────────┘
```

**Features**:
- KPI tracking
- Custom date ranges
- Charts & visualizations
- Report generation
- Export to PDF/Excel
- Email reports

#### 11.2 Team Performance (`/analytics/team`)
```
Agent Performance:
- Leads generated per agent
- Conversion rates
- Average deal value
- Activity levels
- Commission tracking
```

---

### 12. **Help & Support**

#### 12.1 Help Center (`/help`)
```
┌────────────────────────────────┐
│ 📚 Help Center                  │
├────────────────────────────────┤
│ 🔍 Search: [search box]        │
│                                │
│ Popular Articles:              │
│ • Getting started             │
│ • Adding properties           │
│ • Voice agent usage           │
│ • CRM integration             │
│                                │
│ Documentation                 │
│ Video Tutorials               │
│ [Contact Support]             │
└────────────────────────────────┘
```

#### 12.2 Support Chat (`/support`)
```
Live Support:
- Chat with support team
- Ticket history
- Knowledge base
- FAQ
```

---

## 🛠️ Component Library (Reusable)

### Common Components
- **Navigation**: Top nav, sidebar, breadcrumbs
- **Cards**: Stat cards, property cards, lead cards
- **Forms**: Input fields, selects, date pickers, file upload
- **Tables**: Sortable, filterable, paginated tables
- **Charts**: Line, bar, pie, heatmap charts
- **Modals**: Confirm, form, alert modals
- **Dropdowns**: User menu, action menus
- **Buttons**: Primary, secondary, danger, loading
- **Alerts**: Success, error, warning, info notifications
- **Loading**: Spinners, skeleton loaders, progress bars
- **Maps**: Property maps, location selector
- **Avatar**: User avatars with initials/image
- **Tags**: Status tags, category tags, filter tags

### Page Templates
- Authenticated layout (nav + sidebar)
- Dashboard grid layout
- Form layout
- List layout
- Detail view layout
- Modal layout

---

## 📊 Page Statistics

| Category | # Pages | Status |
|----------|---------|--------|
| Auth | 5 | ❌ Not started |
| Dashboard | 1 | ❌ Not started |
| Leads | 3 | ⚠️ Partial (list exists) |
| Properties | 3 | ⚠️ Partial (list exists) |
| Search | 1 | ❌ Not started |
| CRM | 2 | ❌ Not started |
| Calendar | 1 | ❌ Not started |
| Voice AI | 2 | ❌ Not started |
| Billing | 1 | ❌ Not started |
| Settings | 3 | ❌ Not started |
| Analytics | 2 | ❌ Not started |
| Help | 2 | ❌ Not started |
| **TOTAL** | **31** | **~10% complete** |

---

## 🎯 Development Priority

### Priority 1: Core Pages (Week 1)
- [ ] Login/Sign Up
- [ ] Dashboard
- [ ] Leads List
- [ ] Properties List
- [ ] Profile Settings

### Priority 2: Advanced Features (Week 2-3)
- [ ] Lead Detail + Voice Agent
- [ ] Property Detail + Analyzer
- [ ] Search & Discovery
- [ ] Analytics Dashboard

### Priority 3: Integrations (Week 4)
- [ ] CRM Sync
- [ ] Calendar
- [ ] Billing Management
- [ ] Team Management

### Priority 4: Polish (Week 5)
- [ ] Help Center
- [ ] Notifications
- [ ] Mobile responsiveness
- [ ] Accessibility audit

---

## 🔗 Component Dependencies

```
App
├── Auth Pages
│   ├── Login
│   ├── Sign Up
│   ├── Reset Password
│   └── Verify Email
│
├── Authenticated Layout
│   ├── Navigation
│   ├── Sidebar
│   │
│   └── Main Routes
│       ├── Dashboard
│       ├── Leads
│       │   ├── Leads List
│       │   ├── Lead Detail
│       │   └── Voice Agent
│       ├── Properties
│       │   ├── Properties List
│       │   ├── Property Detail
│       │   └── Analyzer
│       ├── Search
│       ├── Calendar
│       ├── Analytics
│       ├── Integrations (CRM, etc.)
│       └── Settings
│           ├── Profile
│           ├── Team
│           └── Billing
```

---

## 📦 Recommended Libraries

- **UI Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (pre-built accessible components)
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form + Zod (validation)
- **Charts**: Recharts or Chart.js
- **Maps**: Mapbox or Google Maps
- **Tables**: TanStack Table (React Table v8)
- **Notifications**: React Toastify or Sonner
- **Icons**: Lucide React
- **Date/Time**: date-fns or Day.js
- **HTTP Client**: Axios or TanStack Query
- **Authentication**: NextAuth.js (if using Next.js) or custom with OAuth

---

**Last Updated**: January 15, 2026
**Status**: Vision complete - ready for implementation
