---
name: imagegen
description: "Use this skill when the user wants to generate design concept images, visual references, or mood boards for design exploration. Trigger for prompts like 'generate a design concept', 'imagine this UI', 'create visual references', 'sketch out what this could look like', 'generate some options for the cover art', or when a design task would benefit from rapid visual ideation before committing to vector work in Figma."
---

# imagegen

Generate design concept images using image generation models. The workflow: produce visual candidates quickly, review with the navigator, then use the best results as references for Figma vector work — fast-tracking ideation before the slower modeling step.

## Pre-flight: credential discovery

The skill needs a Gemini API key. Resolve it in this order (first match wins):

1. **Environment variable:** check if `GEMINI_API_KEY` is set in the current shell environment.
2. **First-use prompt:** if the environment variable is not set, tell the user:
   > "I need a `GEMINI_API_KEY` to generate images. You can get one at https://aistudio.google.com/apikey — paste it here, or add it to your `.envrc.local` and reload direnv."

   If the user provides the key inline, use it for the current session. Suggest they persist it:
   > "To avoid this prompt next time, add this to your `.envrc.local`:"
   > ```
   > export GEMINI_API_KEY="your-key-here"
   > ```
   > "If you use 1Password, you can reference it as:"
   > ```
   > export GEMINI_API_KEY=$(op read "op://path/to/your/key")
   > ```

Never store the key in committed files, skill files, or memory. The key lives in the user's environment only.

## Pre-flight: output directory

Before generating images, verify the output directory setup:

1. Create `.imagegen-output/` in the project root if it doesn't exist.
2. Check if `.imagegen-output/` appears in `.gitignore`. If it does not:
   - Warn the user: "`.imagegen-output/` is not in `.gitignore` — generated images could be accidentally committed."
   - Offer to append it: "Shall I add it? I'll include a comment explaining what it's for."
   - If approved, append to `.gitignore`:
     ```
     # imagegen skill output (generated design concept images)
     .imagegen-output/
     ```

## Model selection

Pick the model based on the task. Start cheap/fast and upgrade only if quality falls short.

| Model | Speed | Quality | Best for |
|-------|-------|---------|----------|
| `gemini-2.5-flash-image` | Fast | Good | **Default.** Quick ideation, first-pass exploration, mood boards |
| `gemini-3.1-flash-image` | Medium | Higher | Refined concepts, detailed scenes, when 2.5 output lacks detail |
| `gemini-3.1-flash-lite-image` | Fastest | Lower | High-volume batches, throwaway sketches, rapid A/B comparisons |
| `gemini-3-pro-image` | Slow | Best | Complex multi-element compositions, high-res output, final reference images |

**Decision flow:**
1. Start with `gemini-2.5-flash-image` — it handles most ideation work.
2. If the output lacks detail or misses compositional nuance, upgrade to `gemini-3.1-flash-image`.
3. If you need high-res (2K/4K) or complex multi-object scenes, use `gemini-3-pro-image`.
4. If you're generating 10+ throwaway variants to narrow a direction, use `gemini-3.1-flash-lite-image`.

The user can override at any time: "use the pro model for this one" or "switch to lite, I just want quick sketches."

## API reference

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}
```

**Request body:**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "your prompt here" }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE", "TEXT"]
  }
}
```

**Response structure:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "<base64-encoded-image-data>"
            }
          },
          {
            "text": "optional text description from the model"
          }
        ]
      }
    }
  ]
}
```

**Authentication:** query parameter `?key=` (or `x-goog-api-key` header).

**Constraints:**
- Default output: 1024x1024 px
- Free tier: ~500 images/day
- Cost: ~$0.039/image at 1024px
- All outputs carry a SynthID watermark

### Execution

Use whatever HTTP tool is available — `curl` in the shell, a built-in HTTP fetch tool, or similar. The agent decides the mechanism. Example with curl:

```bash
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "PROMPT_HERE"}]}],
    "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
  }'
