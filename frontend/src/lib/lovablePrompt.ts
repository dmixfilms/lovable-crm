const DEFAULT_LOVABLE_PROMPT = `You are an elite web designer creating an INNOVATIVE, PREMIUM website for {{business_name}} in {{suburb}}.

CRITICAL REQUIREMENTS:
===================

1. BRAND IDENTITY ANALYSIS & IMPLEMENTATION
   - Extract and analyze the brand's visual identity from their current website ({{website_url}})
   - Research Instagram profiles if available
   - Identify: primary brand colors, secondary colors, typography style, brand personality
   - Use extracted logo, name, colors, and slogan throughout the design
   - Create a cohesive visual identity that elevates their current brand

2. VISUAL CONTENT STRATEGY
   - Search and analyze images from their current website and social media
   - Use real photos from their business when available and visually appropriate
   - If insufficient real photos: Generate AI images that match their business type
   - For {{business_name}}: Create authentic-looking imagery matching their specific niche
   - Ensure all images tell their brand story and showcase their unique value

3. 2026 DESIGN TRENDS & INNOVATION
   - Implement cutting-edge 2026 web design trends:
     * Glassmorphism effects with subtle transparency and backdrop blur
     * Smooth micro-interactions and hover animations
     * Dark mode with gradient accents (modern sophistication)
     * AI-inspired geometric patterns and mesh gradients
     * Kinetic typography with animated text effects
     * Smooth scroll animations and parallax effects
     * Advanced SVG animations and custom cursors
     * Asymmetrical layouts with bold typography
     * Advanced color gradients and color-shifting effects
   - Make the design VISUALLY STUNNING compared to their old website
   - Create "wow moments" with innovative visual elements

4. TECHNICAL SPECIFICATIONS
   - Pure HTML5 + CSS3 (no frameworks, lightweight and fast)
   - Fully responsive: mobile-first design
   - Performance optimized: fast loading, smooth animations
   - Accessibility compliant (WCAG 2.1 AA)
   - Mobile responsiveness: perfect on all devices (320px - 4K)
   - Custom animations using CSS keyframes (smooth 60fps)

5. WEBSITE STRUCTURE & SECTIONS
   - HERO SECTION: Bold, animated hero with their logo and main CTA
     * High-impact opening statement highlighting unique value
     * Animated background with subtle parallax
     * Call-to-action button with hover effects

   - ABOUT SECTION: Brand story with visual elements
     * Their brand story and mission
     * Visual representation of what makes them unique
     * Showcase their values and personality

   - SERVICES/PRODUCTS: Dynamic showcase of offerings
     * Feature their main services/products with real or AI-generated images
     * Use interactive cards with hover animations
     * Include prices if applicable

   - PORTFOLIO/GALLERY: Visual showcase
     * Use real images from their current site/Instagram
     * Create styled gallery with smooth animations
     * Include testimonials/reviews if available

   - CONTACT SECTION: Modern contact form
     * Contact information: Phone ({{phone}})
     * Embedded map or address details
     * Contact form with validation

   - FOOTER: Brand consistency
     * Links and social media
     * Company information

6. VISUAL EFFECTS & ANIMATIONS
   - Hover effects on all interactive elements
   - Smooth page transitions and scroll animations
   - Animated counters, progress bars, and data visualization
   - Parallax scrolling effects
   - Gradient text animations
   - Button hover/click feedback animations
   - Loading animations and state changes
   - Micro-interactions that delight users

7. COLOR STRATEGY
   - Use their brand colors as primary palette
   - Create complementary color schemes
   - Use gradients inspired by their brand
   - Implement dark mode aesthetic with their colors
   - Ensure excellent contrast for readability

8. TYPOGRAPHY
   - Modern, premium font selections
   - Hierarchy clearly established
   - Large, bold headlines for impact
   - Readable body text (16px+ on desktop)
   - Font sizes scale responsively

9. PERFORMANCE & USER EXPERIENCE
   - Fast load times (optimized images, minimal CSS)
   - Smooth 60fps animations
   - Intuitive navigation
   - Clear user journey
   - Mobile-optimized touch targets
   - Fast interactions and transitions

10. FINAL QUALITY CHECKS
    - Design is DRAMATICALLY better than their current website
    - Visual impact is premium and professional
    - All brand elements are properly represented
    - Fully responsive and tested on all device sizes
    - Animations are smooth and purposeful
    - User experience is smooth and engaging

DESIGN PHILOSOPHY:
Make this website a SHOWSTOPPER that:
- Represents the brand at its absolute best
- Creates immediate positive impressions
- Converts visitors into customers
- Works flawlessly on all devices
- Showcases their unique value proposition
- Uses cutting-edge 2026 design trends
- Feels premium and innovative

Business Context:
- Business: {{business_name}}
- Owner: {{owner_name}}
- Location: {{suburb}}
- Phone: {{phone}}
- Current Website: {{website_url}}

Create an INNOVATIVE, PREMIUM website using HTML5 + CSS3 that makes their previous website look outdated. Every visual element should be intentional, polished, and contribute to converting visitors into customers.`

export function getLovablePrompt(): string {
  if (typeof window === "undefined") return DEFAULT_LOVABLE_PROMPT

  // ALWAYS remove old key first to prevent conflicts
  localStorage.removeItem("lovable_prompt")

  // Force fresh read from localStorage every time (no caching)
  const saved = localStorage.getItem("lovable_prompt_v2")

  if (saved && saved.length > 10) {
    // Return saved prompt if it exists and is not empty
    return saved
  }

  // Default only if nothing is saved
  return DEFAULT_LOVABLE_PROMPT
}

export function saveLovablePrompt(prompt: string): void {
  if (typeof window !== "undefined") {
    // IMMEDIATELY remove old key to prevent conflicts
    localStorage.removeItem("lovable_prompt")
    localStorage.removeItem("lovable_prompt") // Double check

    // Clear any old cache
    sessionStorage.removeItem("lovable_prompt")
    sessionStorage.removeItem("lovable_prompt_v2")

    // Save with new version key
    localStorage.setItem("lovable_prompt_v2", prompt)

    // Log for debugging
    console.log("✅ Prompt saved to localStorage:", prompt.substring(0, 50) + "...")
    console.log("🗑️  Old prompt key removed")

    // Force browser to recognize the change
    window.dispatchEvent(new Event("lovable_prompt_updated"))
  }
}

export function getDefaultLovablePrompt(): string {
  return DEFAULT_LOVABLE_PROMPT
}

export function renderPrompt(prompt: string, data: {
  business_name?: string
  owner_name?: string
  suburb?: string
  phone?: string
  website_url?: string
  email?: string
  industry?: string
  address?: string
  instagram?: string
}): string {
  let rendered = prompt
  rendered = rendered.replace(/\{\{business_name\}\}/g, data.business_name || "")
  rendered = rendered.replace(/\{\{owner_name\}\}/g, data.owner_name || "")
  rendered = rendered.replace(/\{\{suburb\}\}/g, data.suburb || "")
  rendered = rendered.replace(/\{\{phone\}\}/g, data.phone || "")
  rendered = rendered.replace(/\{\{website_url\}\}/g, data.website_url || "")
  rendered = rendered.replace(/\{\{email\}\}/g, data.email || "")
  rendered = rendered.replace(/\{\{industry\}\}/g, data.industry || "")
  rendered = rendered.replace(/\{\{address\}\}/g, data.address || "")
  rendered = rendered.replace(/\{\{instagram\}\}/g, data.instagram || "")
  return rendered
}
