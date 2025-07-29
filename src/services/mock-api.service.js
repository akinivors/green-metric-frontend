// src/services/mock-api.service.js

const mockTransportationMetrics = [
  { id: 1, description: 'Total Parking Spaces for Cars', metric_value: '1,200' },
  { id: 2, description: 'Total Parking Spaces for Motorcycles', metric_value: '250' },
  { id: 3, description: 'Number of Campus Entrances', metric_value: '4' },
]

// Expanded mock data for historical vehicle entries
let mockHistoricalVehicleData = Array.from({ length: 28 }, (_, i) => {
  const date = new Date(2025, 6, 28 - i)
  return {
    id: i + 1,
    entryDate: date.toISOString().substring(0, 10),
    publicTransportCount: 150 + Math.floor(Math.random() * 20) - 10,
    privateVehicleCount: 800 + Math.floor(Math.random() * 50) - 25,
    zevCount: 50 + Math.floor(Math.random() * 10) - 5,
    submittedBy: i % 2 === 0 ? 'security_user1' : 'security_user2',
  }
})

export function fetchVehicleMetrics() {
  console.log('MOCK API: Fetching vehicle metrics...')
  return new Promise((resolve) => setTimeout(() => resolve(mockTransportationMetrics), 500))
}

// NEW function to simulate fetching historical entries with filtering and pagination
export function fetchVehicleEntries({ startDate, endDate, page = 1, limit = 10 }) {
  console.log(`MOCK API: Fetching vehicle entries for page ${page} with filters:`, {
    startDate,
    endDate,
  })

  let filteredData = mockHistoricalVehicleData

  if (startDate) {
    filteredData = filteredData.filter((d) => new Date(d.entryDate) >= new Date(startDate))
  }
  if (endDate) {
    filteredData = filteredData.filter((d) => new Date(d.entryDate) <= new Date(endDate))
  }

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / limit)
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: paginatedData,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      })
    }, 700)
  })
}

export function submitVehicleLog(logData) {
  console.log('MOCK API: Submitting vehicle log:', logData)
  // Add the new entry to the start of our mock data array
  const newEntry = {
    id: mockHistoricalVehicleData.length + 1,
    ...logData,
    submittedBy: 'current_admin', // Simulate who submitted
  }
  mockHistoricalVehicleData.unshift(newEntry)

  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, savedData: newEntry }), 500),
  )
}

export function updateVehicleMetric(updatedMetric) {
  console.log('MOCK API: Updating vehicle metric:', updatedMetric)

  const index = mockTransportationMetrics.findIndex((m) => m.id === updatedMetric.id)
  if (index !== -1) {
    mockTransportationMetrics[index] = updatedMetric
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, updatedData: updatedMetric })
    }, 500)
  })
}

// --- NEW Mock Data for Water Consumption ---
const mockWaterMetrics = [
  {
    id: 4,
    description: 'Total campus area for water absorption',
    metric_value: '25000',
    metric_unit: 'm²',
  },
  {
    id: 5,
    description: 'Number of water recycling facilities',
    metric_value: '2',
    metric_unit: 'facilities',
  },
]

let mockHistoricalWaterData = [
  {
    id: 1,
    period_start_date: '2025-06-01',
    period_end_date: '2025-06-30',
    unitId: 2,
    unitName: 'Engineering Building',
    consumption_ton: 5000,
    recycled_water_usage_liters: 1500,
    treated_water_consumption_liters: 1200,
    submittedBy: 'bina_gorevlisi_1',
  },
  {
    id: 2,
    period_start_date: '2025-06-01',
    period_end_date: '2025-06-30',
    unitId: 3,
    unitName: 'Science Building',
    consumption_ton: 4500,
    recycled_water_usage_liters: 1300,
    treated_water_consumption_liters: 1100,
    submittedBy: 'bina_gorevlisi_2',
  },
  {
    id: 3,
    period_start_date: '2025-05-01',
    period_end_date: '2025-05-31',
    unitId: 2,
    unitName: 'Engineering Building',
    consumption_ton: 4800,
    recycled_water_usage_liters: 1400,
    treated_water_consumption_liters: 1150,
    submittedBy: 'bina_gorevlisi_1',
  },
]

