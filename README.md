# Wedding Invitation — Love Letter Opening

A cinematic scroll-driven wedding invitation that opens like a sealed love letter.

## Quick start

```bash
cd wedding-invitation
python3 -m http.server 8080
```

Visit [http://localhost:8080](http://localhost:8080).

## Experience flow

1. **Closed envelope** — moss green paper, lace flap, gold wax seal
2. **Scroll to open** — seal loosens → flap rotates up → ivory paper slides out
3. **Paper becomes the site** — one continuous cream invitation scrolls downward

## Architecture

| Module | Class | Role |
|--------|-------|------|
| EnvelopeHero | `.envelope-hero` | Sticky 280vh scroll stage |
| EnvelopeFlap | `.envelope-flap-wrap` | 3D flap + lace |
| WaxSeal | `.wax-seal` | Gold botanical seal image |
| InvitationLetter | `.invitation-letter-preview` / `.invitation-letter` | Cream paper content |
| WeddingDetails | `.wedding-details` | All sections below save-the-date |

## Scroll phases (CSS vars set by JS)

| Progress | Phase |
|----------|-------|
| 0–15% | Envelope closed |
| 15–30% | Seal loosens (`--p-seal`) |
| 30–50% | Flap opens (`--p-flap`) |
| 50–65% | Paper revealed (`--p-reveal`) |
| 65–85% | Paper rises (`--p-rise`) |
| 85–100% | Paper dominant (`--p-dominant`) |

## Colors

- Envelope: `#68664A`
- Paper: `#F5F1E9`
- Text: `#2D2B29`
- Gold seal: `#B8893E`

## Customize

- Names, date, venue: `index.html`
- Wax seal image: `assets/wax-seal.png`
- Scroll speed: `.envelope-hero { height: 280vh }` in `styles.css`
