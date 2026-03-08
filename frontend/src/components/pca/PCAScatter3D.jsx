import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Text } from "@react-three/drei"
import PCAPoints from "./PCAPoints"

function Axes() {

  return (
    <group>

      {/* X Axis */}
      <mesh position={[1,0,0]}>
        <boxGeometry args={[2,0.01,0.01]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>

      {/* Y Axis */}
      <mesh position={[0,1,0]}>
        <boxGeometry args={[0.01,2,0.01]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>

      {/* Z Axis */}
      <mesh position={[0,0,1]}>
        <boxGeometry args={[0.01,0.01,2]} />
        <meshBasicMaterial color="#9333ea" />
      </mesh>

      {/* Labels */}

      <Text position={[1.2,0,0]} fontSize={0.1} color="#ff00ff">
        X
      </Text>

      <Text position={[0,1.2,0]} fontSize={0.1} color="#00ffff">
        Y
      </Text>

      <Text position={[0,0,1.2]} fontSize={0.1} color="#9333ea">
        Z
      </Text>

    </group>
  )
}

export default function PCAScatter3D({ data }) {

  if (!data?.points) {
    <div>No PCA Points Available</div>
  }

  return (

    <div style={{width:"100%",height:"100%"}}>

      <Canvas camera={{ position:[2,2,2], fov:60 }}>

        <color attach="background" args={["#050510"]} />

        <ambientLight intensity={0.6}/>
        <pointLight position={[10,10,10]}/>

        <Grid
          args={[8,8]}
          cellColor="#7c3aed"
          sectionColor="#9333ea"
          fadeDistance={12}
        />

        <Axes />

        <PCAPoints points={data.points}/>

        <OrbitControls
          autoRotate
          autoRotateSpeed={1.6}
          enableZoom={true}
          enablePan={true}
        />

      </Canvas>

    </div>

  )
}
