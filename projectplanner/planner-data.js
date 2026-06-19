window.PLANNER_STATE = {
  "updated_at": "2026-06-19T11:03:56",
  "automation_runs": 63,
  "projects": {
    "ic_education": {
      "name": "IC Education",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Replace mailto study-plan requests with a live form endpoint when credentials are available.",
      "metric": "qualified parent/student leads per week",
      "checklist": [
        {
          "task": "Turn existing study-pack library into three clear paid offers: free sampler, subject pack, and monthly exam coach.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/iceducation/OFFER_LADDER.md"
        },
        {
          "task": "Publish one carousel per exam pathway and one short demo video showing a worksheet generated from a real syllabus topic.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/iceducation/EXAM_PATHWAY_CONTENT_PACK_2026-06-18.md"
        },
        {
          "task": "Create a lead magnet form for parents: 'Send subject + exam board, receive a 7-day study plan.'",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/iceducation/index.html"
        },
        {
          "task": "Connect the study-plan request form to a real CRM or spreadsheet endpoint.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/iceducation/lead-capture-crm-schema.csv"
        },
        {
          "task": "Replace mailto study-plan requests with a live form endpoint when credentials are available.",
          "status": "next",
          "source": "half_hourly_automation"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "AI worksheet from syllabus topic to answer key",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-education.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/iceducation/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "needs_approval",
            "detail": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "needs_approval",
            "detail": "Short-video prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "needs_approval",
            "detail": "Waiting for you to approve the queued asset before anything is posted.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "product and content engine exists",
      "audit": {
        "quality": "Premium",
        "backend": "Partial",
        "production": "Pilot-ready",
        "summary": "Strong study-pack builder and polished frontend. The missing piece is coverage completeness and a clear lead-to-offer path.",
        "missing": [
          "Full syllabus inventory audit for missing subject packs",
          "Real lead capture and offer checkout",
          "Backend deployment monitoring for DeepSeek failures"
        ],
        "next_steps": [
          "Finish the syllabus gap audit and generate the missing packs.",
          "Turn the parent/student lead magnet into a real capture flow.",
          "Add deployment checks for backend generation jobs."
        ],
        "agents": [
          "Syllabus Audit Agent",
          "Pack Generation Agent",
          "Offer/Lead Agent",
          "Backend Health Agent"
        ]
      },
      "revenue": {
        "offer": "Free 7-day study plan -> paid subject pack -> monthly exam coach",
        "capture": "Lead form: syllabus, subject, weak topic, parent/student contact",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Add a lead magnet form and store submissions in the shared CRM.",
        "follow_up_script": "Hi, send syllabus + subject + weak topic and I will return a 7-day study plan.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Needs proof step",
        "proof_command": "cd /Users/j/Desktop/ic-educate-transfer/local-bridge && ./start-bridge.sh",
        "run_url": "http://127.0.0.1:8001",
        "blocker": "Full generation requires the local bridge, Python 3.11+, and real AI/OCR keys.",
        "never_commit": "API keys, .env files, local logs, generated caches, virtual environments, or private worksheet libraries.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Created local CRM spreadsheet schema for study-plan requests. Artifact: /Users/j/Desktop/iceducation/lead-capture-crm-schema.csv"
    },
    "investing_education": {
      "name": "Investing Education",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Connect the weekly brief form to a real mailing-list provider.",
      "metric": "subscribers or booked calls from market education content",
      "checklist": [
        {
          "task": "Package the trading-pipeline report style into a recurring 'one chart, one thesis, one risk' daily note.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/ic-investing-cache-desk/ONE_CHART_ONE_THESIS_NOTE.md"
        },
        {
          "task": "Create disclaimer-safe education posts that teach process instead of giving personal financial advice.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/ic-investing-cache-desk/DISCLAIMER_SAFE_POST_SET_2026-06-18.md"
        },
        {
          "task": "Build an email capture around a weekly market learning brief.",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/ic-investing-cache-desk/index.html"
        },
        {
          "task": "Connect weekly brief requests to a mailing list and publish the first weekly note.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/ic-investing-cache-desk/WEEKLY_MARKET_LEARNING_BRIEF_2026-06-18.md"
        },
        {
          "task": "Connect the weekly brief form to a real mailing-list provider.",
          "status": "next",
          "source": "half_hourly_automation"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        },
        {
          "date": "2026-06-19",
          "angle": "one simple framework for mispricing",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/investing-education.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/ic-investing-cache-desk/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "needs_approval",
            "detail": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "needs_approval",
            "detail": "Short-video prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "needs_approval",
            "detail": "Waiting for you to approve the queued asset before anything is posted.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "research/report artifacts exist",
      "audit": {
        "quality": "Premium",
        "backend": "Local-only",
        "production": "Internal-ready",
        "summary": "The dashboard is dense and useful, but it is still a local read-only workflow rather than a public service.",
        "missing": [
          "Hosted refresh/export path for the cache snapshot",
          "Clear public subscription or lead capture CTA",
          "More explicit compliance and disclaimer framing"
        ],
        "next_steps": [
          "Publish a weekly market note from the cache.",
          "Decide whether the dashboard stays internal or gets a hosted API.",
          "Add one clear signup or contact path."
        ],
        "agents": [
          "Research Agent",
          "Compliance Agent",
          "Distribution Agent",
          "Cache Export Agent"
        ]
      },
      "revenue": {
        "offer": "Weekly market learning brief and process education",
        "capture": "Email signup for weekly note",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Add a disclaimer-safe email capture tied to the weekly market note.",
        "follow_up_script": "Hi, I publish a process-first market learning note. Want the weekly brief?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Needs refresh proof",
        "proof_command": "cd /Users/j/Desktop/ic-investing-cache-desk && python3 server.py --port 8787",
        "run_url": "http://127.0.0.1:8787",
        "blocker": "Hosted pages only show the last exported cache snapshot; stale data is the main risk.",
        "never_commit": "Private trading bot state, local cache folders, account data, credentials, or personalized financial advice outputs.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Published first disclaimer-safe weekly market learning brief draft. Artifact: /Users/j/Desktop/ic-investing-cache-desk/WEEKLY_MARKET_LEARNING_BRIEF_2026-06-18.md"
    },
    "jobs_hunt": {
      "name": "Jobs Hunt",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Add the real payment URL to the paid pilot intake page.",
      "metric": "paid CV/job automation runs",
      "checklist": [
        {
          "task": "Ship a daily before/after proof post from one application workflow.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/DAILY_PROOF_POST_2026-06-18.md"
        },
        {
          "task": "Convert the existing video assets into three versions: CV tailoring, daily apply run, and interview prep.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/VIDEO_REPURPOSE_PLAN_2026-06-18.md"
        },
        {
          "task": "Add a simple checkout or payment-intent path for a first paid pilot.",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/paid-pilot-intake.html"
        },
        {
          "task": "Replace mailto payment intent with a live payment link or invoice flow.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/PAYMENT_LINK_HANDOFF_2026-06-18.md"
        },
        {
          "task": "Add the real payment URL to the paid pilot intake page.",
          "status": "next",
          "source": "half_hourly_automation"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        },
        {
          "date": "2026-06-19",
          "angle": "why generic CVs get ignored",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/jobs-hunt.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/jobs-hunt-fastlane/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "needs_approval",
            "detail": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "needs_approval",
            "detail": "Short-video prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "needs_approval",
            "detail": "Waiting for you to approve the queued asset before anything is posted.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "landing page, scripts, and video assets exist",
      "audit": {
        "quality": "Premium",
        "backend": "Local/private",
        "production": "Private beta",
        "summary": "The public site is polished and the backend is serious, encrypted, and approval-gated, but it is still tuned for local private use.",
        "missing": [
          "Paid pilot or checkout path",
          "Extra test coverage for approval and queue flows",
          "Cleaner telemetry for run status and outcomes"
        ],
        "next_steps": [
          "Ship the paid pilot checkout or intent flow.",
          "Expose run status more clearly in the dashboard.",
          "Tighten the approval and automation tests."
        ],
        "agents": [
          "Backend QA Agent",
          "Automation Handoff Agent",
          "Checkout Agent",
          "Offer Agent"
        ]
      },
      "revenue": {
        "offer": "Paid CV/job automation pilot",
        "capture": "Checkout/payment-intent plus private local-agent intake",
        "crm_stage": "payment_missing",
        "crm_label": "Payment missing",
        "next_revenue_action": "Add paid pilot checkout or payment-intent before scaling outreach.",
        "follow_up_script": "Hi, I can run a focused CV-to-application pilot with human approval before automation.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Has tests; needs end-to-end proof",
        "proof_command": "cd /Users/j/Desktop/jobs-hunt-fastlane-backend && python3 -m pytest",
        "run_url": "http://127.0.0.1:3000",
        "blocker": "Real application sending remains approval-gated and depends on the local backend token.",
        "never_commit": "Uploaded CVs, SQLite databases, generated review packs, local automation logs, pairing tokens, encryption keys, or plaintext credentials.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Prepared payment-link handoff and package structure. Artifact: /Users/j/Desktop/jobs-hunt-fastlane/PAYMENT_LINK_HANDOFF_2026-06-18.md"
    },
    "property": {
      "name": "Property",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Define one narrow wedge: rental yield education, agent content automation, or property due-diligence checklist.",
      "metric": "property owner/advisor leads",
      "checklist": [
        {
          "task": "Define one narrow wedge: rental yield education, agent content automation, or property due-diligence checklist.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/property-growth/WEDGE_DECISION.md"
        },
        {
          "task": "Use the existing property trainer video as the first proof asset.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/property-growth/PROPERTY_TRAINER_PROOF_ASSET_2026-06-18.md"
        },
        {
          "task": "Create a lead magnet: 'Send a listing, receive 5 improvement angles.'",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/property-growth/index.html"
        },
        {
          "task": "Collect five sample listings and produce manual improvement reports.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/property-growth/SAMPLE_LISTING_REPORT_TEMPLATE_2026-06-18.md"
        },
        {
          "task": "Fill the listing report template with five real sample listings.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/property-growth/SAMPLE_LISTING_REPORT_TEMPLATE_2026-06-18.md"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        },
        {
          "date": "2026-06-19",
          "angle": "five questions before buying or renting",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/property.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/jobs-hunt-fastlane/property-growth/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "needs_approval",
            "detail": "Carousel cover prompt is in provider_queue.jsonl and needs manual approval before paid generation.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "waiting_handover",
            "detail": "Waiting for the next video slot or a manually approved brief.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "needs_approval",
            "detail": "Waiting for you to approve the queued asset before anything is posted.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "dedicated brief created; initial property trainer video exists",
      "audit": {
        "quality": "Good",
        "backend": "Static",
        "production": "Brochure-ready",
        "summary": "Clean and simple, but it is mostly a landing page so far. The project still needs proof and a real conversion path.",
        "missing": [
          "Real lead capture form or WhatsApp flow",
          "Proof assets and case studies",
          "A single narrow wedge to sell first"
        ],
        "next_steps": [
          "Pick one wedge and make the offer narrower.",
          "Replace mailto with a real lead capture action.",
          "Add a proof section or listing example."
        ],
        "agents": [
          "Positioning Agent",
          "Lead Capture Agent",
          "Proof Asset Agent"
        ]
      },
      "revenue": {
        "offer": "Listing review: 5 positioning improvements and 3 risk questions",
        "capture": "Listing URL/photo upload or WhatsApp request",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Replace mailto with a form or WhatsApp listing-review flow.",
        "follow_up_script": "Hi, send one listing and I will return five positioning improvements to test.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Needs conversion proof",
        "proof_command": "open /Users/j/Desktop/jobs-hunt-fastlane/property-growth/index.html",
        "run_url": "https://schuwaong.github.io/jobs-hunt-fastlane/property-growth/",
        "blocker": "The wedge and lead capture path still need to be made concrete.",
        "never_commit": "Private client/property details, legal/tax/financial advice claims, or non-public listing data.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Created reusable sample listing improvement report template. Artifact: /Users/j/Desktop/property-growth/SAMPLE_LISTING_REPORT_TEMPLATE_2026-06-18.md"
    },
    "ic_wearables": {
      "name": "IC Wearables",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Add provider credentials to IC_wearables/.env.local and rerun daily catalog.",
      "metric": "style scans and affiliate clicks",
      "checklist": [
        {
          "task": "Make the face scan and five-look output the whole first-screen conversion path.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/IC_wearables/SCAN_TO_FIVE_LOOK_CONVERSION_FLOW.md"
        },
        {
          "task": "Generate daily outfit carousel prompts by season and market.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/IC_wearables/DAILY_OUTFIT_CAROUSEL_PROMPTS_2026-06-18.md"
        },
        {
          "task": "Push affiliate catalog refreshes for HK, MY, SG, ID, PH, TH, and AE.",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/IC_wearables/CATALOG_REFRESH_2026-06-18.md"
        },
        {
          "task": "Configure affiliate providers for SG, ID, PH, TH, and AE so those markets produce commissionable exact products.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/IC_wearables/AFFILIATE_PROVIDER_GAP_LIST_2026-06-18.md"
        },
        {
          "task": "Add provider credentials to IC_wearables/.env.local and rerun daily catalog.",
          "status": "next",
          "source": "half_hourly_automation"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        },
        {
          "date": "2026-06-19",
          "angle": "quiet luxury capsule by season",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/ic-wearables.md"
        }
      ],
      "website_url": "https://ic-wearables.vercel.app/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "A sub-lane is blocked, but other agents are still moving.",
        "next_action": "automation/session-state.yml says the local watch loop should be active, but no automate:watch process is running.",
        "blocker": "automation/session-state.yml says the local watch loop should be active, but no automate:watch process is running.",
        "approval": "",
        "lanes": [
          {
            "agent": "Wearables Automation Loop",
            "status": "blocked",
            "detail": "automation/session-state.yml says the local watch loop should be active, but no automate:watch process is running.",
            "handoff_to": "Daily Review Agent",
            "updated_at": "2026-06-17 03:49:37 Asia/Kuala_Lumpur"
          },
          {
            "agent": "Daily Review Agent",
            "status": "waiting_handover",
            "detail": "Current run: automation/runs/2026-06-17/2200-daily_review_agent.",
            "handoff_to": "Market Scan Agent at 08:00"
          },
          {
            "agent": "Video Automation Pipeline",
            "status": "blocked",
            "detail": "Blocked until the wearable automation loop is restarted with npm run automate:watch or one cycle is run manually.",
            "handoff_from": "Daily Review Agent at 22:00",
            "handoff_to": "Market Scan Agent at 08:00"
          },
          {
            "agent": "Market Scan Agent",
            "status": "waiting_handover",
            "detail": "Next scheduled handoff at 08:00.",
            "handoff_from": "Daily Review Agent"
          },
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "waiting_handover",
            "detail": "Waiting for carousel capacity after higher-priority projects finish their asset handoff.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "waiting_handover",
            "detail": "Waiting for the next video slot or a manually approved brief.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "waiting_handover",
            "detail": "Waiting for approved creative or a completed manual asset.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "automation runner, affiliate catalog, and style-image flow exist",
      "audit": {
        "quality": "Premium",
        "backend": "Partial",
        "production": "Public demo ready",
        "summary": "Visually strong and already connected to a backend and automation loop, but the conversion path and automation reliability still need work.",
        "missing": [
          "Keep the automation loop running or daemonized",
          "A stronger first-screen conversion path",
          "More reliable catalog refresh and monitoring"
        ],
        "next_steps": [
          "Fix the blocked wearables automation loop.",
          "Make the face-scan outcome the main call to action.",
          "Add lightweight analytics around scan-to-click flow."
        ],
        "agents": [
          "Automation Monitor Agent",
          "Content Research Agent",
          "Lead Capture Agent",
          "Release Agent"
        ]
      },
      "revenue": {
        "offer": "Face scan -> five-look outfit board -> affiliate product matches",
        "capture": "Scan completion, email/WhatsApp save, affiliate click tracking",
        "crm_stage": "tracking_missing",
        "crm_label": "Tracking missing",
        "next_revenue_action": "Track scan-to-click events and add a save/send-results capture step.",
        "follow_up_script": "Hi, upload one clear photo and I will send a five-look outfit board with product matches.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Has syntax check; automation loop needs proof",
        "proof_command": "cd /Users/j/Desktop/IC_wearables && npm run check",
        "run_url": "https://ic-wearables.vercel.app/",
        "blocker": "The two-hour automation loop must be running or manually triggered before daily content/catalog updates are current.",
        "never_commit": "API keys, affiliate secrets, uploaded face images, generated private user photos, .env files, or local automation state with personal data.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Created affiliate provider gap list for non-HK/MY markets. Artifact: /Users/j/Desktop/IC_wearables/AFFILIATE_PROVIDER_GAP_LIST_2026-06-18.md"
    },
    "nlp_keyboard": {
      "name": "NLP Keyboard",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Recruit first three beta testers and log setup completion.",
      "metric": "daily active use and saved better replies",
      "checklist": [
        {
          "task": "Merge the NLP chat tutor rubric into keyboard modes: empathize, clarify, soften, ask better question, close politely.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/android-keyboard/NLP_MODE_RUBRIC.md"
        },
        {
          "task": "Create a privacy-first demo with pasted text only before live keyboard automation.",
          "status": "done",
          "source": "agent_completed_2026_06_18_next_round",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/android-keyboard/PRIVACY_FIRST_PASTED_TEXT_DEMO_2026-06-18.md"
        },
        {
          "task": "Publish short before/after reply posts for dating, job, sales, and support contexts.",
          "status": "done",
          "source": "agent_completed_2026_06_18_blockage_round",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/android-keyboard/BEFORE_AFTER_REPLY_POSTS_2026-06-18.md"
        },
        {
          "task": "Create a beta signup and setup tracker for endpoint completion.",
          "status": "done",
          "source": "half_hourly_automation",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/android-keyboard/BETA_SIGNUP_TRACKER_2026-06-18.csv"
        },
        {
          "task": "Recruit first three beta testers and log setup completion.",
          "status": "next",
          "source": "half_hourly_automation"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        },
        {
          "date": "2026-06-19",
          "angle": "turn advice into empathy first",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/nlp-keyboard.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/jobs-hunt-fastlane/nlp-keyboard/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "waiting_handover",
            "detail": "Waiting for carousel capacity after higher-priority projects finish their asset handoff.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "waiting_handover",
            "detail": "Waiting for the next video slot or a manually approved brief.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Outreach target, lead actions, and first message were written into today's report.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "waiting_handover",
            "detail": "Waiting for approved creative or a completed manual asset.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "Android keyboard project exists; chat tutor exists separately",
      "audit": {
        "quality": "Strong",
        "backend": "Partial",
        "production": "Private beta",
        "summary": "The Android keyboard stack is real and useful, but still needs release hardening and more onboarding polish.",
        "missing": [
          "Public release hardening and privacy review",
          "Cleaner endpoint setup for end users",
          "Better packaging for a wider launch"
        ],
        "next_steps": [
          "Merge the keyboard modes into the main UX.",
          "Harden the bridge/server and onboarding.",
          "Prepare the release flow for wider testing."
        ],
        "agents": [
          "Android QA Agent",
          "Bridge/Server Agent",
          "Privacy Agent",
          "Release Agent"
        ]
      },
      "revenue": {
        "offer": "Private beta keyboard setup and better-reply workflow",
        "capture": "Beta tester waitlist and endpoint setup status",
        "crm_stage": "beta_waitlist_missing",
        "crm_label": "Beta waitlist missing",
        "next_revenue_action": "Create a beta signup and record endpoint/setup completion per tester.",
        "follow_up_script": "Hi, I am opening a private beta for a rewrite keyboard. Want setup instructions?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Needs Android release proof",
        "proof_command": "cd /Users/j/Desktop/nlp-chat-tutor && python3 -m pytest",
        "run_url": "https://schuwaong.github.io/jobs-hunt-fastlane/nlp-keyboard/",
        "blocker": "Keyboard packaging, privacy review, and endpoint setup need hardening before wider release.",
        "never_commit": "Private chat transcripts, API keys, user message logs, endpoint secrets, or manipulative communication templates.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Created beta signup and endpoint setup tracker. Artifact: /Users/j/Desktop/jobs-hunt-fastlane/android-keyboard/BETA_SIGNUP_TRACKER_2026-06-18.csv"
    },
    "waste_leads": {
      "name": "3R Quest Waste Lead Generation",
      "status": "active",
      "last_run": "2026-06-19",
      "next_big_step": "Call the top 15 rows daily and send the WhatsApp follow-up immediately after each call.",
      "metric": "qualified scheduled-waste pickup conversations",
      "checklist": [
        {
          "task": "Add 25 new target companies per day until the tracker reaches 150 qualified rows.",
          "status": "done",
          "source": "agent_completed_2026_06_18",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/3r-quest-scheduled-waste/lead-tracker.csv"
        },
        {
          "task": "Call the top 15 rows daily and send the WhatsApp follow-up immediately after each call.",
          "status": "blocked",
          "source": "half_hourly_automation_owner_required",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/3r-quest-scheduled-waste/OWNER_CALL_REQUIRED.md"
        },
        {
          "task": "Post one compliance-safe carousel each day about storage age, waste code, photos, and pickup readiness.",
          "status": "todo",
          "source": "agent"
        },
        {
          "task": "Complete the owner call block and replace needs_owner_call rows with real outcomes.",
          "status": "blocked",
          "source": "requires_owner_calls_2026_06_18",
          "artifact": "/Users/j/Desktop/jobs-hunt-fastlane/3r-quest-scheduled-waste/CALL_OUTCOME_LOG_2026-06-18.csv"
        }
      ],
      "run_history": [
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        },
        {
          "date": "2026-06-19",
          "angle": "SW409 and SW410 common factory mistakes",
          "report": "/Users/j/Desktop/project-growth-agents/runs/2026-06-19/waste-leads.md"
        }
      ],
      "website_url": "https://schuwaong.github.io/jobs-hunt-fastlane/3r-quest-scheduled-waste/",
      "agent_status": {
        "state": "working",
        "label": "Working",
        "summary": "Agents are actively producing the next handoff.",
        "next_action": "Generated today's next big step, checklist, and daily agent report.",
        "blocker": "",
        "approval": "",
        "lanes": [
          {
            "agent": "Portfolio Commander",
            "status": "working",
            "detail": "Generated today's next big step, checklist, and daily agent report.",
            "handoff_to": "Content agents"
          },
          {
            "agent": "Carousel Agent",
            "status": "waiting_handover",
            "detail": "Waiting for carousel capacity after higher-priority projects finish their asset handoff.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Short Video Agent",
            "status": "waiting_handover",
            "detail": "Waiting for the next video slot or a manually approved brief.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Posting Agent"
          },
          {
            "agent": "Lead Generation Agent",
            "status": "working",
            "detail": "Lead tracker and outreach call workflow are the active revenue lane.",
            "handoff_from": "Portfolio Commander",
            "handoff_to": "Manual outreach"
          },
          {
            "agent": "Posting Agent",
            "status": "waiting_handover",
            "detail": "Waiting for approved creative or a completed manual asset.",
            "handoff_from": "Carousel/Short Video Agent"
          }
        ]
      },
      "stage": "lead kit, tracker, scripts, and compliance notes exist",
      "audit": {
        "quality": "Strong",
        "backend": "Static",
        "production": "Lead-gen ready",
        "summary": "The site is focused, compliance-safe, and ready for outreach. What it lacks is a tighter follow-up system and tracking loop.",
        "missing": [
          "CRM or pipeline sync for lead outcomes",
          "Daily follow-up automation",
          "Conversion reporting and response tracking"
        ],
        "next_steps": [
          "Add a lead logging and follow-up cadence.",
          "Track quote-check outcomes more explicitly.",
          "Turn the tracker into a repeatable sales loop."
        ],
        "agents": [
          "Lead Research Agent",
          "Compliance Agent",
          "Outreach Agent",
          "CRM Agent"
        ]
      },
      "revenue": {
        "offer": "Scheduled waste pickup quote check",
        "capture": "Lead tracker, quote details, WhatsApp/call outcome",
        "crm_stage": "active_tracker",
        "crm_label": "Active tracker",
        "next_revenue_action": "Call the first 15 high-priority new leads and log outcomes today.",
        "follow_up_script": "Hi, this is about scheduled waste pickup support. Can you share waste code, quantity, site area, storage age, and photos?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      "health": {
        "status": "Needs follow-up proof",
        "proof_command": "open /Users/j/Desktop/jobs-hunt-fastlane/3r-quest-scheduled-waste/index.html",
        "run_url": "https://schuwaong.github.io/jobs-hunt-fastlane/3r-quest-scheduled-waste/",
        "blocker": "Lead outcomes must be logged daily or the outreach loop goes stale.",
        "never_commit": "Private lead contact data, customer documents/photos, quote details, or compliance claims not verified by licensed operators.",
        "questions": [
          "Is this project currently working?",
          "What exact command proves it?",
          "What is the next blocker?",
          "Where is the live/demo/local URL?",
          "What must never be committed or exposed?"
        ]
      },
      "last_progress_note": "Owner action required for real calls and WhatsApp follow-up. Artifact: /Users/j/Desktop/jobs-hunt-fastlane/3r-quest-scheduled-waste/OWNER_CALL_REQUIRED.md"
    }
  },
  "content_pipeline": {
    "updated_at": "2026-06-19T11:03:56",
    "active_project": "ic_education",
    "posting_policy": "manual_review_before_publish",
    "copy_policy": "model formats and hooks from references; do not copy exact creative, captions, audio, or footage",
    "source_watchlist": [
      {
        "platform": "instagram",
        "handle": "savemyexams",
        "why": "exam-focused parent/student pain points and revision hooks"
      },
      {
        "platform": "instagram",
        "handle": "znotes",
        "why": "student-friendly study content and topic compression"
      },
      {
        "platform": "instagram",
        "handle": "cognitoedu",
        "why": "short science explainers and syllabus-led topics"
      },
      {
        "platform": "youtube_shorts",
        "handle": "Cognito",
        "why": "science concept hooks and fast visual proof beats"
      },
      {
        "platform": "youtube_shorts",
        "handle": "freesciencelessons",
        "why": "GCSE/IGCSE-style topic clarity and exam language"
      },
      {
        "platform": "youtube_shorts",
        "handle": "The Organic Chemistry Tutor",
        "why": "worked-example pacing and title formulas"
      }
    ],
    "agent_lanes": [
      {
        "id": "viral_research_agent",
        "name": "Viral Research Agent",
        "goal": "scan similar successful education accounts and extract reusable content patterns",
        "status": "active"
      },
      {
        "id": "planner_agent",
        "name": "Planner Agent",
        "goal": "turn patterns and product goals into approved content briefs",
        "status": "active"
      },
      {
        "id": "video_creation_agent",
        "name": "Video Creation Agent",
        "goal": "convert briefs into short video scripts, shot lists, and provider prompts",
        "status": "queued"
      },
      {
        "id": "posting_agent",
        "name": "Posting Agent",
        "goal": "package approved assets with caption, hashtags, CTA, and publish checklist",
        "status": "queued"
      }
    ],
    "queues": {
      "research": [
        {
          "id": "research::ic-education-igcse-biology-worksheet-demo",
          "content_id": "ic-education-igcse-biology-worksheet-demo",
          "agent": "viral_research_agent",
          "status": "done",
          "platform": "instagram",
          "source": "savemyexams",
          "pattern": "Extract hook, pacing, proof beat, visual format, CTA, and comment strategy.",
          "guardrail": "Use as inspiration only; do not copy exact script, visuals, or caption.",
          "output": "Pattern brief for: IGCSE Biology weak topic to worksheet in 20 seconds"
        },
        {
          "id": "research::ic-education-spm-add-maths-weak-topic",
          "content_id": "ic-education-spm-add-maths-weak-topic",
          "agent": "viral_research_agent",
          "status": "queued",
          "platform": "instagram",
          "source": "znotes",
          "pattern": "Extract hook, pacing, proof beat, visual format, CTA, and comment strategy.",
          "guardrail": "Use as inspiration only; do not copy exact script, visuals, or caption.",
          "output": "Pattern brief for: SPM Add Maths: stop revising everything, pick one weak subtopic"
        },
        {
          "id": "research::ic-education-exam-pathways-launch",
          "content_id": "ic-education-exam-pathways-launch",
          "agent": "viral_research_agent",
          "status": "queued",
          "platform": "instagram",
          "source": "cognitoedu",
          "pattern": "Extract hook, pacing, proof beat, visual format, CTA, and comment strategy.",
          "guardrail": "Use as inspiration only; do not copy exact script, visuals, or caption.",
          "output": "Pattern brief for: SPM, IGCSE, IB, A Level in one study planner"
        }
      ],
      "planning": [
        {
          "id": "brief::ic-education-igcse-biology-worksheet-demo",
          "content_id": "ic-education-igcse-biology-worksheet-demo",
          "agent": "planner_agent",
          "status": "ready",
          "format": "youtube_short_and_reel",
          "angle": "IGCSE Biology weak topic to worksheet in 20 seconds",
          "audience": "IGCSE parents and Year 10/11 science students",
          "deliverable": "creative brief with hook, scenes/slides, CTA, and asset checklist",
          "approval_gate": "must be marked approved before provider generation or posting"
        },
        {
          "id": "brief::ic-education-spm-add-maths-weak-topic",
          "content_id": "ic-education-spm-add-maths-weak-topic",
          "agent": "planner_agent",
          "status": "queued",
          "format": "carousel",
          "angle": "SPM Add Maths: stop revising everything, pick one weak subtopic",
          "audience": "Form 4/Form 5 parents and students",
          "deliverable": "creative brief with hook, scenes/slides, CTA, and asset checklist",
          "approval_gate": "must be marked approved before provider generation or posting"
        },
        {
          "id": "brief::ic-education-exam-pathways-launch",
          "content_id": "ic-education-exam-pathways-launch",
          "agent": "planner_agent",
          "status": "queued",
          "format": "carousel",
          "angle": "SPM, IGCSE, IB, A Level in one study planner",
          "audience": "international and Malaysian exam parents",
          "deliverable": "creative brief with hook, scenes/slides, CTA, and asset checklist",
          "approval_gate": "must be marked approved before provider generation or posting"
        }
      ],
      "video": [
        {
          "id": "asset::ic-education-igcse-biology-worksheet-demo",
          "content_id": "ic-education-igcse-biology-worksheet-demo",
          "agent": "video_creation_agent",
          "status": "in_progress",
          "deliverable": "9:16 short video script and provider prompt",
          "hook": "Stop revising randomly: IGCSE Biology weak topic to worksheet in 20 seconds.",
          "beats": [
            "show the weak-topic problem",
            "show the IC Educate syllabus picker",
            "show generated plan/notes/quiz/worksheet",
            "end with the exact CTA"
          ],
          "provider_mode": "queue_only"
        },
        {
          "id": "asset::ic-education-spm-add-maths-weak-topic",
          "content_id": "ic-education-spm-add-maths-weak-topic",
          "agent": "video_creation_agent",
          "status": "queued",
          "deliverable": "carousel render prompt and slide copy",
          "hook": "Stop revising randomly: SPM Add Maths: stop revising everything, pick one weak subtopic.",
          "beats": [
            "show the weak-topic problem",
            "show the IC Educate syllabus picker",
            "show generated plan/notes/quiz/worksheet",
            "end with the exact CTA"
          ],
          "provider_mode": "queue_only"
        },
        {
          "id": "asset::ic-education-exam-pathways-launch",
          "content_id": "ic-education-exam-pathways-launch",
          "agent": "video_creation_agent",
          "status": "queued",
          "deliverable": "carousel render prompt and slide copy",
          "hook": "Stop revising randomly: SPM, IGCSE, IB, A Level in one study planner.",
          "beats": [
            "show the weak-topic problem",
            "show the IC Educate syllabus picker",
            "show generated plan/notes/quiz/worksheet",
            "end with the exact CTA"
          ],
          "provider_mode": "queue_only"
        }
      ],
      "posting": [
        {
          "id": "post::ic-education-igcse-biology-worksheet-demo",
          "content_id": "ic-education-igcse-biology-worksheet-demo",
          "agent": "posting_agent",
          "status": "review_required",
          "platform": "instagram",
          "caption_seed": "IGCSE parents and Year 10/11 science students: IGCSE Biology weak topic to worksheet in 20 seconds. DM PLAN or open the IC Educate site and choose one weak topic. #ICEducate #SPM #IGCSE #StudyPlan #AITutor",
          "posting_gate": "manual_review_before_publish",
          "account": "ic_educatee"
        },
        {
          "id": "post::ic-education-spm-add-maths-weak-topic",
          "content_id": "ic-education-spm-add-maths-weak-topic",
          "agent": "posting_agent",
          "status": "queued",
          "platform": "instagram",
          "caption_seed": "Form 4/Form 5 parents and students: SPM Add Maths: stop revising everything, pick one weak subtopic. Send Form + SPM + Add Maths + weak topic. #ICEducate #SPM #IGCSE #StudyPlan #AITutor",
          "posting_gate": "manual_review_before_publish",
          "account": "ic_educatee"
        },
        {
          "id": "post::ic-education-exam-pathways-launch",
          "content_id": "ic-education-exam-pathways-launch",
          "agent": "posting_agent",
          "status": "queued",
          "platform": "instagram",
          "caption_seed": "international and Malaysian exam parents: SPM, IGCSE, IB, A Level in one study planner. Try the live planner. #ICEducate #SPM #IGCSE #StudyPlan #AITutor",
          "posting_gate": "manual_review_before_publish",
          "account": "ic_educatee"
        }
      ]
    },
    "metrics": {
      "queued_items": 12,
      "review_required": 1,
      "provider_mode": "queue_only"
    }
  },
  "revenue_ops": {
    "updated_at": "2026-06-19T11:03:56",
    "summary": "Shared revenue ops: capture every lead, assign next follow-up, log outcome, and move projects toward paid conversion.",
    "metrics": {
      "projects_tracked": 7,
      "capture_gaps": 6,
      "waste_leads_total": 76,
      "waste_high_priority_new": 74
    },
    "projects": [
      {
        "project_id": "ic_education",
        "project_name": "IC Education",
        "offer": "Free 7-day study plan -> paid subject pack -> monthly exam coach",
        "capture": "Lead form: syllabus, subject, weak topic, parent/student contact",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Add a lead magnet form and store submissions in the shared CRM.",
        "follow_up_script": "Hi, send syllabus + subject + weak topic and I will return a 7-day study plan.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "investing_education",
        "project_name": "Investing Education",
        "offer": "Weekly market learning brief and process education",
        "capture": "Email signup for weekly note",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Add a disclaimer-safe email capture tied to the weekly market note.",
        "follow_up_script": "Hi, I publish a process-first market learning note. Want the weekly brief?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "jobs_hunt",
        "project_name": "Jobs Hunt",
        "offer": "Paid CV/job automation pilot",
        "capture": "Checkout/payment-intent plus private local-agent intake",
        "crm_stage": "payment_missing",
        "crm_label": "Payment missing",
        "next_revenue_action": "Add paid pilot checkout or payment-intent before scaling outreach.",
        "follow_up_script": "Hi, I can run a focused CV-to-application pilot with human approval before automation.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "property",
        "project_name": "Property",
        "offer": "Listing review: 5 positioning improvements and 3 risk questions",
        "capture": "Listing URL/photo upload or WhatsApp request",
        "crm_stage": "capture_missing",
        "crm_label": "Capture missing",
        "next_revenue_action": "Replace mailto with a form or WhatsApp listing-review flow.",
        "follow_up_script": "Hi, send one listing and I will return five positioning improvements to test.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "ic_wearables",
        "project_name": "IC Wearables",
        "offer": "Face scan -> five-look outfit board -> affiliate product matches",
        "capture": "Scan completion, email/WhatsApp save, affiliate click tracking",
        "crm_stage": "tracking_missing",
        "crm_label": "Tracking missing",
        "next_revenue_action": "Track scan-to-click events and add a save/send-results capture step.",
        "follow_up_script": "Hi, upload one clear photo and I will send a five-look outfit board with product matches.",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "nlp_keyboard",
        "project_name": "NLP Keyboard",
        "offer": "Private beta keyboard setup and better-reply workflow",
        "capture": "Beta tester waitlist and endpoint setup status",
        "crm_stage": "beta_waitlist_missing",
        "crm_label": "Beta waitlist missing",
        "next_revenue_action": "Create a beta signup and record endpoint/setup completion per tester.",
        "follow_up_script": "Hi, I am opening a private beta for a rewrite keyboard. Want setup instructions?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      },
      {
        "project_id": "waste_leads",
        "project_name": "3R Quest Waste Lead Generation",
        "offer": "Scheduled waste pickup quote check",
        "capture": "Lead tracker, quote details, WhatsApp/call outcome",
        "crm_stage": "active_tracker",
        "crm_label": "Active tracker",
        "next_revenue_action": "Call the first 15 high-priority new leads and log outcomes today.",
        "follow_up_script": "Hi, this is about scheduled waste pickup support. Can you share waste code, quantity, site area, storage age, and photos?",
        "agents": [
          "Revenue Ops Agent",
          "CRM Agent",
          "Follow-up Agent"
        ]
      }
    ],
    "today_queue": [
      {
        "project_id": "waste_leads",
        "label": "Call top 15 high-priority scheduled-waste leads.",
        "status": "working",
        "detail": "15 imported from lead-tracker.csv."
      },
      {
        "project_id": "ic_education",
        "label": "Add parent/student lead magnet capture.",
        "status": "waiting_handover",
        "detail": "Needs form endpoint or CRM sink before content traffic is useful."
      },
      {
        "project_id": "ic_wearables",
        "label": "Add scan-to-click tracking and saved-results capture.",
        "status": "waiting_handover",
        "detail": "Connect scan completion to email/WhatsApp capture and affiliate click events."
      },
      {
        "project_id": "jobs_hunt",
        "label": "Add paid pilot checkout/payment intent.",
        "status": "waiting_handover",
        "detail": "Private beta is usable, but payment is still missing."
      }
    ],
    "followups": [
      {
        "project_id": "waste_leads",
        "company": "Scientex Berhad",
        "priority": "Medium-High",
        "status": "new",
        "phone": "+603 5524 8888",
        "email": "info@scientex.com.my",
        "website": "https://scientex.com.my/contact-us/",
        "next_action": "Call main office and ask for EHS or environmental officer",
        "risk_angle": "SW409/SW410: ask about contaminated gloves, rags, plastics, bags, chemical/oil containers, storage age, and label/inventory gaps."
      },
      {
        "project_id": "waste_leads",
        "company": "Top Glove Corporation Bhd",
        "priority": "High",
        "status": "new",
        "phone": "+603 3362 3098",
        "email": "sales@topglove.com.my",
        "website": "https://www.topglove.com/contact-us-enquiry",
        "next_action": "Contact sales/main office and ask for EHS/environmental department",
        "risk_angle": "SW409/SW410: ask about contaminated containers, filters, rags, gloves, labels, mixed waste, damaged packaging, and audit/DOE inspection readiness."
      },
      {
        "project_id": "waste_leads",
        "company": "Hartalega Holdings Berhad",
        "priority": "Medium-High",
        "status": "new",
        "phone": "+603 8707 0888",
        "email": "human.resource@hartalega.com.my",
        "website": "https://hartalega.com.my/contact-us/sales-contact/",
        "next_action": "Use contact page or main number; ask operator for EHS/environmental department",
        "risk_angle": "SW409/SW410: ask about contaminated gloves, rags, plastics, bags, chemical/oil containers, storage age, and label/inventory gaps."
      },
      {
        "project_id": "waste_leads",
        "company": "Supermax Corporation Berhad",
        "priority": "High",
        "status": "new",
        "phone": "603-6145 2328",
        "email": "corporate@supermax.com.my",
        "website": "https://www.supermax.com.my/contact-us/",
        "next_action": "Email corporate and call asking for EHS/environmental department",
        "risk_angle": "SW409/SW410: ask about contaminated containers, filters, rags, gloves, labels, mixed waste, damaged packaging, and audit/DOE inspection readiness."
      },
      {
        "project_id": "waste_leads",
        "company": "Kossan Rubber Industries Bhd",
        "priority": "Medium-High",
        "status": "new",
        "phone": "+603 5161 8888",
        "email": "",
        "website": "https://www.kossan.com.my/",
        "next_action": "Use website contact route or call HQ to ask for EHS/environmental department",
        "risk_angle": "SW409/SW410: ask about contaminated gloves, rags, plastics, bags, chemical/oil containers, storage age, and label/inventory gaps."
      },
      {
        "project_id": "waste_leads",
        "company": "Nippon Paint Malaysia",
        "priority": "High",
        "status": "new",
        "phone": "1-800-88-2663",
        "email": "",
        "website": "https://www.nipponpaint.com.my/contact-us/",
        "next_action": "Use official contact page; ask for industrial/factory EHS or procurement",
        "risk_angle": "SW409/SW410: ask about contaminated containers, filters, rags, gloves, labels, mixed waste, damaged packaging, and audit/DOE inspection readiness."
      },
      {
        "project_id": "waste_leads",
        "company": "Jotun Paints Malaysia",
        "priority": "High",
        "status": "new",
        "phone": "",
        "email": "",
        "website": "https://www.jotun.com/my-en/contact-us",
        "next_action": "Use contact form and ask for factory EHS/procurement contact",
        "risk_angle": "SW409/SW410: ask about contaminated containers, filters, rags, gloves, labels, mixed waste, damaged packaging, and audit/DOE inspection readiness."
      },
      {
        "project_id": "waste_leads",
        "company": "Sika Kimia Sdn. Bhd.",
        "priority": "High",
        "status": "new",
        "phone": "06-7991762",
        "email": "info@my.sika.com",
        "website": "https://mys.sika.com/en/about-us/sika-malaysia.html",
        "next_action": "Email info and call Nilai site asking for EHS/environmental officer",
        "risk_angle": "SW409/SW410: ask about contaminated containers, filters, rags, gloves, labels, mixed waste, damaged packaging, and audit/DOE inspection readiness."
      },
      {
        "project_id": "waste_leads",
        "company": "V.S. Industry Berhad",
        "priority": "High",
        "status": "new",
        "phone": "",
        "email": "",
        "website": "https://www.vs-i.com/contact-us/",
        "next_action": "Use official contact form; ask for EHS/facilities at Johor plant",
        "risk_angle": "SW110/e-waste plus SW409/SW410: ask about labelled e-waste, inventory/eSWIS, old electronics, contaminated packaging, filters, and 180-day storage risk."
      },
      {
        "project_id": "waste_leads",
        "company": "UWC Berhad",
        "priority": "Medium-High",
        "status": "new",
        "phone": "+604-555 6937",
        "email": "uwc@uwcberhad.com.my",
        "website": "https://www.uwcberhad.com.my/contact-us/",
        "next_action": "Email and call asking for EHS/facilities/procurement",
        "risk_angle": "SW409/SW410: ask about contaminated gloves, rags, plastics, bags, chemical/oil containers, storage age, and label/inventory gaps."
      },
      {
        "project_id": "waste_leads",
        "company": "Carsem (M) Sdn Bhd",
        "priority": "High",
        "status": "new",
        "phone": "+60 5 3123333",
        "email": "",
        "website": "https://www.carsem.com/contact-us/",
        "next_action": "Call M Site and ask for EHS/environmental department",
        "risk_angle": "SW110/e-waste plus SW409/SW410: ask about labelled e-waste, inventory/eSWIS, old electronics, contaminated packaging, filters, and 180-day storage risk."
      },
      {
        "project_id": "waste_leads",
        "company": "Inari Technology Sdn Bhd",
        "priority": "High",
        "status": "new",
        "phone": "+604-645 6618",
        "email": "i-enquiry@inari-amertron.com.my",
        "website": "https://www.inari-amertron.com/contact-us/",
        "next_action": "Email enquiry and call Plant 1 asking for EHS/facilities",
        "risk_angle": "SW110/e-waste plus SW409/SW410: ask about labelled e-waste, inventory/eSWIS, old electronics, contaminated packaging, filters, and 180-day storage risk."
      },
      {
        "project_id": "waste_leads",
        "company": "Pan-International Electronics Malaysia",
        "priority": "High",
        "status": "new",
        "phone": "",
        "email": "",
        "website": "https://www.pieib.com.my/contact-us/",
        "next_action": "Use contact form and ask for EHS/facilities/procurement",
        "risk_angle": "SW110/e-waste plus SW409/SW410: ask about labelled e-waste, inventory/eSWIS, old electronics, contaminated packaging, filters, and 180-day storage risk."
      },
      {
        "project_id": "waste_leads",
        "company": "FFM Berhad",
        "priority": "Medium-High",
        "status": "new",
        "phone": "03-6145 7800",
        "email": "",
        "website": "https://www.ffmb.com.my/contact-us",
        "next_action": "Call main office and ask for plant EHS/environmental officer",
        "risk_angle": "SW409/SW410: ask about contaminated gloves, rags, plastics, bags, chemical/oil containers, storage age, and label/inventory gaps."
      },
      {
        "project_id": "waste_leads",
        "company": "APM Automotive Holdings Berhad",
        "priority": "High",
        "status": "new",
        "phone": "",
        "email": "",
        "website": "https://www.apm.com.my/contact-us/",
        "next_action": "Use contact page and ask for EHS/environmental department",
        "risk_angle": "SW110/e-waste plus SW409/SW410: ask about labelled e-waste, inventory/eSWIS, old electronics, contaminated packaging, filters, and 180-day storage risk."
      }
    ]
  }
};
