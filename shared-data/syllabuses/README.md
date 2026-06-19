# Shared Syllabus Data

This folder is the source of truth for curriculum coverage used by IC Educate and
Studioprime frontends.

The goal is to store structured, reusable metadata rather than copied syllabus
PDFs. Each syllabus file should keep:

- official source URL and retrieved date
- subject and exam codes
- topic and subtopic taxonomy
- assessment/paper format metadata
- placeholders for locally authored note cards, quiz cards, worked examples, and
  scripted exam-paper templates

Recommended rollout:

1. Use `registry.json` to populate syllabus/subject selectors everywhere.
2. Deep-extract one subject at a time into subject files.
3. Generate reusable notes/quizzes from the extracted subtopic IDs.
4. Link generated worksheet PDFs/HTML back to the same subtopic IDs.

