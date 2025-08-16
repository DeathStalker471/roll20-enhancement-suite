import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "exposeD20",
  name: "Expose D20",
  description: "",
  category: VTTES.Module_Category.misc,
  force: true,

  mods: [
    {
      includes: "vtt.bundle",

      find_replace: [
        {
          find: `/development$/.test(d20.environment)&&(window.debug_d20=d20);`,
          replace: `/development$/.test(d20.environment)&&(window.debug_d20=d20);window.d20=d20;`,
        },
      ],
    },
  ],
};