// --- NEW Functions for Water Consumption ---
export function fetchWaterMetrics() {
  console.log('MOCK API: Fetching water metrics...')
  return new Promise((resolve) => setTimeout(() => resolve(mockWaterMetrics), 500))
}

export function fetchWaterEntries({ startDate, endDate, page = 1, limit = 10 }) {
  console.log(`MOCK API: Fetching water entries for page ${page} with filters:`, {
    startDate,
    endDate,
  })

  let filteredData = mockHistoricalWaterData
  if (startDate) {
    filteredData = filteredData.filter((d) => new Date(d.period_end_date) >= new Date(startDate))
  }
  if (endDate) {
    filteredData = filteredData.filter((d) => new Date(d.period_start_date) <= new Date(endDate))
  }

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / limit)
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: paginatedData,
        pagination: { page, limit, totalItems, totalPages },
      })
    }, 700)
  })
}

export function submitWaterLog(logData) {
  console.log('MOCK API: Submitting water log:', logData)
  const newEntry = {
    id: mockHistoricalWaterData.length + 1,
    ...logData,
    submittedBy: 'current_user',
  }
  mockHistoricalWaterData.unshift(newEntry)
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, savedData: newEntry }), 500),
  )
}

export function updateWaterMetric(updatedMetric) {
  console.log('MOCK API: Updating water metric:', updatedMetric)
  const index = mockWaterMetrics.findIndex((m) => m.id === updatedMetric.id)
  if (index !== -1) {
    mockWaterMetrics[index] = updatedMetric
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, updatedData: updatedMetric }), 500),
  )
}

// --- NEW Mock Data for Electricity ---
const mockElectricityMetrics = [
  { id: 6, description: 'Total solar panel capacity', metric_value: '500', metric_unit: 'kWp' },
  {
    id: 7,
    description: 'Number of buildings with smart lighting',
    metric_value: '5',
    metric_unit: '',
  },
]

let mockHistoricalElectricityData = [
  {
    id: 1,
    periodStartDate: '2025-06-01',
    periodEndDate: '2025-06-30',
    unitId: 2,
    unitName: 'Engineering Building',
    consumptionKwh: 75000,
    submittedByUsername: 'bina_gorevlisi_1',
  },
  {
    id: 2,
    periodStartDate: '2025-06-01',
    periodEndDate: '2025-06-30',
    unitId: 3,
    unitName: 'Science Building',
    consumptionKwh: 68000,
    submittedByUsername: 'bina_gorevlisi_2',
  },
  {
    id: 3,
    periodStartDate: '2025-05-01',
    periodEndDate: '2025-05-31',
    unitId: 2,
    unitName: 'Engineering Building',
    consumptionKwh: 72000,
    submittedByUsername: 'bina_gorevlisi_1',
  },
]

// --- NEW Functions for Electricity ---
export function fetchElectricityMetrics() {
  console.log('MOCK API: Fetching electricity metrics...')
  return new Promise((resolve) => setTimeout(() => resolve(mockElectricityMetrics), 500))
}

export function fetchElectricityEntries({ startDate, endDate, page = 1, limit = 10 }) {
  console.log(`MOCK API: Fetching electricity entries for page ${page} with filters:`, {
    startDate,
    endDate,
  })

  let filteredData = mockHistoricalElectricityData
  if (startDate) {
    filteredData = filteredData.filter((d) => new Date(d.periodEndDate) >= new Date(startDate))
  }
  if (endDate) {
    filteredData = filteredData.filter((d) => new Date(d.periodStartDate) <= new Date(endDate))
  }

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / limit)
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: paginatedData,
        pagination: { page, limit, totalItems, totalPages },
      })
    }, 700)
  })
}

