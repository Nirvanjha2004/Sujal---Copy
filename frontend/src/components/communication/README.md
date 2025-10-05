# Communication Interface Components

This directory contains all the components related to communication features in the real estate portal, including property inquiries, in-app messaging, and contact management.

## Components Overview

### Core Components

#### 1. PropertyInquiryForm
A form component for users to send inquiries about properties.

**Features:**
- Form validation for name, email, phone, and message
- Success/error handling
- Privacy notice
- Responsive design

**Usage:**
```tsx
import { PropertyInquiryForm } from './components/communication';

<PropertyInquiryForm
  propertyId={123}
  propertyTitle="Beautiful Apartment"
  onSuccess={() => console.log('Inquiry sent!')}
  onCancel={() => setShowForm(false)}
/>
```

#### 2. ContactInfoDisplay
Displays contact information for property owners/agents with privacy controls.

**Features:**
- Profile image display
- Role badges (Owner, Agent, Builder)
- Verification status
- Phone number masking
- Response time information
- Language preferences
- Action buttons for inquiry and messaging

**Usage:**
```tsx
import { ContactInfoDisplay } from './components/communication';

<ContactInfoDisplay
  contactInfo={{
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    role: "agent",
    isVerified: true,
    responseTime: "2 hours",
    languages: ["English", "Spanish"]
  }}
  onInquiryClick={() => setShowInquiryForm(true)}
  onMessageClick={() => openMessaging()}
  showMaskedPhone={true}
/>
```

#### 3. InquiryList
Displays a list of inquiries with filtering and status management.

**Features:**
- Inquiry status badges
- Property information display
- Status update actions (for owners/agents)
- Pagination support
- Role-based filtering

**Usage:**
```tsx
import { InquiryList } from './components/communication';

<InquiryList
  userRole="owner"
  propertyId={123} // Optional: filter by property
  onInquiryClick={(inquiry) => viewDetails(inquiry)}
/>
```

#### 4. MessagingInterface
A complete messaging interface for real-time communication.

**Features:**
- Conversation list
- Message history
- Real-time messaging
- Read receipts
- Message status indicators
- Conversation search

**Usage:**
```tsx
import { MessagingInterface } from './components/communication';

<MessagingInterface
  currentUserId={userId}
  selectedConversationId={conversationId}
  onConversationSelect={(id) => setSelectedConversation(id)}
/>
```

#### 5. InquiryStatusBadge
A reusable badge component for displaying inquiry status.

**Features:**
- Color-coded status indicators
- Consistent styling
- TypeScript support

**Usage:**
```tsx
import { InquiryStatusBadge } from './components/communication';

<InquiryStatusBadge status="new" />
<InquiryStatusBadge status="contacted" />
<InquiryStatusBadge status="closed" />
```

### Page Components

#### 6. InquiryHistoryPage
A complete page for managing inquiry history with statistics and filtering.

**Features:**
- Statistics dashboard
- Tabbed interface by status
- Search and filtering
- Role-based views

#### 7. CommunicationPage
A comprehensive communication hub combining inquiries and messaging.

**Features:**
- Unified dashboard
- Quick stats
- Tab navigation
- Role-specific welcome messages

### Integration Components

#### 8. PropertyDetailsIntegration
Shows how to integrate communication components into property detail pages.

**Features:**
- Contact action buttons
- Modal inquiry form
- Contact information toggle
- Messaging integration

### Demo Components

#### 9. CommunicationDemo
A comprehensive demo showcasing all communication features.

**Features:**
- Interactive navigation
- Mock data examples
- Feature showcase
- Usage examples

## API Integration

The components use the `api.communication` namespace for backend communication:

```typescript
// Inquiries
api.communication.createInquiry(inquiryData)
api.communication.getInquiries(params)
api.communication.updateInquiryStatus(id, status)
api.communication.getInquiryStats()

// Messaging
api.communication.sendMessage(messageData)
api.communication.getConversations(params)
api.communication.getMessages(conversationId, params)
api.communication.markAsRead(conversationId)
api.communication.getUnreadCount()
```

## Requirements Fulfilled

This implementation addresses the following requirements from the specification:

### Requirement 5.1: Property Inquiry Forms
- ✅ Contact forms for property inquiries
- ✅ Form validation and error handling
- ✅ Success confirmation

### Requirement 5.2: In-app Messaging
- ✅ Real-time messaging interface
- ✅ Conversation management
- ✅ Message status tracking

### Requirement 5.4: Lead Tracking
- ✅ Inquiry status management
- ✅ Lead routing and assignment
- ✅ Communication history

### Additional Features
- ✅ Contact information display
- ✅ Privacy controls (phone masking)
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Status indicators
- ✅ Statistics dashboard

## Styling

All components use Tailwind CSS for styling and follow the design system established in the UI components. The components are fully responsive and accessible.

## TypeScript Support

All components are written in TypeScript with proper type definitions for:
- Props interfaces
- API response types
- Status enums
- Event handlers

## Testing

The components are designed to be easily testable with:
- Clear prop interfaces
- Separated business logic
- Mock-friendly API calls
- Predictable state management

## Future Enhancements

Potential improvements for future versions:
- Real-time notifications
- File attachments in messages
- Voice/video calling integration
- Advanced search and filtering
- Message encryption
- Offline support
- Push notifications