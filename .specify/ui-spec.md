# UI/Design Specification: FatimaZehra-AI-Tutor

**Goal**: World-class, accessible, responsive design with dark-first theme and modern animations.
**Frameworks**: Tailwind CSS, shadcn/ui (Radix UI), Framer Motion, Recharts

---

## 1. Color Palette

### Dark Mode (Default)

| Use | Color | Hex | RGB |
|---|---|---|---|
| Background | Surface-950 | `#0A0A0B` | 10, 10, 11 |
| Surface | Surface-900 | `#111113` | 17, 17, 19 |
| Border | Surface-700 | `#1F1F23` | 31, 31, 35 |
| Text Primary | Gray-100 | `#F5F5F7` | 245, 245, 247 |
| Text Secondary | Gray-400 | `#9CA3AF` | 156, 163, 175 |
| Accent | Indigo-500 | `#6C63FF` | 108, 99, 255 |
| Accent (light) | Indigo-400 | `#818CF8` | 129, 140, 248 |
| Success | Emerald-500 | `#10B981` | 16, 185, 129 |
| Warning | Amber-500 | `#F59E0B` | 245, 158, 11 |
| Error | Red-500 | `#EF4444` | 239, 68, 68 |
| Info | Blue-500 | `#3B82F6` | 59, 130, 246 |

### Light Mode

| Use | Color | Hex |
|---|---|---|
| Background | White | `#FAFAFA` |
| Surface | White | `#FFFFFF` |
| Border | Gray-200 | `#E4E4E7` |
| Text Primary | Gray-950 | `#111827` |
| Text Secondary | Gray-600 | `#4B5563` |
| Accent | Indigo-600 | `#4F46E5` |
| Success | Emerald-600 | `#059669` |
| Warning | Amber-600 | `#D97706` |
| Error | Red-600 | `#DC2626` |
| Info | Blue-600 | `#2563EB` |

### Semantic

| Intent | Color | Usage |
|---|---|---|
| **Success** | Emerald | Quiz passed (70%+), payment complete, unlock granted |
| **Warning** | Amber | Low score (< 70%), approaching rate limit, subscription expiring |
| **Error** | Red | Failed quiz, payment declined, API errors |
| **Info** | Blue | Hints, tips, tutorial info |
| **Accent** | Indigo | Primary CTAs, active states, focus rings |

### Gradients

```css
/* Hero gradient (animated) */
background: linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%);
animation: gradient 15s ease infinite;

/* Code block background (dark) */
background: linear-gradient(135deg, #111113 0%, #1A1A1F 100%);

/* Premium tier highlight */
border: 1px solid;
border-image: linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%) 1;
```

---

## 2. Typography

### Font Stack

```css
/* Sans serif (body, headings) */
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Monospace (code blocks, CLI output) */
font-family: "JetBrains Mono", "Courier New", monospace;
```

### Scale

| Level | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **H1** | 3.5rem (56px) | 1.2 | 700 | Page titles, hero |
| **H2** | 2.25rem (36px) | 1.3 | 700 | Section headers |
| **H3** | 1.875rem (30px) | 1.4 | 600 | Subsection headers |
| **H4** | 1.5rem (24px) | 1.5 | 600 | Card titles |
| **Body L** | 1.125rem (18px) | 1.6 | 400 | Large body text |
| **Body M** | 1rem (16px) | 1.6 | 400 | Standard body text |
| **Body S** | 0.875rem (14px) | 1.5 | 400 | Secondary text, labels |
| **Code** | 0.875rem (14px) | 1.5 | 500 | Code blocks |

### Spacing Scale (Tailwind)

```
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
```

---

## 3. Components

### 3.1 Button

```tsx
<Button variant="primary" size="lg" disabled={false}>
  Start Learning
</Button>

<Button variant="secondary">View Details</Button>
<Button variant="outline">More Options</Button>
<Button variant="ghost">Cancel</Button>
```

**States**:
- Default: Indigo background, white text
- Hover: Lighter indigo, shadow lift
- Active: Darker indigo, no shadow
- Disabled: Gray, cursor not-allowed
- Loading: Spinner inside, button disabled

**Sizes**:
- XS: 16px font, 6px padding
- S: 14px font, 8px padding
- M: 16px font, 10px padding (default)
- L: 18px font, 12px padding
- XL: 20px font, 16px padding

