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

async function getRecipeFullPreviewDB(recipeId, recipeFromDB, likesFromDB) {
    const { title, time_in_minutes, image_url, vegan, vegetarian, gluten_free, instructions, servings, extendedIngredients, analyzedInstructions } = recipeFromDB;
    const _analyzedInstructions = await mapInstructions(instructions);
    return {
        id: parseInt(recipeId),
        image: image_url,
        title: title,
        readyInMinutes: time_in_minutes,
        aggregateLikes: likesFromDB,
        vegetarian: vegetarian === 1 ? true : false,
        vegan: vegan === 1 ? true : false,
        glutenFree: gluten_free === 1 ? true : false, 
        instructions: instructions,
        analyzedInstructions: JSON.parse(analyzedInstructions),
        extendedIngredients: JSON.parse(extendedIngredients),
        servings: servings,
    }
}

async function getRecipePreviewDB(recipeId, recipeFromDB, likesFromDB, favorite) {
    const { title, time_in_minutes, image_url, vegan, vegetarian, gluten_free} = recipeFromDB;
    return {
        id: parseInt(recipeId),
        image: image_url,
        title: title,
        readyInMinutes: time_in_minutes,
        aggregateLikes: likesFromDB,
        vegetarian: vegetarian === 1 ? true : false,
        vegan: vegan === 1 ? true : false,
        glutenFree: gluten_free === 1 ? true : false,
        isFavorite: favorite,
      };
}

async function mapRecipeCreated(recipe, recipeId, recipeUserName){
    if(!recipe.analyzedInstructions){
        recipe.analyzedInstructions = [];
    }   
    recipe.extendedIngredients = await mapIngredients(recipe.extendedIngredients);
    const { title, readyInMinutes, summary, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, analyzedInstructions, extendedIngredients, servings } = recipe;
    return {
        user_name:recipeUserName,
        id: recipeId,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: aggregateLikes,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree, 
        summary: summary,
        analyzedInstructions: analyzedInstructions,
        instructions: instructions,
        extendedIngredients: extendedIngredients,
        servings: servings,
    }
}

async function mapIngredients(ingredients){
    return ingredients.map(
        (ingredient, index) => {
          return {
            id: index + 1, // Assigning a dummy id based on index
            aisle: "", // Default empty
            image: "", // Default empty
            consistency: "", // Default empty
            name: ingredient.name,
            nameClean: "", // Default empty
            original: `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`,
            originalName: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            meta: [], // Default empty
            measures: {
              us: {
                amount: ingredient.amount,
                unitShort: ingredient.unit,
                unitLong: "", // You can define it based on the unit
              },
              metric: {
                amount: ingredient.amount,
                unitShort: "", // You can define it based on the unit
                unitLong: "", // You can define it based on the unit
              },
            },
          };
        }
      );
}
async function mapInstructions(instructions){}

exports.getRecipePreview = getRecipePreview;
exports.getRecipeFullPreview = getRecipeFullPreview;
exports.getRecipeFullPreviewDB = getRecipeFullPreviewDB;
exports.getRecipePreviewDB = getRecipePreviewDB;
exports.mapRecipeCreated = mapRecipeCreated;
