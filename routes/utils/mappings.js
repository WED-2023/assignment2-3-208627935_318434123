async function getRecipePreview(recipe_info) {
    const { id, title, readyInMinutes, image, spoonacularScore, vegan, vegetarian, glutenFree } = recipe_info;
    return {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: spoonacularScore,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree,
    }
}

async function getRecipeFullPreview(recipe_info, recipe_summary) {
    const { id, title, readyInMinutes, image, spoonacularScore, vegan, vegetarian, glutenFree, instructions, analyzedInstructions, extendedIngredients, servings } = recipe_info;

    return {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: spoonacularScore,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree, 
        summary: recipe_summary.summary,
        analyzedInstructions: analyzedInstructions,
        instructions: instructions,
        extendedIngredients: extendedIngredients,
        servings: servings,
    }
}

exports.getRecipePreview = getRecipePreview;
exports.getRecipeFullPreview = getRecipeFullPreview;