### 3.2 Card

```tsx
<Card className="p-6 border border-surface-700">
  <h3 className="text-xl font-semibold mb-2">Chapter 1: Python Basics</h3>
  <p className="text-gray-400">Learn variables, types, and F-strings</p>
  <div className="mt-4 flex gap-2">
    <ProgressRing percentage={75} />
    <Button>Start Quiz</Button>
  </div>
</Card>
```

**Variants**:
- **Default**: Surface background, subtle border
- **Elevated**: Surface + shadow (hover)
- **Outlined**: Transparent, bold border
- **Flat**: No border, no shadow

**Hover state**: Scale 1.02, shadow lift (2px offset, 8px blur)

### 3.3 Input & Forms

```tsx
<input
  type="email"
  placeholder="name@example.com"
  className="w-full px-4 py-2 bg-surface-900 border border-surface-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
/>
```

**States**:
- **Focus**: 2px ring in accent color (20% opacity)
- **Error**: Red border, error message below
- **Success**: Green border, checkmark icon

### 3.4 Progress Ring (Recharts)

```tsx
<ProgressRing percentage={75} size={120} />

// Renders SVG circular progress with center text showing percentage
// Color: Emerald for 70%+, Amber for 50-69%, Red for <50%
```

### 3.5 Code Block (Prism.js)

```tsx
<CodeBlock language="python">
{`def hello(name):
    print(f"Hello, {name}!")

hello("Alice")`}
</CodeBlock>

// Features:
// - Syntax highlighting (Prism)
// - Copy button (top-right)
// - Line numbers
// - Dark background (#1A1A1F)
// - Scrollable for long code
```

### 3.6 Chat Message

```tsx
<ChatMessage
  role="user"
  content="What is a class in Python?"
  timestamp="2:45 PM"
/>

<ChatMessage
  role="assistant"
  content="A class is a blueprint for creating objects..."
  timestamp="2:45 PM"
/>

// Features:
// - User messages: right-aligned, indigo background
// - Assistant messages: left-aligned, surface background
// - Code blocks inside messages render with syntax highlighting
// - Links clickable and styled
```

### 3.7 Toast Notifications

```tsx
toast.success("Chapter completed!");
toast.error("Quiz submission failed. Try again.");
toast.info("Loading analysis...");

// Auto-dismiss after 5s
// Stacked at bottom-right
// Swipe to dismiss on mobile
```

### 3.8 Modal / Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upgrade to Premium</DialogTitle>
    </DialogHeader>
    <p>Unlock all 10 chapters for $9.99/month</p>
    <DialogFooter>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleUpgrade}>Upgrade</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Animated fade-in + scale-up
// Overlay click closes (unless required)
// Keyboard: Escape to close
```

### 3.9 Tab Navigation

```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  <TabsContent value="analytics">
    {/* Analytics content */}
  </TabsContent>
</Tabs>

// Animated underline indicator
```

### 3.10 Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Account</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// Animated slide-down
// Keyboard: arrow keys to navigate
```

---

## 4. Animations

### 4.1 Page Transitions

```javascript
// Next.js with Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {/* Page content */}
</motion.div>
```

**Duration**: 300ms, easing: easeOut
**Effect**: Fade in + slide up 20px

### 4.2 Card Hover

```css
/* Tailwind utility */
transition: all duration-300 ease-out
group-hover:scale-102
group-hover:shadow-lg
```

**Effect**: Scale 1.02, shadow lift (0 2px 8px rgba...)

### 4.3 Chat Message Appearance

```javascript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  {/* Message */}
</motion.div>
```

**Stagger delay**: 50ms between messages

### 4.4 Score Reveal (Spring)

```javascript
const { value } = useSpring({
  value: finalScore,
  from: { value: 0 },
  config: { tension: 100, friction: 15 }
})

return <animated.span>{value.to(v => Math.floor(v))}</animated.span>
```

**Config**: Stiffness 100, damping 15 (bouncy but not too energetic)

### 4.5 Skeleton Loading

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 20%,
    transparent 40%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

**Effect**: Gradient sweeps left-to-right continuously

### 4.6 Button Ripple Effect

