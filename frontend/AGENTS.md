<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI/UX Engineering Standards

- **Multi-Step Wizard Pattern:** All forms must use a multi-step Wizard pattern.
- **Form Field Separation:** 
    - If a form (or logical group) has 4 or more fields, it must be separated into multiple pages (one atomic question or small group per screen). 
    - If it has fewer than 4 fields, they should be on the same screen.
- **Navigation:** All wizards must feature 'Next' and 'Prev' navigation, concluding with a 'Submit' action.
