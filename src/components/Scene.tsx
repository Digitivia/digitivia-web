import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import * as THREE from 'three'
import ScentField from './ScentField'
import Bottle from './Bottle'
import { prefersReduced } from '../lib/motion'

/**
 * One fixed WebGL layer behind the whole document: the air, the flacon, and
 * the lens. Everything the page does — scrolling, opening a product, adding to
 * the cart — reaches it through `sceneState`, never through props.
 *
 * The environment is built from lightformers rather than an HDR file: no
 * network request, nothing new in the CSP, and full control over where the
 * highlights land on the glass.
 */
export default function Scene() {
  const reduced = prefersReduced()

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, reduced ? 1 : 1.6]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0, 6.4], fov: 42 }}
      >
        <ScentField reduced={reduced} />

        {/* The source is a floor light *behind* the flacon, not a lamp inside
            it: lighting glass from directly underneath makes it read as a
            lantern. What sells it as glass is the pair of side highlights the
            lightformers draw, so those carry the exposure. */}
        <pointLight position={[0.4, -1.9, -1.4]} intensity={3.2} color="#ff8a45" distance={8} />
        <pointLight position={[2.6, 2.4, 2.6]} intensity={2.2} color="#ffd9b0" distance={12} />

        <Bottle reduced={reduced} />

        <Environment resolution={128} frames={1} environmentIntensity={0.85}>
          {/* two narrow strips: these are the long highlights that run down the
              edges of the flacon and do most of the work of reading as glass */}
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#ffcda0"
            position={[-3.4, 0.3, 1.4]}
            scale={[1.1, 6, 1]}
            rotation={[0, Math.PI / 2.2, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#ffe9d2"
            position={[3.4, 0.6, 1.4]}
            scale={[0.8, 6, 1]}
            rotation={[0, -Math.PI / 2.2, 0]}
          />
          {/* a low ember behind, so the base has warmth without becoming a bulb */}
          <Lightformer form="circle" intensity={1.6} color="#ff6a2a" position={[0, -2.6, -1.6]} scale={[3, 3, 1]} />
          {/* one cold rim from above and behind, so the warm reads as warm */}
          <Lightformer
            form="rect"
            intensity={0.2}
            color="#8fb9c4"
            position={[0, 3.4, -3.4]}
            scale={[6, 2, 1]}
            rotation={[Math.PI / 2.4, 0, 0]}
          />
        </Environment>

        {!reduced && (
          <EffectComposer multisampling={4}>
            {/* selective by construction: only what the shader and the emissive
                juice push past the threshold blooms, so copy never smears */}
            <Bloom
              intensity={0.95}
              luminanceThreshold={0.88}
              luminanceSmoothing={0.28}
              kernelSize={KernelSize.LARGE}
              mipmapBlur
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0007, 0.0009)}
              radialModulation
              modulationOffset={0.35}
              blendFunction={BlendFunction.NORMAL}
            />
            <Vignette offset={0.28} darkness={0.72} eskil={false} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