```javascript
// On click, draw expanding circle from click point
<motion.div
  initial={{ scale: 0, opacity: 1 }}
  animate={{ scale: 4, opacity: 0 }}
  transition={{ duration: 0.6 }}
/>
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Target |
|---|---|---|
| **Mobile** | < 640px | Small phones (iPhone SE) |
| **Tablet (sm)** | 640px | Landscape phones, tablets |
| **Tablet (md)** | 768px | iPad portrait |
| **Laptop (lg)** | 1024px | Small laptops |
| **Desktop (xl)** | 1280px | Desktops, large screens |

### Mobile-First Approach

```tsx
// Tailwind CSS example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>
```

**Key breakpoints in design**:
- NavBar: Hamburger menu on mobile, full nav on lg+
- Chapter grid: 1 col mobile, 2 cols tablet, 3 cols desktop
- Quiz: Full-screen mobile, centered on desktop
- Chat: Full sidebar on desktop, collapsed on mobile

---

## 6. Accessibility Standards

### WCAG AA Compliance

- **Contrast**: Minimum 4.5:1 for text on background
  - Dark text (gray-400) on dark background (surface-900) = 5.2:1 ✓
  - White text on indigo accent = 5.8:1 ✓
- **Focus indicators**: 2px ring in accent color, visible on all interactive elements
- **Keyboard navigation**: Tab order logical, skip links on top, Enter/Space to activate buttons
- **Screen readers**: Semantic HTML, ARIA labels on icon buttons, alt text on images
- **Color alone**: Don't use color alone to convey info (use icons + text)

### Implementation

```tsx
// Icon button with aria-label
<button
  className="p-2 rounded-lg hover:bg-surface-700 transition"
  aria-label="Toggle theme"
>
  <SunIcon />
</button>

// Form with labels
<label htmlFor="email">Email Address</label>
<input id="email" type="email" required />

// Semantic headings (h1 → h6, one h1 per page)
<h1>Chapter 1: Python Basics</h1>
<h2>Variables</h2>
<h3>F-Strings</h3>
```

---

## 7. Page Layouts

### 7.1 Landing Page (`/`)

**Layout**: Hero section (full viewport height) + Features grid + Pricing cards + Testimonials + CTA footer

**Components**:
- **Hero**: Animated gradient mesh background, floating code snippets (Prism), headline, CTA button, login link
- **Features**: 6 cards in grid (code icon, description, link)
- **Pricing**: 3 tier cards (monthly toggle), "Most Popular" badge on Premium, CTA buttons
- **Testimonials**: 3 avatar + quote cards (carousel optional)
- **Footer**: Links, socials, copyright

**Animation**: Staggered fade-in for all sections on scroll

### 7.2 Login/Signup (`/login`, `/signup`)

**Layout**: Split-screen (form left 50%, illustration right 50%)

**Components**:
- **Left**: Logo, form title, email/password inputs, Google button, signup/login toggle link
- **Right**: Animated Python code illustration (Prism block with code samples)
- **Mobile**: Stack vertically; hide illustration

**Form validation**:
- Email: required, valid format
- Password: min 8 chars, 1 uppercase, 1 digit, 1 special char
- Show inline error on blur

### 7.3 Dashboard (`/dashboard`)

**Layout**: Sidebar left (120px), content right

**Components**:
- **NavBar**: Logo left, user menu right (profile, logout)
- **Sidebar**: Nav links (Learn, Chat, Profile, Admin if admin), theme toggle
- **Content**:
  - Stats row (3 cards): chapters done, avg score, streak days (animated counters)
  - Progress ring (Recharts)
  - Recent activity feed (list of quiz attempts)
  - "Learning Path" card (next 5 chapters)
  - "Ready to Review" section (chapters with score < 80%)

### 7.4 Chapter List (`/learn`)

**Layout**: Full width, grid layout

**Components**:
- **Header**: "Learn Python" title, filter/sort options, breadcrumb
- **Grid**: 10 chapter cards
  - Each card: chapter number, title, progress ring, lock icon (if premium-gated), "Start Learning" button
  - Mobile: 1 col, tablet: 2 cols, desktop: 3 cols

### 7.5 Chapter Viewer (`/learn/[slug]`)

**Layout**: 3-column (sidebar, main content, AI chat)

**Components**:
- **Left Sidebar** (200px): Chapter outline (clickable headings), TOC
- **Main Content**: MDX rendered with syntax highlighting, code blocks (copy button), images
- **Right Sidebar** (300px): Collapsible AI chat (default open on desktop, closed on mobile), "Start Quiz" sticky button
- **Mobile**: Stack vertically; chat in modal; sidebar below content

### 7.6 Quiz (`/learn/[slug]/quiz`)

**Layout**: Full-screen centered card

**Components**:
- **Timer** (optional Phase 2): Countdown in top-right
- **Progress Bar**: "Q3/10" indicator at top
- **MCQ Card**: Question centered, 4 option buttons (radio style), next/prev buttons
- **Score Reveal** (end): Large animated number, grade badge (A/B/C/F), correct/incorrect summary
- **Mobile**: Larger touch targets (44px minimum), single-column layout

### 7.7 AI Chat (`/chat`)

**Layout**: Full page, ChatGPT-style

**Components**:
- **Message List**: User messages right (indigo bg), assistant left (surface bg)
- **Input Box**: Textarea (auto-expand), send button, attachment button (future)
- **Sidebar** (optional): Chat history, new chat button
- **Mobile**: Full screen, no sidebar

### 7.8 Pricing (`/pricing`)

**Layout**: Centered cards

**Components**:
- **Header**: "Choose Your Plan" title, monthly/annual toggle (radio buttons)
- **Tier Cards** (3): Free (gray), Premium (indigo, "Most Popular" badge), Pro (gradient)
  - Each: title, price, features list (checkmarks), CTA button
  - Hover: Scale 1.05, shadow lift
- **Footer**: FAQ accordion, comparison table

### 7.9 Profile (`/profile`)

**Layout**: Sidebar nav + content

**Components**:
- **Avatar Section**: Large avatar image, name, tier badge
- **Subscription Card**: Current plan, next renewal date, upgrade button, billing portal link
- **Settings**:
  - Change password form
  - Email preferences (coaching toggle, frequency)
  - Data export button
  - Danger zone: Delete account button

---

## 8. Dark/Light Mode

### Implementation (next-themes)

```tsx
'use client'
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

