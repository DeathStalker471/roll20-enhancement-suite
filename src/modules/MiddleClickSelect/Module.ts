import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";
import {layerInfo } from "../../utils/LayerInfo";

class MiddleClickSelectModule extends R20Module.OnAppLoadBase {
  constructor() {
    super(__dirname);
  }

  on_click = (e: any) => {
    const objs = R20.getCurrentPageTokens();
    const cfg: any = this.getHook().config;

    if(e.button !== cfg.mouseButtonIndex) return;

    if (typeof (window as any).r20es_set_layer !== "function") {
       console.warn("VTTES: Layer switch function not initialized by Roll20 yet. Try switching layers manually once.");
       return; 
    }

    if(cfg.modAlt && !window.r20es.keys.altDown) return;
    if(cfg.modShift && !window.r20es.keys.shiftDown) return;
    if(cfg.modCtrl && !window.r20es.keys.ctrlDown) return;
    if(cfg.modMeta && !window.r20es.keys.metaDown) return;

    let idx = objs.length;

    while(idx-- > 0) {
      const obj = objs[idx];

      const model = R20.try_get_canvas_object_model(obj);
      if(!model) {
        continue;
      }

      if(R20.doesTokenContainMouse(e, obj) && model) {
        //console.log("Found containing object:");
        //console.log(obj);

        const layer = model.get<R20.CanvasLayer>("layer");

             if(layer === R20.CanvasLayer.GMTokens &&         !cfg.switchToGmLayer) continue;
        else if(layer === R20.CanvasLayer.PlayerTokens &&     !cfg.switchToTokenLayer) continue;
        else if(layer === R20.CanvasLayer.Map &&              !cfg.switchToMapLayer) continue;
        else if(layer === R20.CanvasLayer.Lighting &&         !cfg.switchToLightsLayer) continue;
        else if(layer === R20.CanvasLayer.B20Foreground &&    !cfg.switchToForegroundLayer) continue;
        else if(layer === R20.CanvasLayer.B20Weather   &&     !cfg.switchToWeatherLayer) continue;
        else if(layer === R20.CanvasLayer.B20Background &&    !cfg.switchToBackgroundLayer) continue;

        if(R20.getCurrentLayer() !== layer) {
          console.log(`SWITCH to ${layer}`);

          window.r20es_set_layer(layer);
        }

        if(cfg.select) {
          R20.selectToken(obj);
        }

        break;
      }
    }
  };

  setup() {
    if (!R20.isGM()) return;

    // Initialize the global variable as a no-op so 'typeof' checks pass 
    // and calls don't throw "is not a function" errors.
    if (!(window as any).r20es_set_layer) {
        (window as any).r20es_set_layer = () => {
            console.log("VTTES: Hook registered but VTT engine hasn't connected yet.");
        };
    }

    document.addEventListener("pointerup", this.on_click);
  }

  dispose() {
    super.dispose();

    document.removeEventListener("pointerup", this.on_click);
  }
}

export default () => {
  new MiddleClickSelectModule().install();
};

