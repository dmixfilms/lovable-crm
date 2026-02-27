const DEFAULT_LOVABLE_PROMPT = `You are a professional website designer creating a modern, professional website for a {{business_name}} located in {{suburb}}.

Business Details:
- Business: {{business_name}}
- Owner: {{owner_name}}
- Location: {{suburb}}
- Contact: {{phone}}
- Current Website: {{website_url}}

Create a modern, professional website that:
1. Has a clean, professional design matching the industry
2. Includes hero section with business name and main CTA
3. Features key services/products
4. Has contact information and call-to-action buttons
5. Is mobile-responsive
6. Uses modern color scheme and typography
7. Includes testimonials or trust elements

Make it look premium and professional. Focus on converting visitors into customers.`

export function getLovablePrompt(): string {
  if (typeof window === "undefined") return DEFAULT_LOVABLE_PROMPT
  const saved = localStorage.getItem("lovable_prompt")
  return saved || DEFAULT_LOVABLE_PROMPT
}

export function saveLovablePrompt(prompt: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lovable_prompt", prompt)
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
}): string {
  let rendered = prompt
  rendered = rendered.replace(/\{\{business_name\}\}/g, data.business_name || "")
  rendered = rendered.replace(/\{\{owner_name\}\}/g, data.owner_name || "")
  rendered = rendered.replace(/\{\{suburb\}\}/g, data.suburb || "")
  rendered = rendered.replace(/\{\{phone\}\}/g, data.phone || "")
  rendered = rendered.replace(/\{\{website_url\}\}/g, data.website_url || "")
  return rendered
}