export function submitElectricityLog(logData) {
  console.log('MOCK API: Submitting electricity log:', logData)
  const newEntry = {
    id: mockHistoricalElectricityData.length + 1,
    ...logData,
    submittedByUsername: 'current_user',
  }
  mockHistoricalElectricityData.unshift(newEntry)
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, savedData: newEntry }), 500),
  )
}

export function updateElectricityMetric(updatedMetric) {
  console.log('MOCK API: Updating electricity metric:', updatedMetric)
  const index = mockElectricityMetrics.findIndex((m) => m.id === updatedMetric.id)
  if (index !== -1) {
    mockElectricityMetrics[index] = updatedMetric
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, updatedData: updatedMetric }), 500),
  )
}

// ============ WASTE DATA MOCK API ============

const mockWasteMetrics = [
  {
    id: 8,
    description: 'Number of composting sites on campus',
    metric_value: '3',
    metric_unit: 'sites',
  },
  { id: 9, description: 'Total waste bins on campus', metric_value: '150', metric_unit: 'bins' },
  { id: 10, description: 'Recycling stations', metric_value: '25', metric_unit: 'stations' },
]

// Mock historical waste data
let mockHistoricalWasteData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 6, 29 - i)
  return {
    id: i + 1,
    dataDate: date.toISOString().substring(0, 10),
    organicProductionKg: 450 + Math.floor(Math.random() * 100),
    organicConsumptionKg: 300 + Math.floor(Math.random() * 80),
    organicTreatedKg: 280 + Math.floor(Math.random() * 60),
    inorganicProductionKg: 200 + Math.floor(Math.random() * 50),
    inorganicConsumptionKg: 150 + Math.floor(Math.random() * 40),
    inorganicRecycledKg: 120 + Math.floor(Math.random() * 30),
    toxicWasteKg: 8 + Math.floor(Math.random() * 5),
    treatedToxicWasteKg: 6 + Math.floor(Math.random() * 3),
    sewageDisposalLiters: 2000 + Math.floor(Math.random() * 500),
    submittedByUsername:
      i % 3 === 0 ? 'yemekhane_user1' : i % 3 === 1 ? 'yemekhane_user2' : 'admin_user',
  }
})

export function fetchWasteMetrics() {
  console.log('MOCK API: Fetching waste metrics...')
  return new Promise((resolve) => setTimeout(() => resolve(mockWasteMetrics), 400))
}

export function fetchWasteEntries({ startDate, endDate, page = 1, limit = 10 }) {
  console.log(`MOCK API: Fetching waste entries for page ${page} with filters:`, {
    startDate,
    endDate,
  })

  let filteredData = mockHistoricalWasteData
  if (startDate) {
    filteredData = filteredData.filter((d) => new Date(d.dataDate) >= new Date(startDate))
  }
  if (endDate) {
    filteredData = filteredData.filter((d) => new Date(d.dataDate) <= new Date(endDate))
  }

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / limit)
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: paginatedData,
        pagination: { page, limit, totalItems, totalPages },
      })
    }, 600)
  })
}

export function submitWasteLog(logData) {
  console.log('MOCK API: Submitting waste log:', logData)
  const newEntry = {
    id: mockHistoricalWasteData.length + 1,
    ...logData,
    submittedByUsername: 'current_user',
  }
  mockHistoricalWasteData.unshift(newEntry)
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, savedData: newEntry }), 500),
  )
}

export function updateWasteMetric(updatedMetric) {
  console.log('MOCK API: Updating waste metric:', updatedMetric)
  const index = mockWasteMetrics.findIndex((m) => m.id === updatedMetric.id)
  if (index !== -1) {
    mockWasteMetrics[index] = updatedMetric
  }
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, updatedData: updatedMetric }), 500),
  )
}
