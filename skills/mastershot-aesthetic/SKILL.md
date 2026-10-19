---
name: mastershot-aesthetic
description: "Design or refine Mastershot Studio-style film portfolio websites: cinematic, fast, editorial, collaboration-oriented pages with disciplined typography, poster-led layouts, and in-page trailer playback."
---

# Mastershot Aesthetic

Use this skill when designing, reviewing, or extending a personal film-editorial portfolio or small production-studio site in the Mastershot direction. The goal is not a generic portfolio: a prospective collaborator should understand the person's role, credibility, representative work, and how to contact them within roughly 30 seconds.

## Creative north star

- Aim for the confidence of a top film studio, post house, or Hollywood title page: direct, precise, visual-first, and calm under pressure.
- Make information fast to scan. Put the strongest proof (selected work, role, credits, and contact route) before secondary biography.
- Let posters, stills, and trailer frames carry the emotional weight. Copy should clarify the project, not compete with the image.
- Use black and white as the structural palette, with orange/yellow as a deliberate signal for hover, status, or calls to action. Avoid decorative gradients and noisy UI.

## Type and spacing

- Prefer Helvetica or a close Apple-like system sans stack. Keep letterforms clean and unconnected.
- Use generous tracking and margins so the wordmark, navigation, and contact details have visible breathing room.
- Keep a title together when it is a phrase (especially Chinese titles containing “电影”); use a smaller size or a controlled two-line composition instead of arbitrary word breaks.
- Make hierarchy obvious: short eyebrow/metadata, strong title, then concise supporting copy. Contact name, phone, email, and WeChat should share a legible, consistent scale.

## Layout and motion

- Use large, quiet opening typography and a short, intentional transition into the home page. A full-page upward slide is preferred over a soft fade when the brief asks for the Blur-like reveal; keep the opening hold around the explicitly requested duration.
- Keep the four primary posters in a true four-up grid: equal columns, equal visible frame ratio, consistent top and bottom alignment, and no accidental cropping of faces or heads. Use `object-fit: contain` or an intentional poster frame when source ratios differ.
- A giant MASTERSHOT wordmark may reveal poster imagery through only the hovered letter(s). Preserve the same font size and silhouette; reveal a local image crop with a subtle scale/opacity transition rather than exposing the whole word at once.
- Motion should support browsing: modest poster scale on hover, restrained easing, no constant background carousel, and no effect that delays access to information.
- Keep navigation and top-corner controls large enough to be unmistakable without becoming heavy. An X should be a clear X when circular iconography makes centering ambiguous.

## Work and trailer behavior

- Treat each project as a browsable editorial page: trailer first, then compact project facts and description, then the complete poster/still gallery. Keep related images scrollable in the same view instead of forcing a separate page.
- Preserve complete posters and faces. Never crop a poster simply to make cards equal; normalize the frame and letterbox/contain where needed.
- Prefer an in-page player for trailer links, especially Bilibili in China. Keep the player at the established reference size rather than forcing full-screen or navigating away.
- When converting a Bilibili URL to an embed, strip any source `t=` parameter and request playback from 0 seconds. Ask for the highest available quality (`quality/qn=112`, `high_quality=1`, `fourk=1`) but do not promise 1080p when the source, account, browser, or platform only exposes 720p/360p.
- Avoid a black-only loading state: retain the selected poster as the player surface until the iframe is ready. Opening a project should be deterministic and begin from the first frame.
- Provide a visible top-right X, stop/detach the player on close or home navigation, and return the user to the exact browsing context. If the provider exposes an ended event, use it to return to browsing; otherwise fail quietly.
- Keep playback controls usable (play/pause, seek, volume, quality when the provider exposes them) and center a transparent, slightly weighted play affordance.

## Contact and conversion

- Make collaboration the explicit call to action. Show the person's role, relevant experience, phone, email, WeChat, and a scannable QR code in one calm, high-contrast block.
- Keep the QR code aligned with the contact copy and no taller than the text block unless the layout clearly benefits from it. A clickable WeChat route may supplement the QR code but should not replace it.
- Explain sensitive/unfinished work plainly: some projects may be unavailable because of rights or release schedules, with updates promised when they can be shown.

## Content decisions

- State credits accurately and compactly. Use the user's confirmed phrasing, e.g. “曾与著名香港剪辑师胡大为、邱志伟合作，具备双语沟通及合拍片协作经验。”
- Distinguish film editing, editorial supervision, TVC, and localization/re-editing roles. For imported work such as 《异界》, describe the Russian-to-Chinese introduction and re-editing explicitly.
- Prefer locally accessible trailer sources (Bilibili before YouTube) when the audience is in mainland China. Keep links editable in a single content data file.

## Performance and maintenance

- Keep the site dependency-light and static where possible. Avoid adding a framework or large media bundle for a small portfolio.
- Test with a local HTTP server rather than `file://`, then run syntax checks on edited JavaScript. Check both desktop and narrow layouts for poster alignment, title wrapping, and contact readability.
- Treat provider embeds as external dependencies: preserve a poster fallback, make failures non-blocking, and document any platform limitation instead of hiding it behind a blank or black surface.
