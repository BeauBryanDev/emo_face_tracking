import PCAScatter3D from "./PCAScatter3D"
import PCAVarianceSpectrum from "./PCAVarianceSpectrum"
import PCACumulativeVariance from "./PCACumulativeVariance"


import PCALegend from "./PCALegend"
import PCACumulativeVarianceHUD from "./PCACumulativeVarianceHUD"


export default function PCAInteligencePanel({ data }) {

  if (!data) return null

  const explained = data.total_variance || 0
  const sessions = data.total_points || 0

  return (

    <div style={{ padding:20 }}>

      <h3>PCA Intelligence</h3>

      <p>
        Sessions analyzed:
        <strong> {sessions}</strong>
      </p>

      <p>
        Variance explained by first 3 components:
        <strong> {(explained * 100).toFixed(2)}%</strong>
      </p>

      <p>
        Embedding dimension:
        <strong> {data.embedding_dims}</strong>
      </p>

      <p>
        PCA compresses emotional embeddings
        into a 3D manifold for visualization.
      </p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"12px",
        marginTop:"16px"
      }}>

        <PCALegend data={data} />

        <PCACumulativeVarianceHUD data={data} />

      </div>


    </div>

  )
}

