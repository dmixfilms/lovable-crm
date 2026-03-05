from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse
from app.services.lead_service import LeadService
from app.services.instagram_scraper import search_instagram_auto

router = APIRouter()


@router.get("/", response_model=LeadListResponse)
def list_leads(
    status: Optional[str] = Query(None),
    suburb: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List leads with optional filters"""
    service = LeadService(db)
    result = service.list_leads(status=status, suburb=suburb, search=search, skip=skip, limit=limit)
    return result


@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new lead"""
    service = LeadService(db)
    lead = service.create_lead(data)
    return lead


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get lead details"""
    service = LeadService(db)
    lead = service.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: str,
    data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update lead information"""
    service = LeadService(db)
    lead = service.update_lead(lead_id, data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}/move", response_model=LeadResponse)
def move_lead_to_stage(
    lead_id: str,
    new_status: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Move lead to a different pipeline stage"""
    service = LeadService(db)
    lead = service.move_to_stage(lead_id, new_status, actor_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found or invalid status")
    return lead


@router.patch("/{lead_id}/approve", response_model=LeadResponse)
def approve_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve a lead - moves it to APPROVED status"""
    from app.models.lead import PipelineStatus
    service = LeadService(db)
    lead = service.move_to_stage(lead_id, PipelineStatus.APPROVED.value, actor_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}/reject", response_model=LeadResponse)
def reject_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject a lead - moves it to REJECTED status"""
    from app.models.lead import PipelineStatus
    service = LeadService(db)
    lead = service.move_to_stage(lead_id, PipelineStatus.REJECTED.value, actor_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/{lead_id}/generate-lovable-url")
def generate_lovable_url(
    lead_id: str,
    db: Session = Depends(get_db),
    body: dict = Body(default={}),
):
    """Generate Lovable Build with URL for creating website preview"""
    from urllib.parse import quote

    service = LeadService(db)
    lead = service.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Extract contact information
    primary_email = lead.emails[0] if lead.emails and len(lead.emails) > 0 else None
    phone = lead.phone or None
    address = lead.address or None
    suburb = lead.suburb or "Australia"
    website_url = lead.website_url or None
    owner_name = lead.owner_name or "Business Owner"
    industry = lead.industry_category or "Professional Services"

    # USE CUSTOM PROMPT IF PROVIDED, OTHERWISE USE DEFAULT
    custom_prompt = body.get("prompt") if body else None
    if custom_prompt and isinstance(custom_prompt, str) and len(custom_prompt) > 20:
        prompt = custom_prompt
        print(f"✅ CUSTOM PROMPT RECEIVED! Using {len(prompt)} chars from frontend")
    else:
        # Build default prompt for Lovable (if no custom prompt provided)
        prompt = f"""
⚠️ CRITICAL REQUIREMENTS - PLEASE READ CAREFULLY ⚠️

YOU ARE A PREMIUM WEB DESIGNER. Create an exceptional, modern website redesign for {lead.business_name}.

MOST IMPORTANT: **ALL EXISTING CONTENT, MENUS, INFORMATION, AND BRANDING FROM THE CURRENT WEBSITE MUST BE PRESERVED AND INCLUDED IN THE NEW DESIGN. DO NOT REMOVE ANYTHING.**

═══════════════════════════════════════════════════════════════════════════

📋 COMPANY INFORMATION:
• Business Name: {lead.business_name}
• Industry: {industry}
• Owner: {owner_name}
• Location: {suburb}
{"• Address: " + address if address else ""}
{"• Phone: " + phone if phone else ""}
{"• Email: " + primary_email if primary_email else ""}
{"• Current Website: " + website_url if website_url else "• No current website - Create from scratch with modern design"}

═══════════════════════════════════════════════════════════════════════════

🚨 CRITICAL INSTRUCTIONS - PRESERVATION OF EXISTING CONTENT:

1. **ANALYZE THE CURRENT WEBSITE (if exists at {website_url})**:
   ⚠️ THIS IS EXTREMELY IMPORTANT ⚠️
   - Visit and thoroughly analyze EVERY page
   - Extract ALL navigation menus (main menu, submenus, footer menus)
   - Identify ALL sections and pages
   - Note ALL content, text, descriptions
   - Extract ALL images, logos, product photos
   - Document ALL brand colors and visual elements
   - List ALL services or products offered
   - Copy ALL contact information and details
   - Screenshot the layout to understand structure
   - NOTHING should be lost in the redesign

2. **PRESERVE ALL MENUS**:
   ⚠️ CRITICAL ⚠️
   - If website has multiple navigation menus, RECREATE ALL OF THEM
   - Maintain exact menu structure and hierarchy
   - Keep all menu items in the same logical order
   - Add submenu items if they exist
   - Include footer navigation links
   - Create breadcrumb navigation if applicable

3. **PRESERVE ALL CONTENT**:
   ⚠️ CRITICAL ⚠️
   - Every page of content must be included
   - All text content must be present
   - All product/service descriptions must be included
   - All testimonials or reviews must be preserved
   - All contact information must be visible
   - All legal information/disclaimers must be present
   - All social media links must be included

4. **PRESERVE BRANDING**:
   ⚠️ CRITICAL ⚠️
   - Extract exact color codes from current website
   - Include company logo in prominent position
   - Maintain brand identity throughout
   - Use same typography style (or upgrade it modernly)
   - Keep brand messaging and taglines

═══════════════════════════════════════════════════════════════════════════

🎨 MODERN REDESIGN SPECIFICATIONS:

1. **Modern Layout & Design**:
   - Create COMPLETELY NEW, modern 2026 aesthetic layout
   - While preserving ALL content and information
   - Modern, premium visual design
   - Contemporary color enhancements (but preserve original palette)
   - Improved typography and spacing
   - Professional visual hierarchy

2. **TECHNICAL SPECIFICATIONS**:
   - Build with semantic HTML5 and modern CSS3
   - Include smooth animations and transitions throughout
   - Fully responsive design (mobile-first approach)
   - Fast loading and optimized performance
   - Professional typography and spacing
   - Accessibility standards (WCAG compliant)

3. **ENHANCED SECTIONS** (with all existing content):
   - Modern Hero Section (with company mission/value)
   - Navigation Menu with ALL original items
   - All existing service/product sections
   - Enhanced About/Company Overview
   - Integrated Contact Form with all fields
   - Strategic Call-To-Action buttons
   - Image gallery with all company photos
   - Team section (if exists)
   - Testimonials (if exists)
   - Blog/News section (if exists)
   - Pricing section (if exists)
   - Footer with ALL original links and info

4. **ANIMATIONS & INTERACTIVITY**:
   - Smooth scroll animations
   - Hover effects on buttons and links
   - Fade-in animations on section visibility
   - Smooth page transitions
   - Loading animations where appropriate
   - Interactive elements where they enhance UX

5. **FOOTER** (CRITICAL - EXACTLY AS SPECIFIED):
   ⚠️ PRESERVE ALL ORIGINAL FOOTER CONTENT + ADD THIS ⚠️
   - Include ALL original footer information and links
   - Add this EXACT text at the bottom:
   "Concept redesigned by DMIX Media Works 2026 - Not affiliated. Private Proposal."
   - Add a subtle COUNTDOWN TIMER: "⏰ This preview expires in 7 days"
   - Display remaining days/hours in real-time
   - Add notice: "Approval required to proceed with full deployment"
   - Keep original contact information

═══════════════════════════════════════════════════════════════════════════

✨ DESIGN PHILOSOPHY:

- **Nothing Lost**: Every menu, page, content, image, color from the original MUST be in the new design
- **Everything Enhanced**: Present it with modern, premium aesthetics
- **User Experience First**: Maintain content but improve how it's presented
- **Brand Consistency**: Keep brand identity while modernizing visual design
- **Completeness**: If original has 10 pages, new site must have all 10 pages worth of content

═══════════════════════════════════════════════════════════════════════════

🎯 VERIFICATION CHECKLIST:

Before finishing, verify:
☑️ All original menus are present and functional
☑️ All original content is included
☑️ All images and logos are preserved
☑️ All original colors are maintained
☑️ All pages/sections from original are redesigned
☑️ All contact information is visible
☑️ Modern, 2026-style design aesthetic applied
☑️ Responsive and mobile-friendly
☑️ Footer contains required DMIX attribution
☑️ 7-day countdown timer is visible
☑️ Nothing from original website is removed

═══════════════════════════════════════════════════════════════════════════

🚀 START BUILDING NOW - Create something amazing while preserving EVERYTHING!
    """.strip()

    # Create Lovable URL with hash fragment (not query parameter)
    from urllib.parse import quote
    encoded_prompt = quote(prompt)
    lovable_url = f"https://lovable.dev/?autosubmit=true#prompt={encoded_prompt}"

    return {
        "lovable_url": lovable_url,
        "lead_id": lead_id,
        "business_name": lead.business_name,
        "message": "Open this URL in a new tab to create the website preview. When ready, come back and add the preview link."
    }


@router.post("/{lead_id}/search-instagram")
async def search_instagram(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search Instagram using saved session
    """
    from app.services.instagram_search import search_instagram

    service = LeadService(db)
    lead = service.get_lead(lead_id)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if not lead.address:
        raise HTTPException(status_code=400, detail="Lead address is required for matching")

    # Search Instagram
    result = await search_instagram(
        business_name=lead.business_name,
        original_address=lead.address
    )

    # If perfect match found, update lead automatically
    if result.get('success') and result.get('address_match'):
        lead.instagram_url = result['instagram_url']
        if result.get('phone') and not lead.phone:
            lead.phone = result['phone']
        db.commit()
        db.refresh(lead)

    return result


@router.post("/instagram/init-login")
async def init_instagram_login(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Initialize Instagram session
    Opens browser for manual login, saves session for future searches
    """
    from app.services.instagram_search import authenticate_instagram_interactive

    try:
        print("🔐 Starting Instagram login...")
        await authenticate_instagram_interactive()
        return {
            "success": True,
            "message": "✅ Login concluído! Session salva. Você pode buscar leads agora.",
            "status": "authenticated"
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "status": "error"
        }

@router.get("/instagram/status")
async def get_instagram_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current Instagram session status"""
    from app.services.instagram_session_manager import InstagramSessionManager

    status = InstagramSessionManager.get_status()
    return status
