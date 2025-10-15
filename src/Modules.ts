//import Mod_AdjustableOpacity          from "./modules/AdjustableOpacity/Module"; not needed
//import Mod_AlternatePageToolbarMenu   from "./modules/AlternatePageToolbarMenu/Module"; not really needed
import Mod_AlternativeRadialMenu      from "./modules/AlternativeRadialMenu/Module"; //Not Fully TEsted? Not really needed
//import Mod_AnimatedBackgroundLayer    from "./modules/AnimatedBackgroundLayer/Module"; Probaly Hard
//import Mod_AnimationDisable           from "./modules/AnimationDisable/Module"; So far hard
//import Mod_ArrowKeysMoveCanvas        from "./modules/ArrowKeysMoveCanvas/Module"; Not Tested
import Mod_AutoOpenInitiativeTracker  from "./modules/AutoOpenInitiativeTracker/Module"; //Working
import Mod_AutoPingNextToken          from "./modules/AutoPingNextToken/Module"; //Working
import Mod_AutoSelectNextToken        from "./modules/AutoSelectNextToken/Module"; //Working
import Mod_AutoSortInitiative         from "./modules/AutoSortInitiative/Module"; //Working one way or another
//import Mod_BulkMacro                  from "./modules/BulkMacro/Module"; //Button Missing
import Mod_CameraStartPosition        from "./modules/CameraStartPosition/Module"; // Not Currently Working
import Mod_ChangeIdWhenDuplicating    from "./modules/ChangeIdWhenDuplicating/Module"; //Not SUre What this is
import Mod_CharacterAvatarFromURL     from "./modules/CharacterAvatarFromURL/Module"; //Working
import Mod_CharacterIO                from "./modules/CharacterIO/Module"; // It Exists, not fully tested
import Mod_CharacterTokenModifier     from "./modules/CharacterTokenModifier/Module"; //Working
import Mod_ChromeUpdateChecker        from "./modules/ChromeUpdateChecker/Module"; //Working?
//import Mod_CounterTokenName           from "./modules/CounterTokenName/Module"; Not Needed, base feature
import Mod_CustomPathWidth            from "./modules/CustomPathWidth/Module"; //Not working
import Mod_DisablePlayerDrawings      from "./modules/DisablePlayerDrawings/Module"; //untested
//import Mod_DrawCurrentLayer           from "./modules/DrawCurrentLayer/Module"; Not tested
//import Mod_DuplicateButton            from "./modules/DuplicateButton/Module"; Not Neded
import Mod_HandoutImageFromURL        from "./modules/HandoutImageFromURL/Module"; //Working
import Mod_HidePlayerList             from "./modules/HidePlayerList/Module"; //Working
//import Mod_InitiativeAdvanceShortcut  from "./modules/InitiativeAdvanceShortcut/Module"; //Not Tested
import Mod_JukeboxIO                  from "./modules/JukeboxIO/Module"; //untested
//import Mod_LibreAudio                 from "./modules/LibreAudio/Module"; //Not Tested
import Mod_MacroGenerator             from "./modules/MacroGenerator/Module"; //Working 2014 OGL Tested
import Mod_MacroIO                    from "./modules/MacroIO/Module"; //Persumed Working
//import Mod_MiddleClickSelect          from "./modules/MiddleClickSelect/Module"; //Issues
//import Mod_MoveCameraToToken          from "./modules/MoveCameraToToken/Module"; //Issues
import Mod_NightMode                  from "./modules/NightMode/Module"; //untested
import Mod_PerformanceImprovements    from "./modules/PerformanceImprovements/Module"; //untested
//import Mod_RollAndApplyHitDice        from "./modules/RollAndApplyHitDice/Module"; //Button Missing
//import Mod_ScaleTokenNamesBySize      from "./modules/ScaleTokenNamesBySize/Module"; //Button Missing
import Mod_SetTableEntryAvatarByUrl   from "./modules/SetTableEntryAvatarByUrl/Module"; //Working
import Mod_Settings                   from "./modules/Settings/Module";// Working
import Mod_SheetTabApi                from "./modules/SheetTabApi/Module";//Working
import Mod_TableIO                    from "./modules/TableIO/Module"; //Working
//import Mod_TokenBarPositionAdjust     from "./modules/TokenBarPositionAdjust/Module"; //Not Tested
import Mod_TokenContextMenuApi        from "./modules/TokenContextMenuApi/Module"; //Issues, Other button based issue persumbed to be releated to this
import Mod_TokenFromImg               from "./modules/TokenFromImg/Module"; // Maybe Working? Button has issues
//import Mod_TokenLayerDrawing          from "./modules/TokenLayerDrawing/Module"; //Not Tested
import Mod_TokenResize                from "./modules/TokenResize/Module";//No Button
import Mod_ToolsMenu                  from "./modules/ToolsMenu/Module";//Working
import Mod_TransparentPaper           from "./modules/TransparentPaper/Module";//Working
import Mod_Welcome                    from "./modules/Welcome/Module";//Working
import Mod_UserscriptUpdateChecker    from "./modules/UserscriptUpdateChecker/Module";//Working

const VTTES_MODULES = [];
const add_module = (m) => VTTES_MODULES.push(m);

//add_module(Mod_AdjustableOpacity); not needed
//add_module(Mod_AlternatePageToolbarMenu);
add_module(Mod_AlternativeRadialMenu);
//add_module(Mod_AnimatedBackgroundLayer);
//add_module(Mod_AnimationDisable);
//add_module(Mod_ArrowKeysMoveCanvas);
add_module(Mod_AutoOpenInitiativeTracker);
add_module(Mod_AutoPingNextToken);
add_module(Mod_AutoSelectNextToken);
add_module(Mod_AutoSortInitiative);
//add_module(Mod_BulkMacro);
add_module(Mod_CameraStartPosition);
add_module(Mod_ChangeIdWhenDuplicating);
add_module(Mod_CharacterAvatarFromURL);
add_module(Mod_CharacterIO);
add_module(Mod_CharacterTokenModifier);

if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
  add_module(Mod_ChromeUpdateChecker);
}

if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
  add_module(Mod_UserscriptUpdateChecker);
}

//add_module(Mod_CounterTokenName); 
add_module(Mod_CustomPathWidth);
add_module(Mod_DisablePlayerDrawings);
//add_module(Mod_DrawCurrentLayer);
//add_module(Mod_DuplicateButton);
add_module(Mod_HandoutImageFromURL);
add_module(Mod_HidePlayerList);
//add_module(Mod_InitiativeAdvanceShortcut);
add_module(Mod_JukeboxIO);
//add_module(Mod_LibreAudio);
add_module(Mod_MacroGenerator);
add_module(Mod_MacroIO);
//add_module(Mod_MiddleClickSelect);
//add_module(Mod_MoveCameraToToken);
add_module(Mod_NightMode);
add_module(Mod_PerformanceImprovements);
//add_module(Mod_RollAndApplyHitDice);
//add_module(Mod_ScaleTokenNamesBySize);
add_module(Mod_SetTableEntryAvatarByUrl);
add_module(Mod_ToolsMenu);
add_module(Mod_Settings);
add_module(Mod_SheetTabApi);
add_module(Mod_TableIO);
//add_module(Mod_TokenBarPositionAdjust);
add_module(Mod_TokenFromImg);
//add_module(Mod_TokenLayerDrawing);
add_module(Mod_TokenResize);
add_module(Mod_TransparentPaper);
add_module(Mod_Welcome);
add_module(Mod_TokenContextMenuApi);

export { VTTES_MODULES };
