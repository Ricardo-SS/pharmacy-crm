import { Card, CardContent } from "@/components/ui/card"

export default function InfoCard({ title, value, description, icon, trend }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-full">{icon}</div>
        </div>
        {trend && <div className="text-xs text-gray-500 mt-4 font-medium">{trend}</div>}
      </CardContent>
    </Card>
  )
}
