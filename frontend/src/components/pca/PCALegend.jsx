export default function PCALegend({ data }) {

  if (!data?.points) return null

  return (

    <div style={{ padding:20 }}>

      <h3>Users</h3>

      {data.points.map(p => (

        <div
          key={p.user_id}
          style={{
            display:"flex",
            justifyContent:"space-between",
            marginBottom:6
          }}
        >

          <span>{p.label}</span>

          <span>
            {p.is_current_user ? "YOU" : ""}
          </span>

        </div>

      ))}

    </div>

  )
}