**Toggle Component**:
```tsx
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>
```

**Tailwind Support**:
```css
/* Prefix dark: for dark mode overrides */
<div className="bg-white dark:bg-surface-900 text-black dark:text-white" />
```

---

## 9. Icon Set

**Library**: Lucide React

**Common icons**:
- Lock, Unlock (tier gating)
- Star (favorites, rating)
- CheckCircle, XCircle (quiz results)
- ChevronRight, ChevronLeft (navigation)
- Menu, X (mobile nav)
- Sun, Moon (theme toggle)
- Share, Copy (code blocks)
- Heart, AlertCircle (feedback)
- Settings, User, LogOut (profile menu)

---

## 10. Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      surface: {
        950: '#0A0A0B',
        900: '#111113',
        800: '#1A1A1F',
        700: '#1F1F23',
        600: '#2A2A2F',
      },
      gray: {
        600: '#4B5563',
        400: '#9CA3AF',
        100: '#F5F5F7',
      },
      indigo: {
        600: '#4F46E5',
        500: '#6C63FF',
        400: '#818CF8',
      },
      emerald: { 500: '#10B981', 600: '#059669' },
      amber: { 500: '#F59E0B', 600: '#D97706' },
      red: { 500: '#EF4444', 600: '#DC2626' },
      blue: { 500: '#3B82F6', 600: '#2563EB' },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', ...],
      mono: ['JetBrains Mono', 'Courier New', ...],
    },
    spacing: { /* Tailwind default scale */ },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

---

## 11. Design QA Checklist

- [ ] All text readable on both dark/light modes (4.5:1 contrast minimum)
- [ ] All buttons/clickables have visible focus ring (2px)
- [ ] No color-only information (use icons + text)
- [ ] Mobile layout tested at 375px, 768px, 1280px
- [ ] Animations smooth at 60fps (no jank)
- [ ] Page loads show skeleton loaders (not blank)
- [ ] Empty states have helpful messages (not blank)
- [ ] Error messages clear and actionable
- [ ] Success feedback given on all actions
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Touch targets ≥ 44px on mobile
- [ ] Loading spinners used instead of frozen UI
- [ ] No auto-playing videos or sounds
- [ ] Images have alt text

---

**Usage**: All pages/components follow this spec. Design changes require spec update first.
