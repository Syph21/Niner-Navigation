export interface EdgeFlags {
  hasStairs: boolean
  hasRamp: boolean
  isCovered: boolean
  hasElevator: boolean
}

export interface Edge {
  id: string
  start: { lat: number; lng: number }
  end: { lat: number; lng: number }
  distance: number
  flags: EdgeFlags
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  waypoint: { lat: number; lng: number }
}

export interface RouteResult {
  path: { lat: number; lng: number }[]
  totalDistance: number
  totalDuration: number
  steps: RouteStep[]
}

export const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * A* Search Algorithm on walkway graph
 * Finds the shortest path from start to goal
 */
export const findRoute = (
  startLat: number,
  startLng: number,
  goalLat: number,
  goalLng: number,
  edges: Edge[],
  avoidStairs: boolean = false,
  preferRamps: boolean = false,
  useElevators: boolean = true
): RouteResult => {
  const adjacencyMap = new Map<string, Edge[]>()
  edges.forEach(edge => {
    const startKey = `${edge.start.lat},${edge.start.lng}`
    const endKey = `${edge.end.lat},${edge.end.lng}`
    if (!adjacencyMap.has(startKey)) adjacencyMap.set(startKey, [])
    if (!adjacencyMap.has(endKey)) adjacencyMap.set(endKey, [])
    adjacencyMap.get(startKey)!.push(edge)
    adjacencyMap.get(endKey)!.push(edge)
  })

  const isAccessible = (edge: Edge) => {
    if (avoidStairs && edge.flags.hasStairs) return false
    if (edge.flags.hasRamp) return true
    if (edge.flags.hasElevator) return useElevators
    return true
  }

  const startKey = `${startLat},${startLng}`
  const goalKey = `${goalLat},${goalLng}`
  const openSet: Array<{ key: string; g: number; f: number; parent: string | null; edge: Edge | null }> = []
  const closedSet = new Set<string>()
  openSet.push({ key: startKey, g: 0, f: haversine(startLat, startLng, goalLat, goalLng), parent: null, edge: null })
  const cameFrom = new Map<string, string>()
  const gScore = new Map<string, number>()
  gScore.set(startKey, 0)
  let found = false

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!
    if (current.key === goalKey) { found = true; break }
    closedSet.add(current.key)
    const neighbors = adjacencyMap.get(current.key) || []
    for (const neighbor of neighbors) {
      if (!isAccessible(neighbor)) continue
      const tentativeG = current.g + neighbor.distance
      const neighborKey = `${neighbor.start.lat},${neighbor.start.lng}`
      if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)!) {
        cameFrom.set(neighborKey, current.key)
        gScore.set(neighborKey, tentativeG)
        openSet.push({ key: neighborKey, g: tentativeG, f: tentativeG + haversine(neighbor.end.lat, neighbor.end.lng, goalLat, goalLng), parent: current.key, edge: neighbor })
      }
    }
  }

  if (!found) return { path: [], totalDistance: 0, totalDuration: 0, steps: [] }

  // Reconstruct path
  const path: { lat: number; lng: number }[] = []
  const pathEdges: Edge[] = []
  let current = goalKey
  while (current !== startKey) {
    const parent = cameFrom.get(current)
    if (!parent) break
    const parentEdges = adjacencyMap.get(parent) || []
    const edge = parentEdges.find(e =>
      (e.start.lat === Number(current.split(',')[0]) || e.end.lat === Number(current.split(',')[0])))
    if (edge) {
      pathEdges.unshift(edge)
      path.unshift({ lat: edge.start.lat, lng: edge.start.lng })
    }
    current = parent
  }

  const totalDistance = pathEdges.reduce((sum, edge) => sum + edge.distance, 0)
  const totalDuration = totalDistance / 1.4 // 1.4 m/s walking speed
  const steps: RouteStep[] = []
  for (let i = 0; i < pathEdges.length; i++) {
    const edge = pathEdges[i]
    let instruction = 'Continue straight'
    if (edge.flags.hasElevator) instruction = 'Take elevator'
    else if (edge.flags.hasRamp) instruction = 'Continue on ramp'
    else if (edge.flags.hasStairs) instruction = 'Take stairs'
    steps.push({
      instruction,
      distance: edge.distance,
      duration: edge.distance / 1.4,
      waypoint: edge.end,
    })
  }

  return { path, totalDistance, totalDuration, steps }
}