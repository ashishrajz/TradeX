import toast from "react-hot-toast";

function RunStrategyButton({ symbol, price }) {
  const runStrategy = async () => {
    try {
      const res = await fetch("/api/strategy/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, price }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Error: " + data);
        return;
      }

      toast.success(
        `Decision: ${data.action} ${data.quantity || ""} ${symbol}`
      );
    } catch (err) {
      toast.error("Run failed: " + err.message);
    }
  };

  return (
    <button
      onClick={runStrategy}
      className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-2xl transition"
    >
      Get Strategy Decision
    </button>
  );
}

export default RunStrategyButton;
