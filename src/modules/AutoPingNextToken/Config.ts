// autoPingNextToken.config.ts

import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "autoPingNextToken",
  name: "Ping Next Token in Turn Order",
  // Updated description to reflect the new event-based approach
  description: "When the turn order changes, this module automatically pings the token whose turn it is, but only if it's on the player token layer.",
  category: VTTES.Module_Category.initiative,
  gmOnly: true,

  media: {
    "ping_token.webm": "Automated pinging"
  },

  // The 'mods' section is no longer needed and has been removed.
  // The module will now use event listeners instead of patching the VTT's code.
};