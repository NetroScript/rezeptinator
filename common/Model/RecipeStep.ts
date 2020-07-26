enum RecipeStepTypes {
  Normal,
  Baking,
  Cooking,
  Rest,
}

enum RecipeIconPositions {
  Top,
  List,
}

interface IRecipeStepIcon {
  icon: string;
  iconText: string;
  position: RecipeIconPositions;
}

interface IRecipeStep {
  readonly type: RecipeStepTypes;
  text: string;
  icon?: IRecipeStepIcon;
}
