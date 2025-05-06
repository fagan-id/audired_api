// Utility Buat Ngebersihin Json Response dari Gemini AI
function cleanJsonResponse(rawText) {
  let clean = rawText
    .replace(/```json|```/gi, "") // Remove code block markers
    .replace(/[\u2018\u2019]/g, "'") // Curly single quotes → straight
    .replace(/[\u201C\u201D]/g, '"') // Curly double quotes → straight
    .replace(/,\s*}/g, "}") // Trailing commas before closing }
    .replace(/,\s*]/g, "]") // Trailing commas before closing ]
    .replace(/\\n/g, "")
    .trim();

  const lines = clean.split("\n").map((line) => line.trim());

  for (let i = 0; i < lines.length - 1; i++) {
    if (
      lines[i].match(/^"\w+.*":/) && // current line is a key
      lines[i + 1].match(/^"\w+.*":/) && // next line is also a key
      !lines[i].endsWith(",") // current line missing comma
    ) {
      lines[i] += ",";
    }
  }

  return lines.join("\n");
}

function cleanExtractedText(rawText){
  return cleanedText = rawText
  .replace(/\n/g, ' ')              // Flatten new lines
  .replace(/[^a-zA-Z0-9\s.,:/-]/g, '') // Strip special OCR garbage
  .trim();
}

module.exports = { cleanJsonResponse, cleanExtractedText };
