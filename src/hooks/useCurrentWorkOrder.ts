import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"

export function useCurrentWorkOrder() {
  const { id } = useParams<{ id: string }>()
  const { getWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(id ?? "")
  return { workOrder, workOrderId: id ?? "" }
}
