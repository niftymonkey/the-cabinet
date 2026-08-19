# The base is the create-pixi creation-web template, and React is out

The app's base is the create-pixi `creation-web` template, and React left the stack: all UI is in-canvas through the template's screens and @pixi/ui. Chosen over `bundler-vite` (near-empty) and `framework-react` (a per-entity @pixi/react pattern fights a bullet-heaven field); the template brings screen navigation, letterbox resize, an audio plugin with persistent settings, a UI kit, and an AssetPack pipeline the Halloween art pass will need.

Standing rule recorded with the decision: when tooling ships an official scaffold, the scaffold is generated first and our code fits inside it; its patterns and tooling are the defaults, adjusted only when necessary, never bolted on at the end.

Decision log entry 7.
