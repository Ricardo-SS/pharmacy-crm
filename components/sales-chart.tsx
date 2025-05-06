"use client"

import { useEffect, useState } from "react"

export default function SalesChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    values: [],
  })

  useEffect(() => {
    // Em uma aplicação real, esses dados viriam de uma API
    // Aqui estamos gerando dados de exemplo
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const hoje = new Date().getDay() // 0 é domingo, 6 é sábado

    // Gerar últimos 7 dias
    const labels = []
    for (let i = 6; i >= 0; i--) {
      const diaSemanaIndex = (hoje - i + 7) % 7
      labels.push(diasSemana[diaSemanaIndex])
    }

    // Gerar valores aleatórios de vendas para cada dia
    const values = labels.map(() => Math.floor(Math.random() * 30) + 10)

    setChartData({ labels, values })
  }, [])

  // Encontrar o valor máximo para definir a altura do gráfico
  const maxValue = Math.max(...chartData.values, 20)

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-44 gap-1">
        {chartData.labels.map((label, index) => {
          const height = (chartData.values[index] / maxValue) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
              <div className="text-xs mt-2">{label}</div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-4">
        <div>Última semana</div>
        <div>{chartData.values.reduce((a, b) => a + b, 0)} vendas</div>
      </div>
    </div>
  )
}
