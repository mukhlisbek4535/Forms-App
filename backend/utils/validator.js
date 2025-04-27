export const validateQuestionTypes = (questions) => {
  const allowedQuestionTypes = [
    "single-line",
    "multi-line",
    "number",
    "checkbox",
    "dropdown",
  ];

  for (const question of questions) {
    const { questionText, questionType, options } = question;

    if (!allowedQuestionTypes.includes(questionType))
      return {
        error: `Invalid question type: "${questionType}" for question "${questionText}"`,
      };

    if (questionType === "checkbox" || questionType === "dropdown") {
      if (!options || !Array.isArray(options) || options.length === 0) {
        return {
          error: `Options are required for question type: ${questionType}`,
        };
      }

      const allStrings = options.every((option) => typeof option === "string");

      if (!allStrings)
        return {
          error: `All options must be strings for question type: ${questionType}`,
        };
    }
  }
  return null;
};
