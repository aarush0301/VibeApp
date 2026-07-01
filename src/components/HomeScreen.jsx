import PlanCard from './PlanCard.jsx'

function HomeScreen({ plans, onOpenPlan }) {
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <h1 style={{
        fontSize: "22px",
        fontWeight: "700",
        marginBottom: "16px",
        color: "#1A1917"
      }}>
        Plans Near Me 🔥
      </h1>

      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onOpenPlan(plan)}
          style={{ cursor: "pointer" }}
        >
          <PlanCard plan={plan} />
        </div>
      ))}
    </div>
  )
}

export default HomeScreen