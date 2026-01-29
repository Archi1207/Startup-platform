# Startup Benefits Platform

A full-stack web application for startups to discover and claim exclusive deals and benefits from partner companies. Built with Next.js 14 (App Router) on the frontend and Node.js/Express with MongoDB on the backend.

## Project Structure

```
startup-platform/
├── client/              # Next.js 14 frontend application
│   ├── app/            # App Router pages and layouts
│   ├── components/     # React components (UI, dashboard, deals)
│   ├── lib/           # API clients, auth context, utilities
│   └── public/        # Static assets
└── server/            # Node.js/Express backend API
    └── src/
        ├── controllers/  # Request handlers
        ├── models/      # MongoDB schemas (User, Deal, Claim)
        ├── routes/      # API route definitions
        ├── middleware/  # Authentication & error handling
        └── utils/       # Helper functions
```

---

## End-to-End Application Flow

### 1. **User Registration & Authentication**
   - User visits the landing page at `/`
   - Navigates to `/register` to create an account
   - Provides: name, email, password, and startup name
   - Backend creates user account with `isVerified: false` and `verificationStatus: 'pending'`
   - JWT token is generated and returned to client
   - Token is stored in localStorage and added to axios headers
   - User is redirected to `/dashboard`

### 2. **Browsing Deals**
   - User navigates to `/deals` to view available benefits
   - Frontend fetches deals from `/api/deals` with optional filters (category, access level, search)
   - Backend returns paginated list of active deals with claim status for authenticated users
   - Each deal shows:
     - Basic info (title, partner, discount)
     - Access level badge (public/verified/premium)
     - Claim status if user is authenticated
     - "Claimed" indicator if already claimed

### 3. **Viewing Deal Details**
   - User clicks on a deal card to navigate to `/deals/[id]`
   - Frontend fetches detailed deal information from `/api/deals/:id`
   - Backend checks:
     - If deal exists and is active
     - If user has permission to view (access level check)
     - If user has already claimed it
   - Page displays:
     - Full description and requirements
     - Eligibility conditions
     - Claim button (enabled/disabled based on status)
     - Verification prompt if needed

### 4. **Claiming a Deal**
   - User clicks "Claim Deal" button on deal details page
   - Frontend sends POST request to `/api/deals/:id/claim`
   - Backend performs validation (covered in detail in "Claiming Flow" section)
   - On success:
     - Claim record is created with `status: 'pending'`
     - Deal's `claimCount` is incremented
     - Frontend updates UI to show "Claimed" status
     - User can view claim in `/dashboard` under "My Claims"

### 5. **Managing Claims**
   - User navigates to `/dashboard` to view claimed deals
   - Frontend fetches user's claims from `/api/deals/claims`
   - Backend returns all claims with populated deal information
   - User sees claim status (pending/approved/rejected/redeemed)

---

## Authentication and Authorization Strategy

### JWT-Based Authentication

**Token Generation:**
- When user registers or logs in, server generates JWT token
- Token contains `userId` encoded payload
- Default expiration: 7 days
- Secret key stored in environment variable `JWT_SECRET`

```javascript
const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
```

**Token Storage & Transmission:**
- Client stores token in browser's localStorage
- Token sent in `Authorization` header as `Bearer <token>` for all API requests
- Axios interceptor automatically adds token to all authenticated requests

### Authentication Middleware (`auth.js`)

**Primary Authentication Check:**
```javascript
const auth = async (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Verify token and decode userId
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Fetch user from database
  const user = await User.findById(decoded.userId);
  
  // Attach user to request object for downstream use
  req.user = user;
  next();
}
```

**Verification Middleware:**
```javascript
const requireVerified = async (req, res, next) => {
  // Check if user has been verified by admin
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Verification required to access this resource' 
    });
  }
  next();
}
```

### Authorization Levels

**Three-Tier Access Control:**

1. **Public** - Available to all users (including unauthenticated)
2. **Verified** - Requires `user.isVerified === true` 
   - Admin manually verifies startup legitimacy
   - Prevents abuse of exclusive deals
3. **Premium** - Reserved for paid/partner startups (future enhancement)

**Enforcement Points:**
- Route level: Applied as middleware in route definitions
- Controller level: Checked within `getDealById` and `claimDeal` controllers
- Frontend level: UI elements conditionally rendered based on user verification status

### Security Considerations

