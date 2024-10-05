async function getRecipePreview(recipeInfo, recipeSummary) {
    const { id, title, readyInMinutes, image, spoonacularScore, vegan, vegetarian, glutenFree } = recipeInfo;
    return {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: spoonacularScore,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree,
        summary:recipeSummary.summary
    }
}

async function getRecipeFullPreview(recipeInfo, recipeSummary) {
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, analyzedInstructions, extendedIngredients, servings } = recipeInfo;
    console.log("instrucstion:", instructions)
    console.log("analyzedInstructions", analyzedInstructions)
    return {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: aggregateLikes,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree, 
        summary: recipeSummary,
        analyzedInstructions: analyzedInstructions,
        instructions: instructions,
        extendedIngredients: extendedIngredients,
        servings: servings,
    }
}

async function getRecipeFullPreviewDB(recipeFromDB, ingredientsFromDB, likesFromDB) {
    const { recipe_id, title, time_in_minutes, image_url, vegan, vegetarian, gluten_free, instructions, servings } = recipeFromDB;
    const analyzedInstructions = mapInstructions(instructions);
    return {
        id: recipe_id,
        image: image_url,
        title: title,
        readyInMinutes: time_in_minutes,
        aggregateLikes: likesFromDB,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: gluten_free, 
        instructions: instructions,
        analyzedInstructions: analyzedInstructions,
        extendedIngredients: ingredientsFromDB,
        servings: servings,
    }
}

async function getRecipePreviewDB(recipeFromDB, likesFromDB) {
    const { recipe_id, title, time_in_minutes, image_url, vegan, vegetarian, gluten_free} = recipeFromDB;
    return {
        id: recipe_id,
        image: image_url,
        title: title,
        readyInMinutes: time_in_minutes,
        aggregateLikes: likesFromDB,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: gluten_free,
      };
}

async function mapInstructions(instructions){}

exports.getRecipePreview = getRecipePreview;
exports.getRecipeFullPreview = getRecipeFullPreview;
exports.getRecipeFullPreviewDB = getRecipeFullPreviewDB;
exports.getRecipePreviewDB = getRecipePreviewDB;