```

### Extracting and saving the image

The response contains base64-encoded image data in `candidates[0].content.parts[].inlineData.data`. To save it:

```bash
# Extract base64 image data from response and decode to file
echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 -d > .imagegen-output/concept-001.png
```

Name output files descriptively: `concept-staircase-v1.png`, `cover-dark-angular-v2.png`, etc. Include a version number to track iterations.

### Prompt provenance

**Always** save the prompt alongside the image as a sidecar file with the same base name but ending in `.instruct.txt` (not `.prompt.txt` — avoids tab-completion collision with `.png`):

```
.imagegen-output/
  brockmann-v1.png
  brockmann-v1.instruct.txt
  brockmann-v2.png
  brockmann-v2.instruct.txt
```

Write the sidecar **before** making the API call — if generation fails, the prompt is still on record. The sidecar contains the raw prompt text, nothing else.

### Presenting results to the navigator

After saving the image:

- **Graphical system (macOS, Linux desktop):** auto-open the image for the navigator. On macOS, run `open <path>`. On Linux with a display server, run `xdg-open <path>`. This lets the navigator see the result immediately without hunting for the file.
- **Headless system (SSH, CI, managed agent):** do not attempt to open. Instead, print the absolute path and suggest how the navigator can retrieve it (e.g. "Image saved to `/abs/path/concept-v1.png` — view it locally or fetch via `scp`").
- **Always** also read the image via the agent's built-in file reader to display it inline in the conversation, so the navigator can review without leaving the terminal.

## Prompting best practices

### Composition and style

- **Be specific about medium and style.** "3D isometric render on black background" beats "a staircase." Name the visual style: isometric, flat vector, photorealistic, watercolor, pixel art, brutalist, Swiss poster.
- **Describe lighting explicitly.** "Lit from upper-left, deep shadows on right faces" gives directional control. Without this, results are unpredictably lit.
- **Specify the color palette.** "Pink accent (#FF5583) against dark grays (#2A2A2A through #555555) on pure black (#000000)" anchors the brand. Without color direction, the model guesses.
- **Name the composition.** "Ascending diagonal from bottom-left to upper-right, cropped by frame edge" is actionable. "A nice layout" is not.
- **Reference real design movements.** "Brockmann-style Swiss poster composition" or "Dieter Rams minimal industrial" gives the model a vocabulary to work from.

### Iteration patterns

- **Start broad, narrow fast.** First prompt: explore the concept loosely. Second prompt: take the best direction and add constraints (color, composition, lighting). Third prompt: refine details.
- **Describe what to change, not just what you want.** "Same composition but rotate the light source 90 degrees clockwise" iterates faster than re-describing the whole scene.
- **Generate 2-3 variants per round.** Run the same prompt multiple times — image generation is stochastic. Compare results before iterating the prompt.
- **Use negative constraints.** "No gradients, no rounded corners, no photorealistic textures" eliminates unwanted directions.

### For brand/identity work specifically

- **Include the shape vocabulary.** "The Asabina step shape — a hexagonal isometric step, 192x240px proportions" gives the model the geometric foundation.
- **Describe the metaphor.** "The staircase represents progress and building upward" helps the model make compositional choices that reinforce meaning.
- **Specify the output context.** "This will be used as a 1920x1080 brand graphic on a pitch deck cover" sets the aspect ratio and level of detail.

## Workflow: imagegen to Figma handoff

Generated images are **references**, not final assets. The handoff to Figma follows this pattern:

1. **Generate candidates.** Run 2-3 prompt variations, save results to `.imagegen-output/`.
2. **Review with the navigator.** Present the images (the agent can read PNG files to display them). Discuss what works and what doesn't.
3. **Select direction.** Pick the strongest candidate as the reference.
4. **Recreate in Figma as vectors.** Use the figma-conventions skill and the Figma Plugin API to build the design from components, variables, and vector shapes — not as a raster image import. The generated image guides composition, color, and mood; Figma provides the editable, scalable, token-bound result.
5. **Iterate in Figma.** Once the vector version exists, further refinement happens in Figma directly. Return to imagegen only for exploring fundamentally different directions.

**Do not import generated images into Figma as final assets.** They are ideation artifacts — low-fidelity, raster, watermarked. The value is in the speed of exploration, not the pixels themselves.
