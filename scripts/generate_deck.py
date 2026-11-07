import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen dimensions (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette
    BG_DARK = RGBColor(11, 19, 43)        # #0B132B Deep Slate Navy
    CARD_BG = RGBColor(22, 33, 62)        # #16213E Card Surface
    CARD_BORDER = RGBColor(39, 55, 95)    # #27375F Border Accent
    TEXT_LIGHT = RGBColor(248, 250, 252)  # #F8FAFC Off white
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8 Slate Gray
    EMERALD = RGBColor(16, 185, 129)      # #10B981 Vibrant Green
    CYAN = RGBColor(6, 182, 212)          # #06B6D4 Electric Cyan
    AMBER = RGBColor(245, 158, 11)        # #F59E0B Warning/SWIFT Amber
    ROSE = RGBColor(244, 63, 94)          # #F43F5E Benchmark Red

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, slide_num, title, category="CROSS-BORDER FX SPREAD & REMITTANCE ROUTER"):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_top = tf_cat.margin_right = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = f"{category.upper()}  |  PAGE {slide_num} OF 12"
        p_cat.font.name = "Segoe UI"
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = CYAN

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.name = "Segoe UI"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title="", title_color=CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.2)

        if title:
            tbox = slide.shapes.add_textbox(Inches(left + 0.25), Inches(top + 0.2), Inches(width - 0.5), Inches(0.4))
            tf = tbox.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Segoe UI"
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = title_color
        return card

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)

    banner = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(3.2), Inches(0.35))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(16, 185, 129)
    banner.line.fill.background()
    tf_b = banner.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "SERIES A / EXECUTIVE BUSINESS DECK"
    p_b.font.name = "Segoe UI"
    p_b.font.size = Pt(9)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(11, 19, 43)
    p_b.alignment = PP_ALIGN.CENTER

    tbox1 = s1.shapes.add_textbox(Inches(0.8), Inches(2.4), Inches(11.5), Inches(2.2))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Cross-Border FX Spread &\nRemittance Router"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Tracks real-time spreads across SWIFT, local rails, and fintech partners, dynamically routing international commercial supplier transfers for optimal rates."
    p1_sub.font.name = "Segoe UI"
    p1_sub.font.size = Pt(16)
    p1_sub.font.color.rgb = TEXT_MUTED

    card_b = add_card(s1, 0.8, 5.2, 11.7, 1.4, "")
    tbox_ft = s1.shapes.add_textbox(Inches(1.1), Inches(5.4), Inches(11.1), Inches(1.0))
    tf_ft = tbox_ft.text_frame
    tf_ft.word_wrap = True
    p_ft = tf_ft.paragraphs[0]
    p_ft.text = "Commercial Model: $2,000/mo Enterprise Retainer or Basis Point (bps) Profit Split"
    p_ft.font.name = "Segoe UI"
    p_ft.font.size = Pt(15)
    p_ft.font.bold = True
    p_ft.font.color.rgb = EMERALD

    p_ft2 = tf_ft.add_paragraph()
    p_ft2.text = "Multi-Rail Liquidity Abstraction • Real-Time Interbank Spread Arbitrage • Sub-Hour Commercial Settlement"
    p_ft2.font.name = "Segoe UI"
    p_ft2.font.size = Pt(12)
    p_ft2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 2: Executive Summary & Thesis
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, 2, "Executive Summary: The Cross-Border Treasury Inefficiency")

    c1 = add_card(s2, 0.8, 1.8, 3.65, 4.8, "1. THE PROBLEM", ROSE)
    tb1 = s2.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(3.25), Inches(3.9))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "• Opacity & Rent Seeking:\nCommercial enterprises lose 220-290 basis points (2.2%-2.9%) on international SWIFT supplier payouts.\n\n• Hidden Bank Deductions:\nIntermediary correspondent lifting fees ($40-$60 per wire) and unpredictable foreign exchange hair-cuts.\n\n• Slow Execution:\n2 to 5 business days settlement window ties up working capital and damages foreign supplier relationships."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    c2 = add_card(s2, 4.8, 1.8, 3.65, 4.8, "2. OUR SOLUTION", EMERALD)
    tb2 = s2.shapes.add_textbox(Inches(5.0), Inches(2.5), Inches(3.25), Inches(3.9))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "• Smart Multi-Rail Router:\nDynamic execution algorithm continually scanning SWIFT, Domestic Clearing (SEPA, ACH, Pix, NEFT), and Fintech Partners (Airwallex, Wise, Nium).\n\n• Least-Cost Payouts:\nDelivers up to 95% reduction in transfer fees and guarantees optimal net landing amounts.\n\n• Sub-Hour Delivery:\nRoutes commercial payments through instant local clearing rails for sub-120 minute settlement."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    c3 = add_card(s2, 8.8, 1.8, 3.65, 4.8, "3. BUSINESS TRACTION", CYAN)
    tb3 = s2.shapes.add_textbox(Inches(9.0), Inches(2.5), Inches(3.25), Inches(3.9))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "• Aligned Monetization:\n$2,000/mo flat enterprise retainer OR a 20 bps split of client treasury savings against high-street banks.\n\n• Instant ROI for Clients:\nEvery $1M in cross-border volume generates ~$24,000+ in audited savings.\n\n• Software-Defined Rails:\nPure API orchestration requiring zero balance sheet credit risk or nostro pre-funding."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 3: The Problem (The Hidden FX Tax)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, 3, "The Enterprise Pain Point: The $150B Hidden FX Tax")

    add_card(s3, 0.8, 1.8, 5.6, 4.8, "Traditional Commercial Banking Pain Points", ROSE)
    tbp = s3.shapes.add_textbox(Inches(1.05), Inches(2.4), Inches(5.1), Inches(4.0))
    tfp = tbp.text_frame
    tfp.word_wrap = True
    p = tfp.paragraphs[0]
    p.text = "1. Predatory Hidden FX Markups\nBanks quote 'zero fee' wires while embedding 2.2% - 3.0% spreads above the interbank mid-market rate.\n\n2. The Correspondent Banking Black Box\nPayments pass through 2-4 correspondent banks, each peeling off $15-$30 lifting fees without traceability.\n\n3. Beneficiary Payout Shortfalls\nSuppliers receive short payments due to intermediary deductions, triggering invoice disputes and supplier strain.\n\n4. Trapped Capital & Liquidity Drag\nT+3 to T+5 settlement times force CFOs to maintain defensive idle cash buffers across fragmented regional banks."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s3, 6.8, 1.8, 5.7, 4.8, "The Math on a Single $100,000 Commercial Wire", AMBER)
    tbm = s3.shapes.add_textbox(Inches(7.05), Inches(2.4), Inches(5.2), Inches(4.0))
    tfm = tbm.text_frame
    tfm.word_wrap = True
    p = tfm.paragraphs[0]
    p.text = "• Transfer Amount: $100,000 USD to EUR (Supplier in Germany)\n• True Interbank Mid-Market Rate: 0.9242 (€92,420 net value)\n\nTRADITIONAL COMMERCIAL BANK VIA SWIFT:\n• Applied Bank Rate: 0.9001 (260 bps hidden spread)\n• Outgoing Wire Fee: $45.00\n• Intermediary Lifting Deductions: $25.00\n• Net Landing Amount for Supplier: €89,985\n• Hidden Value Extracted: €2,435 (~$2,630 USD Lost!)\n\nOUR ROUTER VIA DOMESTIC SEPA / AIRWALLEX:\n• Applied Router Rate: 0.9216 (28 bps transparent spread)\n• Direct Rail Fee: $3.00\n• Net Landing Amount for Supplier: €92,157\n• Realized Client Savings: $2,350+ on a single wire!"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 4: The Solution (The Remittance Router)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, 4, "The Solution: Dynamic Multi-Rail Remittance Router")

    pillars = [
        ("Real-Time Liquidity Aggregator", "Constantly micro-polls and aggregates live bid-ask spreads across SWIFT, local rails (ACH, SEPA Instant, Pix, NEFT, FedNow), and fintech aggregators (Wise, Airwallex, Nium).", CYAN),
        ("Intelligent Optimization Engine", "Algorithmic decision tree ranking payment routes across 4 distinct strategies: Lowest Cost, Instant SLA Delivery, Maximum Reliability, or Balanced Blend.", EMERALD),
        ("Supplier Directory & Rail Mapping", "Automated parsing of international bank account numbers, IBANs, IFSC codes, and currency preferences to match optimal destination domestic rails.", TEXT_LIGHT),
        ("Transparent Savings & Audit Log", "Live side-by-side comparison with high-street bank benchmarks, locking in quotes with guaranteed execution and zero hidden FX slippage.", AMBER),
    ]

    for i, (title, desc, color) in enumerate(pillars):
        x = 0.8 + (i % 2) * 5.95
        y = 1.8 + (i // 2) * 2.45
        add_card(s4, x, y, 5.75, 2.25, title, color)
        tb = s4.shapes.add_textbox(Inches(x + 0.25), Inches(y + 0.75), Inches(5.25), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 5: Market Opportunity
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, 5, "Market Opportunity: $40 Trillion B2B Cross-Border Wave")

    add_card(s5, 0.8, 1.8, 3.65, 2.3, "TAM: $40 Trillion", CYAN)
    tb = s5.shapes.add_textbox(Inches(1.05), Inches(2.45), Inches(3.15), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Total Global B2B Cross-Border Payments volume by 2027 (McKinsey Global Payments Report)."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s5, 4.8, 1.8, 3.65, 2.3, "SAM: $8.5 Trillion", EMERALD)
    tb = s5.shapes.add_textbox(Inches(5.05), Inches(2.45), Inches(3.15), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Mid-Market Global Trade, Manufacturing & Digital Supply Chains lacking specialized tier-1 treasury desks."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s5, 8.8, 1.8, 3.65, 2.3, "SOM: $350 Billion", AMBER)
    tb = s5.shapes.add_textbox(Inches(9.05), Inches(2.45), Inches(3.15), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Immediate high-frequency commercial payables target in US-EU, US-APAC, and EU-LATAM corridors."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s5, 0.8, 4.4, 11.7, 2.3, "Macro Tailwinds Driving Adoption", TEXT_LIGHT)
    tb_m = s5.shapes.add_textbox(Inches(1.05), Inches(5.0), Inches(11.2), Inches(1.5))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    p = tf_m.paragraphs[0]
    p.text = "1. Global Instant Payment Mandates: European SEPA Instant regulation, US FedNow, Brazil Pix, and India UPI opening direct domestic clearing to fintechs.\n2. ISO 20022 Data Rich Messaging: Standardized financial telemetry enabling programmatic cross-rail translation.\n3. Treasury Margin Squeeze: Corporate CFOs facing higher cost of capital demand automated FX spread minimization without switching primary banks."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 6: Product Architecture & Tech Stack
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, 6, "Product Architecture: Enterprise-Ready Full-Stack")

    layers = [
        ("Frontend: Next.js App Router (TypeScript)", "• High-performance React Server Components\n• Tailwind CSS responsive financial UI\n• Real-time quote calculators and corridor visualizers\n• Standalone Docker production image (120MB)"),
        ("Backend: Node.js & Express.js (ES Modules)", "• Clean domain-driven architecture (Services, Controllers, Routes)\n• Resilient multi-rail aggregation & routing algorithm\n• Rate-limiting, HTTP compression & reverse proxy trust\n• Graceful shutdown draining active transactions"),
        ("Data Layer: MongoDB & Mongoose Schema", "• High-throughput documents for rate feeds & corridor history\n• Strict Zod validation & Mongoose relational integrity\n• Granular user roles (Treasury Manager, Operator, Auditor)\n• Real-time audit trail of client savings & platform split"),
        ("DevOps & Production Infrastructure", "• Multi-stage Docker Compose (Mongo 7.0 + API + Web)\n• Automated CI/CD GitHub Actions pipeline\n• One-click Render / Railway / AWS ECS blueprint\n• Self-seeding database for zero-downtime provisioning")
    ]

    for i, (title, bullet_text) in enumerate(layers):
        x = 0.8 + (i % 2) * 5.95
        y = 1.8 + (i // 2) * 2.45
        add_card(s6, x, y, 5.75, 2.3, title, CYAN)
        tb = s6.shapes.add_textbox(Inches(x + 0.25), Inches(y + 0.7), Inches(5.25), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = bullet_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 7: Multi-Rail Spread Economics
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7)
    add_header(s7, 7, "Multi-Rail Spread Economics: Benchmarking The Arbitrage")

    add_card(s7, 0.8, 1.8, 11.7, 4.8, "Execution Rail Benchmark Comparison Matrix", EMERALD)
    tb_t = s7.shapes.add_textbox(Inches(1.05), Inches(2.4), Inches(11.2), Inches(4.0))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    p = tf_t.paragraphs[0]
    p.text = """METRIC                TRADITIONAL SWIFT BANK      LOCAL DOMESTIC RAILS        FINTECH PARTNERS (AIRWALLEX/WISE)
FX Spread (bps)       220 - 290 bps (2.2% - 2.9%)  40 - 50 bps (0.4% - 0.5%)   28 - 35 bps (0.28% - 0.35%)
Fixed Transfer Fee    $45.00 - $65.00             $3.50 - $5.00               $2.50 - $3.50
Intermediary Haircut  $20.00 - $45.00 lifting fee $0.00 (Direct clearing)     $0.00 (Pre-funded local accounts)
Settlement Window     48 to 72+ hours             1 to 2 hours (Instant)      2 to 4 hours
Delivery Certainty    Variable (Lost traces)      99.1% (Local clearing)      99.8% (Guaranteed SLA)
Traceability          MT103 SWIFT gpi             Instant local ACK           End-to-end webhook tracking

REAL-WORLD CASE: $150,000 USD TO EUR COMMERCIAL SUPPLIER TRANSFER:
• Standard Bank Total Cost: $3,945 ($45 wire + $3,900 FX spread) -> Net Landed: €134,850
• Our Multi-Rail Router:    $183 ($3 wire + $180 FX spread)     -> Net Landed: €138,350
• AUDITED VALUE SAVED:      $3,762.00 (95.3% reduction in transaction drag!)"""
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 8: Business & Monetization Model
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8)
    add_header(s8, 8, "Business Model: $2,000/mo Retainer or Bps Profit Split")

    add_card(s8, 0.8, 1.8, 5.65, 4.8, "MODEL 1: Enterprise Retainer ($2,000 / mo)", CYAN)
    tb_m1 = s8.shapes.add_textbox(Inches(1.05), Inches(2.4), Inches(5.15), Inches(4.0))
    tf_m1 = tb_m1.text_frame
    tf_m1.word_wrap = True
    p = tf_m1.paragraphs[0]
    p.text = "• Target Profile:\nLarge mid-market commercial enterprises routing > $1M/month in international supplier transfers.\n\n• Predictable SaaS Economics:\nFlat $24,000 Annual Contract Value (ACV) providing unlimited intelligent multi-rail routing.\n\n• Zero Variable Friction:\nTreasurers keep 100% of realized FX spread savings after the flat software license.\n\n• Customer ROI:\nBreaks even on the very first $100k wire of each month; pure upside thereafter."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s8, 6.85, 1.8, 5.65, 4.8, "MODEL 2: Basis Point (bps) Profit Split", EMERALD)
    tb_m2 = s8.shapes.add_textbox(Inches(7.1), Inches(2.4), Inches(5.15), Inches(4.0))
    tf_m2 = tb_m2.text_frame
    tf_m2.word_wrap = True
    p = tf_m2.paragraphs[0]
    p.text = "• Target Profile:\nGrowing SME importers, supply-chain traders, and cautious corporate CFOs seeking zero-risk adoption.\n\n• 20 - 30 Basis Point Profit Cut:\nWe retain 20% of audited savings realized against standard commercial bank benchmarks.\n\n• Frictionless Zero-Budget Onboarding:\nNo upfront cost or board budget approval required; we only earn when the client saves hard dollars.\n\n• Scalable Flywheel:\nAs supplier volume scales, revenue naturally compounds with zero customer churn."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 9: Go-To-Market Strategy
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9)
    add_header(s9, 9, "Go-To-Market (GTM): Viral Commercial Distribution")

    gtm_channels = [
        ("Direct Mid-Market CFO Outbound", "Targeting CFOs and Treasurers of cross-border enterprises with $5M-$100M annual revenue. Pitch: 'Audit your last 3 SWIFT wires—we will prove $50k+ annual leaked margin.'", CYAN),
        ("ERP & Accounting Integration", "Plugins for NetSuite, SAP Business One, Xero, and QuickBooks, enabling one-click 'Optimize Route' directly inside existing Accounts Payable workflows.", EMERALD),
        ("Supplier Virality Network Effect", "When international suppliers receive exact un-haircut invoice amounts in 90 minutes via local rails, they recommend our Router to their other global buyers.", TEXT_LIGHT),
        ("Fintech & Neobank Distribution", "Co-selling partnerships with corporate card issuers, trade finance platforms, and B2B procurement portals seeking embedded remittance optimization.", AMBER),
    ]

    for i, (title, desc, color) in enumerate(gtm_channels):
        x = 0.8 + (i % 2) * 5.95
        y = 1.8 + (i // 2) * 2.45
        add_card(s9, x, y, 5.75, 2.25, title, color)
        tb = s9.shapes.add_textbox(Inches(x + 0.25), Inches(y + 0.75), Inches(5.25), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 10: Competitive Landscape & Moats
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10)
    add_header(s10, 10, "Competitive Landscape: Unfair Strategic Moats")

    add_card(s10, 0.8, 1.8, 11.7, 4.8, "Competitive Positioning Matrix", CYAN)
    tb_c = s10.shapes.add_textbox(Inches(1.05), Inches(2.4), Inches(11.2), Inches(4.0))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = """SOLUTION               SPREAD ARBITRAGE  SUB-HOUR RAILS  MULTI-RAIL FAILOVER  PROFIT-SPLIT PRICING
Traditional Banks      NO (220-290 bps)  NO (2-5 days)   NO (SWIFT only)      NO (Opaque fees)
Single Fintech Rails   PARTIAL (Fixed)   YES (Selective) NO (Single partner)  NO (Subscription only)
Legacy Treasury (TMS)  NO (Just monitor) NO (No routing) NO (Manual execution)NO ($100k+ setup)
OUR REMITTANCE ROUTER  YES (Real-time)   YES (Local ACH) YES (Multi-Partner)  YES ($2k or 20 bps)

OUR UNFAIR ADVANTAGES & DEFENSIVE MOATS:
1. Vendor-Agnostic Routing: We never take balance sheet risk or lock into one rail partner. We arbitrate between them.
2. Intelligent Corridor Optimization: If SWIFT is congested or a fintech spreads widen, our algorithm dynamically reroutes.
3. Radical Pricing Transparency: By offering a pure $2,000/mo flat retainer or bps profit-split, our incentives are 100% aligned with the customer's margin preservation."""
    p.font.name = "Consolas"
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 11: Financial Projections & Unit Economics
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11)
    add_header(s11, 11, "Financial Projections: High-Margin Software Scalability")

    add_card(s11, 0.8, 1.8, 3.65, 2.7, "Year 1: Foundation", CYAN)
    tb = s11.shapes.add_textbox(Inches(1.05), Inches(2.45), Inches(3.15), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "• Active Accounts: 25 Enterprises\n• Annual Payment Volume: $60M\n• Annual Gross Revenue: $960,000\n• Retainer Mix: 60% | Bps Mix: 40%\n• Gross Margin: 82%"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s11, 4.8, 1.8, 3.65, 2.7, "Year 2: Acceleration", EMERALD)
    tb = s11.shapes.add_textbox(Inches(5.05), Inches(2.45), Inches(3.15), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "• Active Accounts: 120 Enterprises\n• Annual Payment Volume: $360M\n• Annual Gross Revenue: $4,800,000\n• Retainer Mix: 50% | Bps Mix: 50%\n• Gross Margin: 86%"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s11, 8.8, 1.8, 3.65, 2.7, "Year 3: Market Dominance", AMBER)
    tb = s11.shapes.add_textbox(Inches(9.05), Inches(2.45), Inches(3.15), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "• Active Accounts: 450 Enterprises\n• Annual Payment Volume: $1.6B\n• Annual Gross Revenue: $19,200,000\n• Retainer Mix: 40% | Bps Mix: 60%\n• Gross Margin: 89%"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s11, 0.8, 4.8, 11.7, 1.9, "Institutional Unit Economics", TEXT_LIGHT)
    tb_u = s11.shapes.add_textbox(Inches(1.05), Inches(5.35), Inches(11.2), Inches(1.2))
    tf_u = tb_u.text_frame
    tf_u.word_wrap = True
    p = tf_u.paragraphs[0]
    p.text = "Customer Acquisition Cost (CAC): $4,200  |  Lifetime Value (LTV): $58,000  |  LTV / CAC Ratio: 13.8x\nPayback Period: 2.1 Months  |  Net Revenue Retention (NRR): 128% (driven by organic customer transfer volume growth)"
    p.font.name = "Segoe UI"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = EMERALD

    # ==========================================
    # SLIDE 12: Roadmap & Investment Ask
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12)
    add_header(s12, 12, "Roadmap & Investment Ask: Fueling Global Expansion")

    add_card(s12, 0.8, 1.8, 5.65, 4.8, "Execution Roadmap (Next 12 Months)", CYAN)
    tb_r = s12.shapes.add_textbox(Inches(1.05), Inches(2.4), Inches(5.15), Inches(4.0))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = "• Q1: Production Deployment & Partner Onboarding\nRoll out enterprise production clusters; onboard initial cohort of 15 commercial importers.\n\n• Q2: ERP & NetSuite Native Connector\nRelease native two-way sync for ERP payables and automated virtual IBAN generation.\n\n• Q3: APAC & LATAM Corridor Expansion\nIntegrate direct clearing gateways for Brazil (Pix), India (UPI/NEFT), and Singapore (PayNow).\n\n• Q4: Predictive AI Liquidity & Netting\nLaunch multi-subsidiary automated netting to eliminate redundant opposing currency flows."
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    add_card(s12, 6.85, 1.8, 5.65, 4.8, "The Investment Ask: $2,500,000 Seed / Series A", EMERALD)
    tb_a = s12.shapes.add_textbox(Inches(7.1), Inches(2.4), Inches(5.15), Inches(4.0))
    tf_a = tb_a.text_frame
    tf_a.word_wrap = True
    p = tf_a.paragraphs[0]
    p.text = "Use of Funds ($2.5M):\n\n• 45% ($1.125M) Engineering & Infrastructure:\nExpanding connectivity to 40+ international clearing rails, WebSocket rate pipelines, and security audits.\n\n• 35% ($875k) Enterprise Sales & Treasury GTM:\nBuilding direct outbound sales team targeting mid-market CFOs and supply chain leaders.\n\n• 20% ($500k) Regulatory Compliance & Legal:\nCorridor licensing, cross-border compliance frameworks, and SOC2 / ISO 27001 certifications.\n\nContact: treasury@globaltrade.io  |  www.crossborderfx.io"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_LIGHT

    output_dir = "c:\\Desktop\\Ricoz-projects\\Cross-border FX"
    output_file = os.path.join(output_dir, "Cross_Border_FX_12_Pager_Business_Deck.pptx")
    prs.save(output_file)
    print(f"[Success] Generated 12-page PowerPoint presentation at: {output_file}")

if __name__ == "__main__":
    create_deck()
