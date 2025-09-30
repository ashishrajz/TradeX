// src/app/strategy/backtest/page.js
import BacktestForm from "@/components/BacktestForm";

export default function BacktestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Backtest</h1>
      <div className="bg-white p-4 rounded shadow">
        <BacktestForm />
      </div>
    </div>
  );
}
