import { RED_FLAGS } from '../constants/cgmList';

export const analyzeIngredients = (rawText) => {
  const found = [];
  const lowerText = rawText.toLowerCase();

  // Check each category
  Object.keys(RED_FLAGS).forEach(category => {
    RED_FLAGS[category].forEach(ingredient => {
      if (lowerText.includes(ingredient)) {
        found.push({ name: ingredient, type: category });
      }
    });
  });

  return found;
};