**Current Implementation:**
- Password hashing using bcrypt (handled in User model)
- JWT token validation on each protected request
- Token expiration handling
- CORS configuration restricting origin to frontend URL

**Weaknesses:**
- JWT secret uses default fallback if env var not set
- No token refresh mechanism (user must re-login after 7 days)
- Tokens not invalidated on logout (client-side only)
- No rate limiting on auth endpoints
- No email verification flow implemented

---

## Internal Flow of Claiming a Deal

### Client-Side Flow

1. **UI Interaction**
   - User on `/deals/[id]` page clicks "Claim Deal" button
   - Button disabled if deal already claimed or verification required

2. **API Request**
   ```typescript
   const response = await api.post(`/deals/${dealId}/claim`);
   ```
   - Authorization token automatically included in headers
   - Request sent to backend API

3. **Response Handling**
   - Success: Update local state, show success message, refresh deal data
   - Error: Display error message (verification required, already claimed, etc.)

### Server-Side Flow (`claimDeal` controller)

**Step 1: Deal Validation**
```javascript
const deal = await Deal.findById(req.params.id);
if (!deal || !deal.isActive) {
  return res.status(404).json({ error: 'Deal not found' });
}
```

**Step 2: Access Level Check**
```javascript
if (deal.accessLevel === 'verified' && !req.user.isVerified) {
  return res.status(403).json({ 
    error: 'Verification required to claim this deal',
    requiresVerification: true 
  });
}
```

**Step 3: Duplicate Claim Prevention**
```javascript
const existingClaim = await Claim.findOne({
  user: req.user._id,
  deal: deal._id
});

if (existingClaim) {
  return res.status(400).json({ error: 'Deal already claimed' });
}
```
- MongoDB unique compound index on `(user, deal)` ensures database-level uniqueness

**Step 4: Capacity Check**
```javascript
if (deal.maxClaims && deal.claimCount >= deal.maxClaims) {
  return res.status(400).json({ error: 'Deal claims exhausted' });
}
```

**Step 5: Claim Creation**
```javascript
const claim = await Claim.create({
  user: req.user._id,
  deal: deal._id,
  status: 'pending',
  expiresAt: deal.validity ? new Date(deal.validity) : null
});
```

**Step 6: Update Deal Statistics**
```javascript
deal.claimCount += 1;
await deal.save();
```

**Step 7: Return Success Response**
```javascript
res.status(201).json({
  success: true,
  data: claim
});
```

### Database Transactions

**Current Limitation:**
- No atomic transaction wrapping claim creation and deal update
- Race condition possible: deal count could be incremented even if claim creation fails
- Multiple users could exceed `maxClaims` if claiming simultaneously

