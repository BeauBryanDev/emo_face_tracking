import { useState, useRef } from "react"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"


function RadarPulse() {

  const ref = useRef()

  useFrame(({ clock }) => {

    const t = clock.getElapsedTime()

    const scale = 1 + Math.sin(t * 2) * 0.4

    if (ref.current) {

      ref.current.scale.set(scale, scale, scale)
      ref.current.material.opacity = 0.35 + Math.sin(t * 2) * 0.15

    }

  })

  return (

    <mesh ref={ref}>

      <sphereGeometry args={[0.12,16,16]} />

      <meshBasicMaterial
        color="#00ff9f"
        transparent
        opacity={0.4}
      />

    </mesh>

  )

}


export default function PCAPoints({ points }) {

  const [hovered,setHovered] = useState(null)

  return (

    <group>

      {points.map((p,i)=>{

        const color = p.is_current_user
          ? "#00ff9f"
          : "#a855f7"

        return (

          <group key={i} position={[p.x,p.y,p.z]}>

            {/* Punto PCA */}

            <mesh
              onPointerOver={()=>setHovered(i)}
              onPointerOut={()=>setHovered(null)}
            >

              <sphereGeometry args={[0.05,16,16]} />

              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
              />

            </mesh>

            {/* Pulso radar */}

            {p.is_current_user && <RadarPulse />}

            {/* Hover label */}

            {hovered === i && (

              <Html>

                <div style={{
                  background:"#050510",
                  border:"1px solid #9333ea",
                  padding:"6px 10px",
                  color:"#fff",
                  fontSize:"12px",
                  borderRadius:"4px"
                }}>

                  {p.label}

                </div>

              </Html>

            )}

          </group>

        )

      })}

    </group>


  )
}
