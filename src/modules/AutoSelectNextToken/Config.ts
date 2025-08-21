import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoSelectNextToken",
  name: "Select Token",
  description: "When advancing initiative, this module will automatically select the next token in the initiative order.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "select_token.webm": "Automated token selection"
  },

  // The 'mods' section is removed for stability and maintainability.
}