**Ideal Implementation:**
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  const claim = await Claim.create([...], { session });
  await deal.updateOne({ $inc: { claimCount: 1 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

---

## Interaction Between Frontend and Backend

### API Architecture

**Backend:** RESTful API with Express.js
- Base URL: `http://localhost:5000/api`
- Content-Type: `application/json`
- Authentication: JWT via Authorization header

**Frontend:** Axios HTTP client with interceptors
- Centralized API instance (`lib/api/api.ts`)
- Automatic token injection
- Error handling and response transformation

### Key API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Create new user account |
| `/auth/login` | POST | No | Authenticate and get token |
| `/auth/profile` | GET | Yes | Get current user info |
| `/deals` | GET | Optional | List deals with filters |
| `/deals/:id` | GET | Optional | Get single deal details |
| `/deals/:id/claim` | POST | Yes | Claim a deal |
| `/deals/claims` | GET | Yes | Get user's claims |

### Data Flow Example: Claiming a Deal

1. **Client Action**
   ```typescript
   // User clicks claim button
   const handleClaim = async () => {
     setIsLoading(true);
     try {
       const response = await api.post(`/deals/${dealId}/claim`);
       // Success handling
     } catch (error) {
       // Error handling
     }
   }
   ```

2. **API Request**
   - Axios interceptor adds: `Authorization: Bearer eyJhbGci...`
   - Request body: empty (dealId in URL params)

3. **Server Processing**
   - Auth middleware extracts and validates token
   - Attaches `req.user` object
   - Controller executes claim logic
   - Returns JSON response

4. **Client Updates**
   - Success: Update local state, trigger re-fetch of deal data
   - SWR library invalidates cache and refetches
   - UI reflects new claim status

### State Management

**Frontend Patterns:**

1. **SWR (stale-while-revalidate)**
   - Used for data fetching and caching
   - Automatic revalidation on focus/reconnect
   - Optimistic UI updates possible
   
   ```typescript
   const { data, error, mutate } = useSWR('/deals', fetcher);
   ```

2. **Context API**
   - Auth state managed globally via `AuthContext`
   - User object accessible throughout component tree
   - Login/logout functions centralized

3. **Local Component State**
   - Form inputs, modals, loading states
   - React useState for ephemeral UI state

### Error Handling

**Backend Error Response Format:**
```json
{
  "error": "Error message string",
  "requiresVerification": true  // Optional flag
}
```

**Frontend Error Handling:**
- Axios interceptors catch HTTP errors
- Display user-friendly messages via toast/modal
- Redirect to login if 401 Unauthorized
- Show verification prompt if 403 with flag

---

## Known Limitations and Weak Points

### Security Issues

1. **JWT Token Management**
   - No refresh token mechanism (user must re-login after 7 days)
   - Tokens not revoked on logout (blacklisting not implemented)
   - Tokens in localStorage vulnerable to XSS attacks
   - Default JWT secret used if environment variable not set

2. **Authentication Vulnerabilities**
   - No rate limiting on login/register endpoints (brute force risk)
   - No email verification flow (anyone can register with any email)
   - Password strength requirements not enforced on frontend
   - No 2FA or MFA support

3. **Authorization Gaps**
   - Manual verification process not implemented (admin panel missing)
   - No role-based access control (RBAC)
   - Premium access level not enforced

### Database & Backend Issues

4. **Race Conditions**
   - Claim creation and deal count update not atomic
   - Multiple simultaneous claims could exceed `maxClaims`
   - No database transactions for critical operations

5. **Data Validation**
   - Insufficient input validation on some endpoints
   - No sanitization of user input (XSS risk)
   - File upload not implemented (partner logos hardcoded)

6. **Performance**
   - No database indexing strategy documented
   - N+1 query problem in deal list (claim status check per deal)
   - No query result caching (Redis not implemented)
   - No pagination on claims endpoint

7. **Error Handling**
   - Generic error messages expose internal details
   - No centralized logging (console.log only)
   - No error monitoring (Sentry, etc.)

### Frontend Issues

8. **State Management**
   - Token stored in localStorage (vulnerable to XSS)
   - No persistent session management
   - Manual cache invalidation required in many places

9. **UX/Accessibility**
   - No loading skeletons (spinners only)
   - Error messages not screen-reader friendly
   - No offline support or service worker
   - Mobile responsiveness not fully tested

10. **Performance**
    - No code splitting beyond Next.js defaults
    - Images not optimized (Next.js Image used but sizes not specified)
    - No lazy loading for deal lists
    - Three.js animation could impact performance on low-end devices

### DevOps & Infrastructure

11. **Deployment**
    - No CI/CD pipeline
    - No containerization 
    - Environment variables management unclear
    - No health checks or monitoring

12. **Testing**
    - No unit tests
    - No integration tests
    - No E2E tests
    - No API documentation (Swagger/OpenAPI)

13. **Database**
    - MongoDB connection error handling basic
    - No backup strategy
    - No migration system for schema changes
    - Connection pooling not configured

---

## Improvements Required for Production Readiness

### Critical (P0) - Must Fix Before Launch

1. **Security Hardening**
   - [ ] Implement refresh token rotation (short-lived access + long-lived refresh)
   - [ ] Move tokens to httpOnly cookies to prevent XSS
   - [ ] Add rate limiting (express-rate-limit) on all endpoints
   - [ ] Implement email verification flow with verification tokens
   - [ ] Use helmet.js with strict CSP headers
   - [ ] Add CSRF protection for state-changing operations
   - [ ] Enforce strong password policy (zxcvbn library)
   - [ ] Store JWT secret securely (AWS Secrets Manager, Azure Key Vault)

2. **Data Integrity**
   - [ ] Implement MongoDB transactions for claim creation
   - [ ] Add database indexes on frequently queried fields:
     ```javascript
     dealSchema.index({ category: 1, accessLevel: 1, isActive: 1 });
     dealSchema.index({ featured: -1, createdAt: -1 });
     claimSchema.index({ user: 1, claimedAt: -1 });
     ```
   - [ ] Add input validation using joi or zod on all endpoints
   - [ ] Implement soft deletes instead of hard deletes

3. **Error Handling & Monitoring**
   - [ ] Integrate error monitoring (Sentry, LogRocket)
   - [ ] Implement structured logging (Winston, Pino)
   - [ ] Add request ID tracking for debugging
   - [ ] Create custom error classes for different error types
   - [ ] Sanitize error messages sent to client

4. **Testing Infrastructure**
   - [ ] Unit tests for all controllers and models (Jest, Vitest)
   - [ ] Integration tests for API endpoints (Supertest)
   - [ ] E2E tests for critical flows (Playwright, Cypress)
   - [ ] Test coverage minimum 80% for business logic
   - [ ] Add pre-commit hooks (Husky) to run tests

### High Priority (P1) - Launch Blockers

5. **Admin Panel**
   - [ ] Build admin dashboard for deal management
   - [ ] Implement user verification workflow
   - [ ] Add claim approval/rejection interface
   - [ ] Create analytics dashboard (claim rates, popular deals)
   - [ ] Implement deal creation/editing UI

6. **API Documentation**
   - [ ] Generate OpenAPI/Swagger documentation
   - [ ] Add Postman collection for API testing
   - [ ] Document authentication flow
   - [ ] Create developer onboarding guide

7. **Performance Optimization**
   - [ ] Implement Redis caching for deals list
   - [ ] Optimize database queries (remove N+1)
   - [ ] Add CDN for static assets
   - [ ] Implement database connection pooling
   - [ ] Add response compression (gzip)

8. **DevOps & Deployment**
   - [ ] Create Dockerfile for backend and frontend
   - [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
   - [ ] Configure production environment variables
   - [ ] Implement database backup strategy (daily automated)
   - [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
   - [ ] Configure reverse proxy (Nginx) with rate limiting

### Medium Priority (P2) - Post-Launch

9. **Feature Enhancements**
   - [ ] Email notifications for claim status updates
   - [ ] Deal expiration reminders
   - [ ] Favorites/bookmarking system
   - [ ] Deal recommendation engine based on category preferences
   - [ ] Social sharing functionality
   - [ ] Referral program

10. **UX Improvements**
    - [ ] Add skeleton loaders for better perceived performance
    - [ ] Implement progressive image loading
    - [ ] Add search suggestions/autocomplete
    - [ ] Improve mobile responsiveness
    - [ ] Add accessibility audit and fixes (WCAG 2.1 AA)
    - [ ] Implement PWA features (offline support, install prompt)

11. **Analytics & Insights**
    - [ ] Integrate Google Analytics or similar
    - [ ] Track user behavior (Mixpanel, Amplitude)
    - [ ] A/B testing framework for conversion optimization
    - [ ] Dashboard for partner companies to see their deal performance

12. **Payment Integration** (if monetizing)
    - [ ] Stripe/Razorpay integration for premium subscriptions
    - [ ] Billing and invoice management
    - [ ] Subscription tier management

### Low Priority (P3) - Future Enhancements

13. **Advanced Features**
    - [ ] Multi-language support (i18n)
    - [ ] Dark mode implementation
    - [ ] Advanced filtering (date range, multiple categories)
    - [ ] Export claims to CSV
    - [ ] Integration with startup verification services (Crunchbase API)
    - [ ] Chatbot for deal discovery

---

## UI and Performance Considerations

### Current UI Implementation

**Design System:**
- Custom component library in `components/ui/`
- Tailwind CSS for styling with custom configuration
- Framer Motion for animations
- Three.js for 3D background effects on landing page

**Component Structure:**
- Reusable UI primitives: Button, Card, Input, Modal
- Feature-specific components: DealCard, ClaimCard, StatsCard
- Layout components: Navbar, Footer, AuthGuard

**Animation Strategy:**
- Page transitions using Framer Motion
- Floating elements for visual interest
- 3D scene using Three.js (performance concern)

### Performance Metrics (Current)

**Frontend:**
- Initial page load: ~2-3s (not optimized)
- Time to Interactive: ~3-4s
- Lighthouse Score: Not measured
- Bundle size: Large due to Three.js and Framer Motion

**Backend:**
- Average API response time: ~100-300ms (local dev)
- Database query time: ~50-100ms
- No caching implemented

### Performance Optimization Strategies

#### Frontend Optimizations

1. **Code Splitting & Lazy Loading**
   ```typescript
   // Lazy load heavy components
   const ThreeScene = dynamic(() => import('@/components/animations/ThreeScene'), {
     ssr: false,
     loading: () => <LoadingSpinner />
   });
   ```

2. **Image Optimization**
   - Use Next.js Image component with appropriate sizes
   - Implement blurhash placeholders
   - Serve images from CDN
   - Use WebP format with fallbacks

3. **Bundle Size Reduction**
   - Tree-shake unused dependencies
   - Replace heavy libraries (e.g., Moment.js with date-fns)
   - Use dynamic imports for Three.js (only on landing page)
   - Analyze bundle with @next/bundle-analyzer

4. **Rendering Performance**
   - Implement virtualized lists for deal pages (react-window)
   - Use React.memo for expensive components
   - Debounce search input (300ms)
   - Optimize re-renders with useMemo and useCallback

5. **Asset Delivery**
   - Enable gzip/brotli compression
   - Set up CDN (Cloudflare, AWS CloudFront)
   - Implement service worker for caching
   - Preload critical assets

#### Backend Optimizations

1. **Database Query Optimization**
   ```javascript
   // Implement lean queries (exclude unnecessary fields)
   Deal.find(query).lean().select('title description discount partnerName');
   
   // Use projection to limit returned fields
   // Add compound indexes for common query patterns
   ```

2. **Caching Strategy**
   - Cache deal list in Redis (TTL: 5 minutes)
   - Cache user claims (invalidate on new claim)
   - Implement stale-while-revalidate pattern
   - Use HTTP cache headers (ETag, Last-Modified)

3. **API Response Optimization**
   - Enable compression middleware (compression package)
   - Paginate all list endpoints (implement cursor-based pagination)
   - Implement GraphQL for flexible queries (future consideration)
   - Use response streaming for large datasets

4. **Connection Management**
   - Configure MongoDB connection pooling
   - Implement database replica set for read scaling
   - Use read replicas for read-heavy operations
   - Set up connection timeout and retry logic

### Accessibility Considerations

**Current State:**
- Basic semantic HTML used
- Some ARIA labels present
- Keyboard navigation partially implemented
- No screen reader testing done

**Required Improvements:**
- [ ] Add ARIA landmarks and labels throughout
- [ ] Ensure proper heading hierarchy
- [ ] Implement focus management for modals
- [ ] Add skip to content link
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add alt text for all images
- [ ] Implement keyboard shortcuts for power users

### Mobile Responsiveness

**Current Implementation:**
- Tailwind responsive utilities used
- Mobile-first approach in most components
- Hamburger menu for mobile navigation

**Improvements Needed:**
- [ ] Test on real devices (iOS and Android)
- [ ] Optimize touch targets (minimum 44x44px)
- [ ] Improve mobile form experience
- [ ] Add pull-to-refresh on deal lists
- [ ] Optimize images for mobile networks
- [ ] Consider mobile-specific layouts for complex pages

### Browser Compatibility

**Target Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills Required:**
- None currently (Next.js handles most compatibility)

**Testing Strategy:**
- [ ] Set up BrowserStack for cross-browser testing
- [ ] Add autoprefixer for CSS compatibility
- [ ] Test on older devices for performance baseline

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Git

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd startup-platform
```

**2. Backend Setup**
```bash
cd server
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/startup-benefits
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
CLIENT_URL=http://localhost:3000" > .env

# Start server
npm run dev
```

**3. Frontend Setup**
```bash
cd client
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm run dev
```

**4. Access Application**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/health](http://localhost:5000/health)

### Sample Data

To populate the database with sample deals, you can create a seed script or use MongoDB Compass to manually insert documents.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **3D Graphics:** Three.js
- **HTTP Client:** Axios
- **Data Fetching:** SWR
- **Form Handling:** React Hook Form (to be implemented)
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Security:** Helmet, CORS
- **Logging:** Morgan (dev), needs Winston (production)

### Development Tools
- **Version Control:** Git
- **Code Editor:** VS Code
- **API Testing:** Postman (recommended)
- **Database Client:** MongoDB Compass

---

## Contributing

This is a submission project. For production use, please implement the improvements listed in the "Production Readiness" section.

---


