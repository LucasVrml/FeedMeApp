import { Recipe } from "@/database.types";

export function formatIngredients(apiResponse: Recipe[]) {
  return apiResponse.map((recipe) => {
    if (recipe.hasOwnProperty("recipe_ingredient")) {
      const formattedIngredients = recipe.recipe_ingredient.map(
        (ingredient) => ({
          id: ingredient.ingredient.id,
          name: ingredient.ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })
      );
      return {
        id: recipe.id,
        name: recipe.name,
        steps: recipe.steps,
        counter: recipe.counter,
        image_url: recipe.image_url,
        image_path: recipe.image_path,
        category: recipe.category,
        ingredients: formattedIngredients,
        user_id: recipe.user_id,
      };
    } else {
      return {
        id: recipe.id,
        name: recipe.name,
        steps: recipe.steps,
        counter: recipe.counter,
        image_url: recipe.image_url,
        image_path: recipe.image_path,
        category: recipe.category,
        ingredients: [],
        user_id: recipe.user_id,
      };
    }
  });
}
