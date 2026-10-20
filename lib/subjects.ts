// Lightweight heuristic scope filter for the study helpbox. It is NOT a security boundary.
const NON_STUDY =
  /\b(weather|dating|relationship advice|politics debate|celebrity gossip|recipe|shopping|hack|malware|weapon|adult content)\b/i;

const STUDY_WORDS =
  /\b(math|maths|mathematics|science|physics|chemistry|biology|english|social studies|history|geography|civics|economics|computer science|coding|hindi|marathi|jee|neet|cet|cuet|upsc|competitive exams?|school|homework|algebra|geometry|trigonometry|calculus|aptitude|reasoning|general knowledge|gk|class|grade|chapter|equation|solve|explain|define|formula|theorem|exam|question|answer|study|learn|photosynthesis|gravity|electricity|fraction|percentage|grammar|essay|cell|atom|molecule|force|motion|probability|derivative|integral)\b/i;

const MATH_EXPRESSION = /\d+\s*[-+*/^=×÷]\s*\d+/;

/**
 * @param message  the latest student message
 * @param hasContext true when this is a follow-up inside an existing conversation,
 *                   so short replies like "why?" or "give an example" are allowed.
 */
export function isStudyTopic(message: string, hasContext = false): boolean {
  const text = message.trim();
  if (!text || text.length > 3000 || NON_STUDY.test(text)) return false;
  if (STUDY_WORDS.test(text) || MATH_EXPRESSION.test(text)) return true;
  return hasContext && text.length <= 300;
}
